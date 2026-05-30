import { GoogleGenerativeAI } from "@google/generative-ai";
import { callWithRetry } from "./shared.js";

let genAiClient = null;
let genAiClientKey = null;

function getGenAiClient(apiKey) {
  if (!genAiClient || genAiClientKey !== apiKey) {
    genAiClient = new GoogleGenerativeAI(apiKey);
    genAiClientKey = apiKey;
  }
  return genAiClient;
}

function buildGenerationConfig(maxTokens) {
  return {
    maxOutputTokens: maxTokens,
    temperature: 0.2,
    responseMimeType: "application/json"
  };
}

function extractGeminiResponse(result) {
  const response = result?.response;
  const text = response?.text()?.trim() || "";
  const candidate = response?.candidates?.[0];
  const promptFeedback = response?.promptFeedback;
  const inputTokens = response?.usageMetadata?.promptTokenCount;

  return { text, candidate, promptFeedback, inputTokens };
}

function buildGeminiFailureMessage({ candidate, promptFeedback }) {
  const blockReason =
    promptFeedback?.blockReason || candidate?.finishReason || null;

  if (blockReason) {
    return String(blockReason);
  }

  return "Gemini returned no analysis text";
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

async function generateWithModel(apiKey, modelName, { system, parts, maxTokens }) {
  const genAI = getGenAiClient(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: system,
    generationConfig: buildGenerationConfig(maxTokens)
  });

  const result = await model.generateContent(parts);
  const { text, candidate, promptFeedback, inputTokens } =
    extractGeminiResponse(result);

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
    throw new Error(buildGeminiFailureMessage({ candidate, promptFeedback }));
  }

  return { text, inputTokens };
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
          generateWithModel(apiKey, model, {
            system,
            parts: [{ text: user }],
            maxTokens
          }),
        { providerName: "gemini" }
      );
    },

    async completeVision({ system, user, image, model, maxTokens }) {
      const imagePart = await resolveImagePart(image);

      return callWithRetry(
        () =>
          generateWithModel(apiKey, model, {
            system,
            parts: [imagePart, { text: user }],
            maxTokens
          }),
        { providerName: "gemini" }
      );
    }
  };
}
