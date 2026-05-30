// analyze.js - vision + text analysis via configurable LLM provider (same prompts/pipeline)

import { AUDIT_ANALYSIS_ESTIMATED_INPUT_TOKENS, AUDIT_ANALYSIS_MAX_TOKENS } from "../config.js";
import { getLlmConfig, getLlmProvider, getPrimaryModelName } from "../llm/index.js";
import {
  EMPTY_SECTION_RESULT,
  normalizeSectionResult,
  parseSectionAuditJson
} from "../llm/shared.js";
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

export { getPrimaryModelName as MODEL };

const VALID_SITE_TYPES = new Set([
  "saas",
  "ecommerce",
  "landing-page",
  "blog",
  "portfolio",
  "unknown"
]);

function resolveModel(sectionLabel, options = {}) {
  const { models } = getLlmConfig();
  const profile = classifySectionProfile(
    sectionLabel,
    options.sectionIndex ?? 0,
    options.yStart ?? 0
  );
  return isPrioritySection(profile) ? models.primary : models.fast;
}

/**
 * @returns {Promise<import("../llm/shared.js").AnalysisImage|null>}
 */
async function prepareAnalysisImage(imageInput, isHero) {
  try {
    const prepared = await prepareImageForAnalysis(imageInput, { isHero });
    if (prepared) return prepared;
  } catch (prepError) {
    console.warn(
      `[analyzeSection] Image prep failed — using URL fallback:`,
      prepError?.message
    );
  }

  if (typeof imageInput === "string") {
    return { kind: "url", url: imageInput };
  }

  return null;
}

export async function detectSiteType(url, pageTitle) {
  const heuristic = detectSiteTypeFromUrl(url, pageTitle);
  if (isKnownSiteType(heuristic)) {
    return heuristic;
  }

  try {
    const { system, user } = buildSiteTypePrompt(url, pageTitle);
    const provider = getLlmProvider();
    const { models } = getLlmConfig();

    const { text } = await provider.completeText({
      system,
      user,
      model: models.fast,
      maxTokens: 20
    });

    const raw = text.trim().toLowerCase();
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

  const image = await prepareAnalysisImage(imageInput, isHero);
  if (!image) {
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
  const { provider: providerName } = getLlmConfig();

  let text = "";
  let inputTokens = AUDIT_ANALYSIS_ESTIMATED_INPUT_TOKENS;

  try {
    const provider = getLlmProvider();
    const response = await provider.completeVision({
      system,
      user,
      image,
      model,
      maxTokens: maxTokens ?? AUDIT_ANALYSIS_MAX_TOKENS
    });
    text = response.text;
    inputTokens = response.inputTokens ?? inputTokens;
  } catch (error) {
    console.error(
      `[analyzeSection] ${providerName} failed for ${sectionLabel} (${viewport}):`,
      error?.message || error
    );
    return EMPTY_SECTION_RESULT;
  }

  const parsed = parseSectionAuditJson(text);

  if (parsed === null) {
    console.error(
      `[analyzeSection] ${providerName} returned invalid JSON:`,
      text.slice(0, 500)
    );
    return { ...EMPTY_SECTION_RESULT, usage: { input_tokens: inputTokens } };
  }

  const result = normalizeSectionResult(parsed, profile);
  console.log(
    `[analyzeSection] ${sectionLabel} (${profile}, ${providerName}/${model}): score ${result.sectionScore ?? "—"}/100, ${result.issues.length} issue(s), ~${inputTokens} in tokens`
  );

  return { ...result, usage: { input_tokens: inputTokens } };
}

export default analyzeSection;
