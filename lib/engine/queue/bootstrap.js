// bootstrap.js - one-time boot for the in-process audit queue.
// Called lazily from API routes; the guard makes this safe under Next.js HMR.

import { startStaleSweeper, resumePendingJobs } from "./sweeper.js";

let booted = false;

export function bootQueue() {
  if (booted) return;
  booted = true;

  startStaleSweeper();

  resumePendingJobs().catch((err) => {
    console.error("[bootQueue] resumePendingJobs failed:", err?.message || err);
  });

  console.log("[bootQueue] Stale sweeper + pending resume initialized");
}
