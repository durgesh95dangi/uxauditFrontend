import { createAnthropicProvider } from "./anthropic.js";
import { getLlmConfig } from "./config.js";
import { createGeminiProvider } from "./gemini.js";
import { createOpenAiProvider } from "./openai.js";

let cachedProvider = null;
let cachedProviderKey = null;

export { DEFAULT_LLM_PROVIDER, getLlmConfig, getPrimaryModelName } from "./config.js";

export function getLlmProvider(forceRefresh = false) {
  const config = getLlmConfig();
  const cacheKey = `${config.provider}:${Boolean(config.apiKey)}:${Boolean(config.useVertex)}`;

  if (!forceRefresh && cachedProvider && cachedProviderKey === cacheKey) {
    return cachedProvider;
  }

  if (!config.apiKey && !(config.provider === "gemini" && config.useVertex)) {
    throw new Error(
      `Missing API key for LLM provider "${config.provider}". Check your environment variables.`
    );
  }

  if (config.provider === "openai") {
    cachedProvider = createOpenAiProvider(config);
  } else if (config.provider === "gemini") {
    cachedProvider = createGeminiProvider(config);
  } else {
    cachedProvider = createAnthropicProvider(config);
  }

  cachedProviderKey = cacheKey;
  return cachedProvider;
}
