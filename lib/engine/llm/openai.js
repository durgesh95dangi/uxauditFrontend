import { callWithRetry, toOpenAiImageUrl } from "./shared.js";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

async function postOpenAi(apiKey, body) {
  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      payload?.error?.message ||
      `OpenAI API error (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  const text = payload?.choices?.[0]?.message?.content?.trim() || "";
  const inputTokens = payload?.usage?.prompt_tokens;

  return { text, inputTokens };
}

export function createOpenAiProvider(config) {
  const { apiKey } = config;

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY in environment");
  }

  return {
    name: "openai",

    async completeText({ system, user, model, maxTokens }) {
      return callWithRetry(
        () =>
          postOpenAi(apiKey, {
            model,
            max_tokens: maxTokens,
            messages: [
              { role: "system", content: system },
              { role: "user", content: user }
            ]
          }),
        { providerName: "openai" }
      );
    },

    async completeVision({ system, user, image, model, maxTokens }) {
      return callWithRetry(
        () =>
          postOpenAi(apiKey, {
            model,
            max_tokens: maxTokens,
            messages: [
              { role: "system", content: system },
              {
                role: "user",
                content: [
                  { type: "text", text: user },
                  {
                    type: "image_url",
                    image_url: { url: toOpenAiImageUrl(image) }
                  }
                ]
              }
            ]
          }),
        { providerName: "openai" }
      );
    }
  };
}
