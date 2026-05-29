// recent/route.js - returns the most recent audit jobs for the authenticated user

import { getUserFromAccessToken } from "../../../../src/auth/supabaseAuth.js";
import { getRecentJobs } from "../../../../lib/engine/storage/db.js";

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

async function getAuthenticatedUser(request) {
  const header = request.headers.get("authorization") || "";
  if (!header.toLowerCase().startsWith("bearer ")) return null;

  const token = header.slice("bearer ".length).trim();
  if (!token) return null;

  try {
    return await getUserFromAccessToken(token);
  } catch {
    return null;
  }
}

export async function GET(request) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const url = new URL(request.url);
  const limitParam = Number(url.searchParams.get("limit"));
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 50) : 10;

  try {
    const jobs = await getRecentJobs(user.id, limit);
    return jsonResponse({ jobs });
  } catch (err) {
    return jsonResponse({ error: err?.message || "Failed to load recent audits" }, 500);
  }
}
