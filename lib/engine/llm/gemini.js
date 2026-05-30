import { callWithRetry } from "./shared.js";

function buildGeminiUrl(model, apiKey) {
  const encodedModel = encodeURIComponent(model);
  return `https://generativelanguage.googleapis.com/v1beta/models/${encodedModel}:generateContent?key=${encodeURIComponent(apiKey)}`;
}

function buildGenerationConfig(maxTokens) {
  return {
    maxOutputTokens: maxTokens,
    temperature: 0.2,
    responseMimeType: "application/json"
  };
}

function extractGeminiText(payload) {
  const candidate = payload?.candidates?.[0];
  const parts = candidate?.content?.parts || [];
  const text = parts
    .map((part) => part.text || "")
    .join("\n")
    .trim();

  return { text, candidate, promptFeedback: payload?.promptFeedback };
}

function buildGeminiFailureMessage(payload, responseStatus) {
  const { candidate, promptFeedback } = extractGeminiText(payload);
  const blockReason =
    promptFeedback?.blockReason ||
    candidate?.finishReason ||
    payload?.error?.message;

  if (blockReason) {
    return String(blockReason);
  }

  if (responseStatus === 403) {
    return (
      "Gemini API access denied. Use a Google AI Studio key (AIza…) from " +
      "https://aistudio.google.com/apikey and enable the Generative Language API " +
      "for your Google Cloud project."
    );
  }

  return `Gemini returned no analysis text (HTTP ${responseStatus})`;
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

  const { text, candidate, promptFeedback } = extractGeminiText(payload);

  if (!text) {
    const finishReason = candidate?.finishReason;
    if (finishReason && finishReason !== "STOP") {
      throw new Error(
        `Gemini blocked or truncated response (${finishReason})` +
          (promptFeedback?.blockReason
            ? `: ${promptFeedback.blockReason}`
            : "")
      );
    }
    throw new Error(buildGeminiFailureMessage(payload, response.status));
  }

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

  if (!apiKey.startsWith("AIza") && apiKey.startsWith("AQ.")) {
    console.warn(
      "[LLM:gemini] Key format looks like Google Cloud/OAuth, not AI Studio (AIza…). " +
        "If analysis fails, create a key at https://aistudio.google.com/apikey"
    );
  }

  return {
    name: "gemini",

    async completeText({ system, user, model, maxTokens }) {
      return callWithRetry(
        () =>
          postGemini(apiKey, model, {
            systemInstruction: { parts: [{ text: system }] },
            contents: [{ role: "user", parts: [{ text: user }] }],
            generationConfig: buildGenerationConfig(maxTokens)
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
            generationConfig: buildGenerationConfig(maxTokens)
          }),
        { providerName: "gemini" }
      );
    }
  };
}
