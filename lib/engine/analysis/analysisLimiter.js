// analysisLimiter.js - concurrency + token-budget pacing for Claude analysis

import pLimit from "p-limit";
import {
  AUDIT_ANALYSIS_CONCURRENCY,
  AUDIT_ANALYSIS_ESTIMATED_INPUT_TOKENS,
  AUDIT_ANALYSIS_TOKEN_BUDGET_PER_MIN
} from "../config.js";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createAnalysisLimiter() {
  const limit = pLimit(AUDIT_ANALYSIS_CONCURRENCY);
  /** @type {Array<{ ts: number, tokens: number }>} */
  const tokenLog = [];

  function pruneLog() {
    const cutoff = Date.now() - 60_000;
    while (tokenLog.length > 0 && tokenLog[0].ts < cutoff) {
      tokenLog.shift();
    }
  }

  function tokensUsedInWindow() {
    pruneLog();
    return tokenLog.reduce((sum, entry) => sum + entry.tokens, 0);
  }

  function chargeTokens(tokens) {
    tokenLog.push({
      ts: Date.now(),
      tokens: Math.max(tokens, 0)
    });
  }

  async function waitForBudget(needed) {
    pruneLog();
    const used = tokensUsedInWindow();

    if (used + needed > AUDIT_ANALYSIS_TOKEN_BUDGET_PER_MIN) {
      const oldest = tokenLog[0]?.ts ?? Date.now();
      const waitMs = Math.min(
        Math.max(60_000 - (Date.now() - oldest) + 750, 2000),
        65_000
      );
      console.log(
        `[AnalysisLimiter] Token budget ${used}/${AUDIT_ANALYSIS_TOKEN_BUDGET_PER_MIN} — waiting ${Math.round(waitMs / 1000)}s`
      );
      await sleep(waitMs);
      return waitForBudget(needed);
    }

    chargeTokens(needed);
  }

  /**
   * Adjust reservation when actual usage differs from estimate.
   * @param {number} estimated
   * @param {number} actual
   */
  function recordActualUsage(estimated, actual) {
    if (!actual || actual <= estimated) return;
    chargeTokens(actual - estimated);
  }

  /**
   * @template T
   * @param {() => Promise<T>} fn
   * @param {number} [estimatedTokens]
   * @returns {Promise<T>}
   */
  function run(fn, estimatedTokens = AUDIT_ANALYSIS_ESTIMATED_INPUT_TOKENS) {
    return limit(async () => {
      await waitForBudget(estimatedTokens);
      return fn(estimatedTokens);
    });
  }

  return { run, recordActualUsage, tokensUsedInWindow };
}
