// sweeper.js - background hygiene for the audit queue:
//   1. Marks jobs that have been "running" without a heartbeat for too long as "failed".
//   2. On boot, requeues any job stuck in "pending" (created but runAudit never began).

import { supabase } from "../../../src/storage/supabase.js";
import { enqueue } from "./limiter.js";
import { runAudit } from "../runner.js";

const STALE_AFTER_MS = 10 * 60 * 1000; // 10 minutes
const SWEEP_INTERVAL_MS = 60 * 1000;   // 1 minute

let sweepHandle = null;

async function sweepStaleJobs() {
  const cutoff = new Date(Date.now() - STALE_AFTER_MS).toISOString();

  const { data, error } = await supabase
    .from("audit_jobs")
    .update({
      status: "failed",
      error: "Audit timed out (no heartbeat for 10+ minutes)"
    })
    .eq("status", "running")
    .lt("last_heartbeat_at", cutoff)
    .select("id");

  if (error) {
    // last_heartbeat_at column missing means the schema migration hasn't run yet.
    // Log once and back off rather than spamming the console every minute.
    console.warn("[sweeper] Stale sweep skipped:", error.message);
    return;
  }

  if (data && data.length > 0) {
    console.log(`[sweeper] Marked ${data.length} stale job(s) as failed`);
  }
}

export function startStaleSweeper() {
  if (sweepHandle) return;

  sweepStaleJobs().catch((err) => {
    console.error("[sweeper] Initial sweep failed:", err?.message || err);
  });

  sweepHandle = setInterval(() => {
    sweepStaleJobs().catch((err) => {
      console.error("[sweeper] Periodic sweep failed:", err?.message || err);
    });
  }, SWEEP_INTERVAL_MS);

  // .unref() lets the process exit even if the timer is still scheduled.
  if (typeof sweepHandle.unref === "function") {
    sweepHandle.unref();
  }
}

export async function resumePendingJobs() {
  const { data, error } = await supabase
    .from("audit_jobs")
    .select("id, url, user_id")
    .eq("status", "pending");

  if (error) {
    console.warn("[sweeper] Resume scan skipped:", error.message);
    return;
  }

  if (!data || data.length === 0) return;

  console.log(`[sweeper] Resuming ${data.length} pending job(s) after boot`);

  for (const job of data) {
    enqueue(() => runAudit(job.id, job.url, job.user_id)).catch((err) => {
      console.error(`[sweeper] Resumed job ${job.id} failed:`, err?.message || err);
    });
  }
}
