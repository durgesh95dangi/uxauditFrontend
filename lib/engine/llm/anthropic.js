import Anthropic from "@anthropic-ai/sdk";
import { ANTHROPIC_WEB_SEARCH_MAX_USES } from "../config.js";
import { callWithRetry, toAnthropicImageSource } from "./shared.js";

let clientInstance = null;

function getClient(apiKey) {
  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY in environment");
  }

  if (!clientInstance) {
    clientInstance = new Anthropic({ apiKey });
  }

  return clientInstance;
}

function extractText(response) {
  if (!response?.content) return "";

  return response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}

function getWebSearchTools(enabled) {
  if (!enabled) return undefined;

  return [
    {
      type: "web_search_20250305",
      name: "web_search",
      max_uses: ANTHROPIC_WEB_SEARCH_MAX_USES
    }
  ];
}

export function createAnthropicProvider(config) {
  const { apiKey, anthropicWebSearch } = config;

  return {
    name: "anthropic",

    async completeText({ system, user, model, maxTokens }) {
      const response = await callWithRetry(
        async () => {
          const result = await getClient(apiKey).messages.create({
            model,
            max_tokens: maxTokens,
            system,
            messages: [{ role: "user", content: user }]
          });
          return {
            text: extractText(result),
            inputTokens: result?.usage?.input_tokens
          };
        },
        { providerName: "anthropic" }
      );

      return response;
    },

    async completeVision({ system, user, image, model, maxTokens }) {
      const tools = getWebSearchTools(anthropicWebSearch);

      const response = await callWithRetry(
        async () => {
          const result = await getClient(apiKey).messages.create({
            model,
            max_tokens: maxTokens,
            system,
            ...(tools ? { tools } : {}),
            messages: [
              {
                role: "user",
                content: [
                  { type: "image", source: toAnthropicImageSource(image) },
                  { type: "text", text: user }
                ]
              }
            ]
          });

          const searchCount =
            result?.usage?.server_tool_use?.web_search_requests ?? 0;
          if (searchCount > 0) {
            console.log(`[LLM:anthropic] Web search used ${searchCount} time(s)`);
          }

          return {
            text: extractText(result),
            inputTokens: result?.usage?.input_tokens
          };
        },
        { providerName: "anthropic" }
      );

      return response;
    }
  };
}
