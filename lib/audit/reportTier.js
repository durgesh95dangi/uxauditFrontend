import { isSuperadmin } from "../auth/superadmin.js";
import { PLAN_AGENCY, PLAN_FOUNDER, resolveUserPlan } from "./plans.js";

export const REPORT_TIER_FULL = "full";
export const REPORT_TIER_STARTER = "starter";

export function getReportTierForUser(user) {
  if (isSuperadmin(user)) return REPORT_TIER_FULL;

  const plan = resolveUserPlan(user);
  if (plan === PLAN_FOUNDER || plan === PLAN_AGENCY) return REPORT_TIER_FULL;

  return REPORT_TIER_STARTER;
}

export function isFullReportTier(tier) {
  return tier !== REPORT_TIER_STARTER;
}

export function resolveJobReportTier(job, fallback = REPORT_TIER_FULL) {
  const fromMeta = job?.audit_metadata?.report_tier;
  if (fromMeta === REPORT_TIER_STARTER || fromMeta === REPORT_TIER_FULL) {
    return fromMeta;
  }
  return fallback;
}

export function reportTierLabel(tier) {
  return isFullReportTier(tier) ? "Full report" : "Starter report";
}
