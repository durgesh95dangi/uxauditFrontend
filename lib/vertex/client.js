import { VertexAI } from "@google-cloud/vertexai";

let cachedClient = null;
let cachedKey = null;

export function normalizePrivateKey(raw) {
  if (!raw) return "";

  let key = String(raw).trim();

  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }

  return key.replace(/\\n/g, "\n");
}

export function readPrivateKey() {
  const base64 = process.env.GCP_PRIVATE_KEY_BASE64?.trim();
  if (base64) {
    return Buffer.from(base64, "base64").toString("utf8");
  }

  return normalizePrivateKey(process.env.GCP_PRIVATE_KEY);
}

/** Strips inline comments (e.g. `us-central1 # comment`). */
export function getVertexLocation() {
  const raw = process.env.GCP_LOCATION || "us-central1";
  return raw.split("#")[0].trim();
}

export function isVertexConfigured() {
  const privateKey = readPrivateKey();
  return Boolean(
    process.env.GCP_PROJECT_ID?.trim() &&
      process.env.GCP_CLIENT_EMAIL?.trim() &&
      privateKey &&
      privateKey.includes("BEGIN PRIVATE KEY")
  );
}

export function getVertexModel(tier = "fast") {
  if (tier === "primary") {
    return (
      process.env.GEMINI_MODEL ||
      process.env.VERTEX_MODEL ||
      "gemini-1.5-pro"
    );
  }

  return (
    process.env.GEMINI_MODEL_FAST ||
    process.env.VERTEX_MODEL ||
    "gemini-1.5-flash"
  );
}

export function getVertexAI() {
  if (!isVertexConfigured()) {
    throw new Error("Vertex AI credentials are not configured");
  }

  const privateKey = readPrivateKey();
  const cacheKey = `${process.env.GCP_PROJECT_ID}:${getVertexLocation()}:${process.env.GCP_CLIENT_EMAIL}`;

  if (cachedClient && cachedKey === cacheKey) {
    return cachedClient;
  }

  cachedClient = new VertexAI({
    project: process.env.GCP_PROJECT_ID.trim(),
    location: getVertexLocation(),
    googleAuthOptions: {
      credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL.trim(),
        private_key: privateKey
      }
    }
  });

  cachedKey = cacheKey;
  return cachedClient;
}

export function getVertexStatus() {
  return {
    configured: isVertexConfigured(),
    project: process.env.GCP_PROJECT_ID?.trim() || null,
    location: getVertexLocation(),
    clientEmail: process.env.GCP_CLIENT_EMAIL?.trim() || null,
    models: {
      primary: getVertexModel("primary"),
      fast: getVertexModel("fast")
    },
    auth: process.env.GCP_PRIVATE_KEY_BASE64
      ? "service_account_base64"
      : process.env.GCP_PRIVATE_KEY
        ? "service_account"
        : null
  };
}
