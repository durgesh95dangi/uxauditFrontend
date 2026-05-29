// claude.js - sends captured screenshot buffers to Claude Vision and parses structured findings

import Anthropic from "@anthropic-ai/sdk";
import {
  ANTHROPIC_MODEL,
  ANTHROPIC_MODEL_FAST,
  ANTHROPIC_WEB_SEARCH_ENABLED,
  ANTHROPIC_WEB_SEARCH_MAX_USES,
  AUDIT_ANALYSIS_ESTIMATED_INPUT_TOKENS,
  AUDIT_ANALYSIS_MAX_ISSUES,
  AUDIT_ANALYSIS_MAX_TOKENS
} from "../config.js";
import { prepareImageForAnalysis } from "./imagePrep.js";
import { buildSectionPrompt, buildSiteTypePrompt } from "./prompts.js";
import {
  detectSiteTypeFromUrl,
  isKnownSiteType
} from "./siteTypeHeuristic.js";
import {
  classifySectionProfile,
  isPrioritySection
} from "./sectionTypes.js";

export { ANTHROPIC_MODEL as MODEL };

const EMPTY_SECTION_RESULT = {
  issues: [],
  sectionScore: null,
  positives: [],
  aboveFold: null
};

let clientInstance = null;

function getClient() {
  if (clientInstance) return clientInstance;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY in environment");
  }

  clientInstance = new Anthropic({ apiKey });
  return clientInstance;
}

function getWebSearchTools() {
  if (!ANTHROPIC_WEB_SEARCH_ENABLED) {
    return undefined;
  }

  return [
    {
      type: "web_search_20250305",
      name: "web_search",
      max_uses: ANTHROPIC_WEB_SEARCH_MAX_USES
    }
  ];
}

function extractText(response) {
  if (!response?.content) return "";

  return response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}

function stripJsonFences(text) {
  return String(text || "")
    .replace(/```json|```/g, "")
    .trim();
}

function parseSectionAuditJson(rawText) {
  const cleaned = stripJsonFences(rawText);

  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // fall through to object extraction
  }

  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) {
    return null;
  }

  try {
    const parsed = JSON.parse(match[0]);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function normalizeAboveFold(raw) {
  if (!raw || typeof raw !== "object") return null;

  return {
    score:
      typeof raw.score === "number"
        ? Math.max(0, Math.min(100, Math.round(raw.score)))
        : null,
    vp_clear: typeof raw.vp_clear === "boolean" ? raw.vp_clear : null,
    vp_reason: raw.vp_reason ?? null,
    cta_visible: typeof raw.cta_visible === "boolean" ? raw.cta_visible : null,
    cta_copy: raw.cta_copy ?? null,
    top_risk: raw.top_risk ?? null
  };
}

function normalizeSectionResult(parsed) {
  if (!parsed || typeof parsed !== "object") {
    return EMPTY_SECTION_RESULT;
  }

  const rawIssues = Array.isArray(parsed.issues) ? parsed.issues : [];
  const issues = rawIssues.slice(0, AUDIT_ANALYSIS_MAX_ISSUES).map((issue) => ({
    ...issue,
    category: issue.category || issue.area || null,
    point_id: issue.point_id || null,
    area: issue.area || null
  }));

  return {
    issues,
    sectionScore:
      typeof parsed.section_score === "number"
        ? Math.max(0, Math.min(100, Math.round(parsed.section_score)))
        : null,
    positives: Array.isArray(parsed.positives) ? parsed.positives : [],
    aboveFold: normalizeAboveFold(parsed.above_fold)
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimitError(error) {
  const message = String(error?.message || error || "");
  return error?.status === 429 || message.includes("rate_limit");
}

async function callClaudeWithRetry(params, maxRetries = 3) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await getClient().messages.create(params);
    } catch (error) {
      lastError = error;
      if (!isRateLimitError(error) || attempt === maxRetries) {
        throw error;
      }

      const waitMs = Math.min(2000 * 2 ** attempt, 30_000);
      console.warn(
        `[Claude] Rate limited — retry ${attempt + 1}/${maxRetries} in ${Math.round(waitMs / 1000)}s`
      );
      await sleep(waitMs);
    }
  }

  throw lastError;
}

const VALID_SITE_TYPES = new Set([
  "saas",
  "ecommerce",
  "landing-page",
  "blog",
  "portfolio",
  "unknown"
]);

function resolveModel(sectionLabel, options = {}) {
  const profile = classifySectionProfile(
    sectionLabel,
    options.sectionIndex ?? 0,
    options.yStart ?? 0
  );
  return isPrioritySection(profile) ? ANTHROPIC_MODEL : ANTHROPIC_MODEL_FAST;
}

export async function detectSiteType(url, pageTitle) {
  const heuristic = detectSiteTypeFromUrl(url, pageTitle);
  if (isKnownSiteType(heuristic)) {
    return heuristic;
  }

  try {
    const { system, user } = buildSiteTypePrompt(url, pageTitle);

    const response = await callClaudeWithRetry({
      model: ANTHROPIC_MODEL_FAST,
      max_tokens: 20,
      system,
      messages: [{ role: "user", content: user }]
    });

    const raw = extractText(response).trim().toLowerCase();
    const cleaned = raw.split(/\s+/)[0]?.replace(/[^a-z-]/g, "") || "";

    return VALID_SITE_TYPES.has(cleaned) ? cleaned : "unknown";
  } catch {
    return "unknown";
  }
}

/**
 * @param {string|Buffer|null} imageInput - R2 URL or PNG buffer
 * @param {object} [analysisOptions]
 */
export async function analyzeSection(
  imageInput,
  sectionLabel,
  viewport,
  siteType,
  analysisOptions = {}
) {
  if (!imageInput) {
    return EMPTY_SECTION_RESULT;
  }

  const profile = classifySectionProfile(
    sectionLabel,
    analysisOptions.sectionIndex ?? 0,
    analysisOptions.yStart ?? 0
  );
  const isHero = profile === "hero" || analysisOptions.includeAboveFold === true;

  let source;
  try {
    source = await prepareImageForAnalysis(imageInput, { isHero });
  } catch (prepError) {
    console.warn(
      `[analyzeSection] Image prep failed for ${sectionLabel} — using URL:`,
      prepError?.message
    );
    if (typeof imageInput === "string") {
      source = { type: "url", url: imageInput };
    } else {
      return EMPTY_SECTION_RESULT;
    }
  }

  if (!source) {
    return EMPTY_SECTION_RESULT;
  }

  const { system, user, maxTokens } = buildSectionPrompt(
    sectionLabel,
    viewport,
    siteType,
    {
      includeAboveFold: analysisOptions.includeAboveFold === true,
      sectionIndex: analysisOptions.sectionIndex ?? 0,
      yStart: analysisOptions.yStart ?? 0
    }
  );

  const model = resolveModel(sectionLabel, analysisOptions);
  const tools = getWebSearchTools();

  let response;
  try {
    response = await callClaudeWithRetry({
      model,
      max_tokens: maxTokens ?? AUDIT_ANALYSIS_MAX_TOKENS,
      system,
      ...(tools ? { tools } : {}),
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source },
            { type: "text", text: user }
          ]
        }
      ]
    });
  } catch (error) {
    console.error(
      `[analyzeSection] Claude API call failed for ${sectionLabel} (${viewport}):`,
      error?.message || error
    );
    return EMPTY_SECTION_RESULT;
  }

  const searchCount = response?.usage?.server_tool_use?.web_search_requests ?? 0;
  if (searchCount > 0) {
    console.log(
      `[analyzeSection] ${sectionLabel}: used web search ${searchCount} time(s)`
    );
  }

  const inputTokens = response?.usage?.input_tokens ?? AUDIT_ANALYSIS_ESTIMATED_INPUT_TOKENS;

  const rawText = extractText(response);
  const parsed = parseSectionAuditJson(rawText);

  if (parsed === null) {
    console.error("Claude returned invalid JSON:", rawText.slice(0, 500));
    return { ...EMPTY_SECTION_RESULT, usage: { input_tokens: inputTokens } };
  }

  const result = normalizeSectionResult(parsed);
  console.log(
    `[analyzeSection] ${sectionLabel} (${model}): score ${result.sectionScore ?? "—"}/100, ${result.issues.length} issue(s), ~${inputTokens} in tokens`
  );

  return { ...result, usage: { input_tokens: inputTokens } };
}

export default analyzeSection;
