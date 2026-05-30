import { callWithRetry } from "./shared.js";

function buildGeminiUrl(model, apiKey) {
  const encodedModel = encodeURIComponent(model);
  return `https://generativelanguage.googleapis.com/v1beta/models/${encodedModel}:generateContent?key=${encodeURIComponent(apiKey)}`;
}

async function postGemini(apiKey, model, body) {
  const response = await fetch(buildGeminiUrl(model, apiKey), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      payload?.error?.message ||
      `Gemini API error (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  const parts = payload?.candidates?.[0]?.content?.parts || [];
  const text = parts
    .map((part) => part.text || "")
    .join("\n")
    .trim();

  const inputTokens = payload?.usageMetadata?.promptTokenCount;

  return { text, inputTokens };
}

async function resolveImagePart(image) {
  if (image.kind === "base64") {
    return {
      inlineData: {
        mimeType: image.mediaType,
        data: image.data
      }
    };
  }

  const response = await fetch(image.url);
  if (!response.ok) {
    throw new Error(`Failed to fetch screenshot for Gemini (${response.status})`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  return {
    inlineData: {
      mimeType: response.headers.get("content-type") || "image/jpeg",
      data: buffer.toString("base64")
    }
  };
}

export function createGeminiProvider(config) {
  const { apiKey } = config;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY (or GOOGLE_AI_API_KEY) in environment");
  }

  return {
    name: "gemini",

    async completeText({ system, user, model, maxTokens }) {
      return callWithRetry(
        () =>
          postGemini(apiKey, model, {
            systemInstruction: { parts: [{ text: system }] },
            contents: [{ role: "user", parts: [{ text: user }] }],
            generationConfig: { maxOutputTokens: maxTokens }
          }),
        { providerName: "gemini" }
      );
    },

    async completeVision({ system, user, image, model, maxTokens }) {
      const imagePart = await resolveImagePart(image);

      return callWithRetry(
        () =>
          postGemini(apiKey, model, {
            systemInstruction: { parts: [{ text: system }] },
            contents: [
              {
                role: "user",
                parts: [imagePart, { text: user }]
              }
            ],
            generationConfig: { maxOutputTokens: maxTokens }
          }),
        { providerName: "gemini" }
      );
    }
  };
}
