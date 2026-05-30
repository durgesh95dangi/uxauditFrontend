import { GoogleGenerativeAI } from "@google/generative-ai";
import { getVertexAI, getVertexLocation, isVertexConfigured } from "../../vertex/client.js";
import { callWithRetry } from "./shared.js";

let genAiClient = null;
let genAiClientKey = null;

function useVertexBackend(config) {
  if (config.useVertex) return true;
  return isVertexConfigured() && !config.apiKey;
}

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

function extractResponseText(result) {
  const response = result?.response;
  const candidate = response?.candidates?.[0];
  const text =
    response?.text?.()?.trim() ||
    candidate?.content?.parts?.[0]?.text?.trim() ||
    "";
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

async function generateWithVertex(modelName, { system, parts, maxTokens }) {
  const vertexAI = getVertexAI();
  const generativeModel = vertexAI.getGenerativeModel({
    model: modelName,
    systemInstruction: system ? { parts: [{ text: system }] } : undefined,
    generationConfig: buildGenerationConfig(maxTokens)
  });

  const result = await generativeModel.generateContent({
    contents: [{ role: "user", parts }]
  });

  const { text, candidate, promptFeedback, inputTokens } =
    extractResponseText(result);

  if (!text) {
    const finishReason = candidate?.finishReason;
    if (finishReason && finishReason !== "STOP") {
      throw new Error(
        `Vertex Gemini blocked or truncated response (${finishReason})` +
          (promptFeedback?.blockReason
            ? `: ${promptFeedback.blockReason}`
            : "")
      );
    }
    throw new Error(buildGeminiFailureMessage({ candidate, promptFeedback }));
  }

  return { text, inputTokens };
}

async function generateWithAiStudio(apiKey, modelName, { system, parts, maxTokens }) {
  const genAI = getGenAiClient(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: system,
    generationConfig: buildGenerationConfig(maxTokens)
  });

  const result = await model.generateContent(parts);
  const { text, candidate, promptFeedback, inputTokens } =
    extractResponseText(result);

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

async function generateWithModel(config, modelName, { system, parts, maxTokens }) {
  if (useVertexBackend(config)) {
    return generateWithVertex(modelName, { system, parts, maxTokens });
  }

  return generateWithAiStudio(config.apiKey, modelName, {
    system,
    parts,
    maxTokens
  });
}

export function createGeminiProvider(config) {
  const vertex = useVertexBackend(config);

  if (!vertex && !config.apiKey) {
    throw new Error(
      "Missing GEMINI_API_KEY (or GOOGLE_AI_API_KEY). For Vertex AI, set GCP_PROJECT_ID, GCP_CLIENT_EMAIL, GCP_PRIVATE_KEY and GEMINI_USE_VERTEX=true."
    );
  }

  if (!vertex && !config.apiKey.startsWith("AIza") && config.apiKey.startsWith("AQ.")) {
    console.warn(
      "[LLM:gemini] Key format looks like Google Cloud/OAuth, not AI Studio (AIza…). " +
        "Set GEMINI_USE_VERTEX=true with GCP service account credentials, or use an AI Studio key."
    );
  }

  if (vertex) {
    console.log(
      `[LLM:gemini] Using Vertex AI (project=${process.env.GCP_PROJECT_ID}, location=${getVertexLocation()})`
    );
  }

  return {
    name: vertex ? "gemini-vertex" : "gemini",

    async completeText({ system, user, model, maxTokens }) {
      return callWithRetry(
        () =>
          generateWithModel(config, model, {
            system,
            parts: [{ text: user }],
            maxTokens
          }),
        { providerName: vertex ? "gemini-vertex" : "gemini" }
      );
    },

    async completeVision({ system, user, image, model, maxTokens }) {
      const imagePart = await resolveImagePart(image);

      return callWithRetry(
        () =>
          generateWithModel(config, model, {
            system,
            parts: [imagePart, { text: user }],
            maxTokens
          }),
        { providerName: vertex ? "gemini-vertex" : "gemini" }
      );
    }
  };
}
