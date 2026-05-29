import { isSuperadmin } from "../auth/superadmin.js";

export const PLAN_STARTER = "starter";
export const PLAN_PRO = "pro";
export const PLAN_AGENCY = "agency";

export const STARTER_MONTHLY_AUDIT_LIMIT = 2;

const PAID_PLANS = new Set([PLAN_PRO, PLAN_AGENCY]);

export function resolveUserPlan(user) {
  const metadata = user?.user_metadata || {};
  const appMetadata = user?.app_metadata || {};
  const plan = metadata.plan || appMetadata.plan || PLAN_STARTER;

  if (PAID_PLANS.has(plan)) return plan;
  return PLAN_STARTER;
}

export function isStarterPlan(user) {
  return resolveUserPlan(user) === PLAN_STARTER;
}

export function getMonthlyAuditLimitForUser(user) {
  if (isSuperadmin(user)) return null;
  if (isStarterPlan(user)) return STARTER_MONTHLY_AUDIT_LIMIT;
  return null;
}

export function starterPlanMetadata(existingMetadata = {}) {
  return {
    ...existingMetadata,
    plan: PLAN_STARTER,
    signup_source: existingMetadata.signup_source || "landing"
  };
}
