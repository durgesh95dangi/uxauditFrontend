// limiter.js - in-process concurrency cap for the audit pipeline.
// Honors MAX_CONCURRENT_AUDITS (default 2). Anything beyond the cap
// queues automatically and runs FIFO as slots free up.

import pLimit from "p-limit";

const MAX_CONCURRENT =
  Number.parseInt(process.env.MAX_CONCURRENT_AUDITS, 10) || 2;

const limit = pLimit(MAX_CONCURRENT);

export function enqueue(fn) {
  return limit(fn);
}

export function getQueueStats() {
  return {
    activeCount: limit.activeCount,
    pendingCount: limit.pendingCount,
    concurrency: MAX_CONCURRENT
  };
}
