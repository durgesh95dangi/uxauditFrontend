import { requireSuperadminApi } from "../../../../../lib/auth/requireSuperadmin.js";
import {
  REPORT_TIER_FULL,
  REPORT_TIER_STARTER
} from "../../../../../lib/audit/reportTier.js";
import { monthlyLimitPayloadForUser } from "../../../../../lib/audit/limits.js";
import { getMonthlyAuditLimitForUser } from "../../../../../lib/audit/plans.js";
import { countUserAuditsThisMonth, createJob } from "../../../../../lib/engine/storage/db.js";
import { runAudit } from "../../../../../lib/engine/runner.js";
import { enqueue } from "../../../../../lib/engine/queue/limiter.js";
import { bootQueue } from "../../../../../lib/engine/queue/bootstrap.js";

export const runtime = "nodejs";
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
  bootQueue();

  const gate = await requireSuperadminApi();
  if (!gate.ok) return gate.response;

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

  const fullReport = body.fullReport !== false;
  const reportTier = fullReport ? REPORT_TIER_FULL : REPORT_TIER_STARTER;
  const skipQuota = body.skipQuota !== false;

  if (!skipQuota) {
    let auditsThisMonth;
    try {
      auditsThisMonth = await countUserAuditsThisMonth(gate.user.id);
    } catch (error) {
      return jsonResponse(
        { error: error?.message || "Failed to check audit limit" },
        500
      );
    }

    const monthlyLimit = getMonthlyAuditLimitForUser(gate.user);
    if (monthlyLimit != null && auditsThisMonth >= monthlyLimit) {
      return jsonResponse(
        monthlyLimitPayloadForUser(gate.user, auditsThisMonth),
        429
      );
    }
  }

  let job;
  try {
    job = await createJob(gate.user.id, validation.url, {
      reportTier,
      adminRun: true
    });
  } catch (error) {
    return jsonResponse(
      { error: error?.message || "Failed to create job" },
      500
    );
  }

  enqueue(() =>
    runAudit(job.id, validation.url, gate.user.id, {
      reportTier,
      adminRun: true
    })
  ).catch((err) => {
    console.error("[admin audit] failed for job", job.id, err);
  });

  return jsonResponse({
    jobId: job.id,
    status: "pending",
    reportTier,
    fullReport
  });
}
