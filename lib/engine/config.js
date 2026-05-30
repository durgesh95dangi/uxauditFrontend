// config.js - shared constants for the audit engine pipeline

export const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 }
];

export const MAX_SECTIONS_PER_PAGE = 20;

export const ANALYSIS_TIMEOUT = 120000;

export const R2_BUCKET =
  process.env.R2_BUCKET_NAME || process.env.STORAGE_BUCKET;

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

function readInt(name, fallback) {
  const raw = process.env[name];
  if (raw == null || raw === "") return fallback;
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) ? value : fallback;
}

function readBool(name, fallback) {
  const raw = process.env[name];
  if (raw == null || raw === "") return fallback;
  return raw === "1" || raw.toLowerCase() === "true" || raw.toLowerCase() === "yes";
}

// Fast capture: parallel viewports, shorter waits, DOM-first section detect.
// Falls back to full scroll/retry when sections look incomplete.
export const AUDIT_FAST_CAPTURE = readBool("AUDIT_FAST_CAPTURE", true);
export const AUDIT_PARALLEL_VIEWPORTS = readBool(
  "AUDIT_PARALLEL_VIEWPORTS",
  AUDIT_FAST_CAPTURE
);

const fast = AUDIT_FAST_CAPTURE;

// Navigation + load tolerance (ms) — fast mode uses shorter defaults unless overridden in .env
export const AUDIT_NAV_TIMEOUT_MS = readInt("AUDIT_NAV_TIMEOUT_MS", fast ? 45000 : 90000);
export const AUDIT_NAV_RETRIES = readInt("AUDIT_NAV_RETRIES", 2);
export const AUDIT_LOAD_TIMEOUT_MS = readInt("AUDIT_LOAD_TIMEOUT_MS", fast ? 15000 : 30000);
export const AUDIT_NETWORK_IDLE_MS = readInt("AUDIT_NETWORK_IDLE_MS", fast ? 3000 : 10000);
export const AUDIT_SETTLE_MS = readInt("AUDIT_SETTLE_MS", fast ? 500 : 1200);
export const AUDIT_CONTENT_TIMEOUT_MS = readInt(
  "AUDIT_CONTENT_TIMEOUT_MS",
  fast ? 12000 : 20000
);
export const AUDIT_IMAGE_TIMEOUT_MS = readInt("AUDIT_IMAGE_TIMEOUT_MS", fast ? 6000 : 12000);
export const AUDIT_SECTION_IMAGE_TIMEOUT_MS = readInt(
  "AUDIT_SECTION_IMAGE_TIMEOUT_MS",
  fast ? 800 : 1200
);

// accept | reject — accept reveals full page content for UX review
export const AUDIT_COOKIE_STRATEGY =
  process.env.AUDIT_COOKIE_STRATEGY === "reject" ? "reject" : "accept";

// ─── LLM analysis (provider-specific models in lib/engine/llm/config.js) ───

export const ANTHROPIC_MODEL =
  process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
export const ANTHROPIC_MODEL_FAST =
  process.env.ANTHROPIC_MODEL_FAST || "claude-haiku-4-5";

export const ANTHROPIC_WEB_SEARCH_ENABLED = readBool(
  "ANTHROPIC_WEB_SEARCH_ENABLED",
  false
);
export const ANTHROPIC_WEB_SEARCH_MAX_USES = readInt(
  "ANTHROPIC_WEB_SEARCH_MAX_USES",
  3
);

export const AUDIT_ANALYSIS_MAX_TOKENS = readInt("AUDIT_ANALYSIS_MAX_TOKENS", 2000);
export const AUDIT_ANALYSIS_MAX_ISSUES = readInt("AUDIT_ANALYSIS_MAX_ISSUES", 8);
export const AUDIT_ANALYSIS_IMAGE_MAX_WIDTH = readInt(
  "AUDIT_ANALYSIS_IMAGE_MAX_WIDTH",
  1024
);
export const AUDIT_ANALYSIS_HERO_IMAGE_MAX_WIDTH = readInt(
  "AUDIT_ANALYSIS_HERO_IMAGE_MAX_WIDTH",
  1280
);
export const AUDIT_ANALYSIS_IMAGE_QUALITY = readInt("AUDIT_ANALYSIS_IMAGE_QUALITY", 85);
export const AUDIT_ANALYSIS_CONCURRENCY = readInt("AUDIT_ANALYSIS_CONCURRENCY", 3);
export const AUDIT_ANALYSIS_TOKEN_BUDGET_PER_MIN = readInt(
  "AUDIT_ANALYSIS_TOKEN_BUDGET_PER_MIN",
  28000
);
export const AUDIT_ANALYSIS_ESTIMATED_INPUT_TOKENS = readInt(
  "AUDIT_ANALYSIS_ESTIMATED_INPUT_TOKENS",
  4500
);
export const AUDIT_PARALLEL_ANALYSIS = readBool("AUDIT_PARALLEL_ANALYSIS", true);
export const AUDIT_PIPELINE_ANALYSIS = readBool("AUDIT_PIPELINE_ANALYSIS", true);
export const AUDIT_SKIP_MOBILE_FULL_PAGE = readBool(
  "AUDIT_SKIP_MOBILE_FULL_PAGE",
  true
);
