// start/route.js - accepts a URL, creates a job, fires the audit pipeline

import { getSupabaseServerClient } from "../../../../lib/supabase/server.js";
import {
  getMonthlyAuditLimitForUser
} from "../../../../lib/audit/plans.js";
import { monthlyLimitPayload } from "../../../../lib/audit/limits.js";
import { countUserAuditsThisMonth, createJob } from "../../../../lib/engine/storage/db.js";
import { runAudit } from "../../../../lib/engine/runner.js";
import { enqueue } from "../../../../lib/engine/queue/limiter.js";
import { bootQueue } from "../../../../lib/engine/queue/bootstrap.js";

// Playwright + Sharp require the Node runtime, not Edge.
export const runtime = "nodejs";
// Long-running pipeline — never cache.
export const dynamic = "force-dynamic";

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function normalizeAndValidateUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { error: "URL is required", status: 400 };
  }

  let normalized = rawUrl.trim();
  if (!normalized) {
    return { error: "URL is required", status: 400 };
  }

  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  try {
    const parsed = new URL(normalized);
    return { url: parsed.toString() };
  } catch {
    return { error: "Invalid URL", status: 400 };
  }
}

export async function POST(request) {
  // Idempotently start the stale-job sweeper + resume any jobs that were
  // pending when the process last booted. Safe under HMR; runs once per process.
  bootQueue();

  const ssr = await getSupabaseServerClient();
  const {
    data: { user }
  } = await ssr.auth.getUser();

  if (!user) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const validation = normalizeAndValidateUrl(body.url);
  if (validation.error) {
    return jsonResponse({ error: validation.error }, validation.status);
  }

  let auditsThisMonth;
  try {
    auditsThisMonth = await countUserAuditsThisMonth(user.id);
  } catch (error) {
    return jsonResponse(
      { error: error?.message || "Failed to check audit limit" },
      500
    );
  }

  const monthlyLimit = getMonthlyAuditLimitForUser(user);
  if (monthlyLimit != null && auditsThisMonth >= monthlyLimit) {
    return jsonResponse(monthlyLimitPayload(auditsThisMonth, monthlyLimit), 429);
  }

  let job;
  try {
    job = await createJob(user.id, validation.url);
  } catch (error) {
    return jsonResponse(
      { error: error?.message || "Failed to create job" },
      500
    );
  }

  // Queue the long-running pipeline. p-limit will gate concurrency to
  // MAX_CONCURRENT_AUDITS (default 2). Extra jobs sit in "pending" state.
  enqueue(() => runAudit(job.id, validation.url, user.id)).catch((err) => {
    console.error("Audit failed for job", job.id, err);
  });

  return jsonResponse({ jobId: job.id, status: "pending" });
}
