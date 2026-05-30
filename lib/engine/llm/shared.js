import { AUDIT_ANALYSIS_MAX_ISSUES } from "../config.js";

export const EMPTY_SECTION_RESULT = {
  issues: [],
  sectionScore: null,
  positives: [],
  aboveFold: null
};

export function stripJsonFences(text) {
  return String(text || "")
    .replace(/```json|```/g, "")
    .trim();
}

export function parseSectionAuditJson(rawText) {
  const cleaned = stripJsonFences(rawText);

  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // fall through
  }

  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;

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

const NAV_HERO_ONLY_ISSUE_PATTERN =
  /value proposition|what (the )?(company|business) does|what (it|they) (does|do|offers)|cannot determine the product|within 5 seconds|cold visitor|zero explanation|product or service|does or offers|explain(s)? what .* does/i;

function filterMisclassifiedNavIssues(issues, profile) {
  if (profile !== "nav" || !issues?.length) return issues;

  return issues.filter((issue) => {
    const blob = `${issue.title || ""} ${issue.description || ""} ${issue.why || ""}`;
    if (issue.area === "clarity" && NAV_HERO_ONLY_ISSUE_PATTERN.test(blob)) {
      return false;
    }
    if (
      NAV_HERO_ONLY_ISSUE_PATTERN.test(blob) &&
      !/\b(nav|menu|link|header bar)\b/i.test(blob)
    ) {
      return false;
    }
    return true;
  });
}

export function normalizeSectionResult(parsed, profile = "default") {
  if (!parsed || typeof parsed !== "object") {
    return EMPTY_SECTION_RESULT;
  }

  const rawIssues = Array.isArray(parsed.issues) ? parsed.issues : [];
  const mapped = rawIssues.slice(0, AUDIT_ANALYSIS_MAX_ISSUES).map((issue) => ({
    ...issue,
    category: issue.category || issue.area || null,
    point_id: issue.point_id || null,
    area: issue.area || null
  }));
  const issues = filterMisclassifiedNavIssues(mapped, profile);

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

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isRateLimitError(error) {
  const message = String(error?.message || error || "");
  const status = error?.status ?? error?.statusCode;
  return (
    status === 429 ||
    message.includes("rate_limit") ||
    message.includes("429") ||
    message.toLowerCase().includes("quota")
  );
}

/**
 * @param {() => Promise<{ text: string, inputTokens?: number }>} fn
 */
export async function callWithRetry(fn, { providerName, maxRetries = 3 } = {}) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isRateLimitError(error) || attempt === maxRetries) {
        throw error;
      }

      const waitMs = Math.min(2000 * 2 ** attempt, 30_000);
      console.warn(
        `[LLM:${providerName}] Rate limited — retry ${attempt + 1}/${maxRetries} in ${Math.round(waitMs / 1000)}s`
      );
      await sleep(waitMs);
    }
  }

  throw lastError;
}

/**
 * @typedef {{ kind: 'base64', mediaType: string, data: string } | { kind: 'url', url: string }} AnalysisImage
 */

export function toAnthropicImageSource(image) {
  if (image.kind === "url") {
    return { type: "url", url: image.url };
  }
  return {
    type: "base64",
    media_type: image.mediaType,
    data: image.data
  };
}

export function toOpenAiImageUrl(image) {
  if (image.kind === "url") {
    return image.url;
  }
  return `data:${image.mediaType};base64,${image.data}`;
}

export function toGeminiInlineData(image) {
  if (image.kind === "url") {
    return { url: image.url };
  }
  return {
    inlineData: {
      mimeType: image.mediaType,
      data: image.data
    }
  };
}
