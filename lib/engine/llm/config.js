/**
 * LLM provider configuration.
 *
 * Set default provider in code via DEFAULT_LLM_PROVIDER, or override at runtime:
 *   LLM_PROVIDER=anthropic|openai|gemini
 *
 * Optional global model overrides (any provider):
 *   LLM_MODEL_PRIMARY
 *   LLM_MODEL_FAST
 */

/** @type {"anthropic"|"openai"|"gemini"} */
export const DEFAULT_LLM_PROVIDER = "anthropic";

export const SUPPORTED_LLM_PROVIDERS = ["anthropic", "openai", "gemini"];

const PROVIDER_MODEL_DEFAULTS = {
  anthropic: {
    primary: "claude-sonnet-4-6",
    fast: "claude-haiku-4-5"
  },
  openai: {
    primary: "gpt-4o",
    fast: "gpt-4o-mini"
  },
  gemini: {
    primary: "gemini-2.5-pro",
    fast: "gemini-2.5-flash"
  }
};

/** Gemini model IDs used when LLM_PROVIDER=gemini */
export const GEMINI_MODELS = {
  pro: "gemini-2.5-pro",
  flash: "gemini-2.5-flash"
};

function readProviderName() {
  const raw = (process.env.LLM_PROVIDER || DEFAULT_LLM_PROVIDER).trim().toLowerCase();
  if (!SUPPORTED_LLM_PROVIDERS.includes(raw)) {
    console.warn(
      `[LLM] Unknown LLM_PROVIDER "${raw}" — falling back to ${DEFAULT_LLM_PROVIDER}`
    );
    return DEFAULT_LLM_PROVIDER;
  }
  return raw;
}

function readModel(provider, tier) {
  const globalOverride =
    tier === "primary"
      ? process.env.LLM_MODEL_PRIMARY
      : process.env.LLM_MODEL_FAST;

  if (globalOverride) return globalOverride;

  if (provider === "anthropic") {
    return tier === "primary"
      ? process.env.ANTHROPIC_MODEL || PROVIDER_MODEL_DEFAULTS.anthropic.primary
      : process.env.ANTHROPIC_MODEL_FAST || PROVIDER_MODEL_DEFAULTS.anthropic.fast;
  }

  if (provider === "openai") {
    return tier === "primary"
      ? process.env.OPENAI_MODEL || PROVIDER_MODEL_DEFAULTS.openai.primary
      : process.env.OPENAI_MODEL_FAST || PROVIDER_MODEL_DEFAULTS.openai.fast;
  }

  if (provider === "gemini") {
    return tier === "primary"
      ? process.env.GEMINI_MODEL || PROVIDER_MODEL_DEFAULTS.gemini.primary
      : process.env.GEMINI_MODEL_FAST || PROVIDER_MODEL_DEFAULTS.gemini.fast;
  }

  return PROVIDER_MODEL_DEFAULTS[provider]?.[tier] || PROVIDER_MODEL_DEFAULTS.anthropic.primary;
}

function readApiKey(provider) {
  if (provider === "anthropic") {
    return process.env.ANTHROPIC_API_KEY || "";
  }
  if (provider === "openai") {
    return process.env.OPENAI_API_KEY || "";
  }
  if (provider === "gemini") {
    return process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "";
  }
  return "";
}

export function getLlmConfig() {
  const provider = readProviderName();
  const apiKey = readApiKey(provider);

  return {
    provider,
    apiKey,
    models: {
      primary: readModel(provider, "primary"),
      fast: readModel(provider, "fast")
    },
    anthropicWebSearch:
      provider === "anthropic" &&
      (process.env.ANTHROPIC_WEB_SEARCH_ENABLED === "1" ||
        process.env.ANTHROPIC_WEB_SEARCH_ENABLED?.toLowerCase() === "true")
  };
}

export function getPrimaryModelName() {
  return getLlmConfig().models.primary;
}
