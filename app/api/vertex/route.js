import { NextResponse } from "next/server";
import { requireSuperadminApi } from "../../../lib/auth/requireSuperadmin.js";
import {
  getVertexAI,
  getVertexLocation,
  getVertexModel,
  getVertexStatus,
  isVertexConfigured
} from "../../../lib/vertex/client.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function safeErrorMessage(error) {
  if (!isProduction()) {
    return error?.message || "Vertex AI request failed";
  }
  return "Vertex AI request failed";
}

async function authorizeVertexRequest(request) {
  const secret = process.env.VERTEX_API_SECRET?.trim();
  if (secret) {
    const authHeader = request.headers.get("authorization") || "";
    const bearer = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : "";
    const headerSecret = request.headers.get("x-vertex-secret")?.trim() || "";

    if (bearer === secret || headerSecret === secret) {
      return { ok: true, via: "secret" };
    }
  }

  const gate = await requireSuperadminApi();
  if (!gate.ok) {
    return { ok: false, response: gate.response };
  }

  return { ok: true, via: "superadmin", user: gate.user };
}

/** Superadmin or VERTEX_API_SECRET — production health check. */
export async function GET(request) {
  const auth = await authorizeVertexRequest(request);
  if (!auth.ok) return auth.response;

  const status = getVertexStatus();

  return NextResponse.json({
    ok: status.configured,
    provider: "vertex",
    ...status
  });
}

/** Superadmin or VERTEX_API_SECRET — smoke-test Gemini via Vertex. */
export async function POST(request) {
  const auth = await authorizeVertexRequest(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json().catch(() => ({}));
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";

    if (!prompt) {
      return jsonError("Prompt is required", 400);
    }

    if (!isVertexConfigured()) {
      return jsonError("Vertex AI credentials are not configured", 503);
    }

    const vertexAI = getVertexAI();
    const model =
      typeof body.model === "string" && body.model.trim()
        ? body.model.trim()
        : getVertexModel("fast");

    const generativeModel = vertexAI.getGenerativeModel({ model });

    const result = await generativeModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    const candidate = result.response?.candidates?.[0];
    const responseText = candidate?.content?.parts?.[0]?.text;

    if (!responseText) {
      return jsonError("No text returned from Vertex AI", 502);
    }

    return NextResponse.json({
      ok: true,
      text: responseText,
      model,
      location: getVertexLocation()
    });
  } catch (error) {
    console.error("[api/vertex] Error:", error);
    return jsonError(safeErrorMessage(error), 500);
  }
}
