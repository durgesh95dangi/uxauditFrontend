import { isSuperadmin } from "../auth/superadmin.js";

export const PLAN_STARTER = "starter";
export const PLAN_FOUNDER = "founder";
export const PLAN_AGENCY = "agency";

/** @deprecated Use PLAN_FOUNDER — kept for legacy user metadata */
export const PLAN_PRO = PLAN_FOUNDER;

export const FREE_MONTHLY_AUDIT_LIMIT = 1;
export const FOUNDER_MONTHLY_AUDIT_LIMIT = 10;
export const AGENCY_MONTHLY_AUDIT_LIMIT = 50;

/** @deprecated Use FREE_MONTHLY_AUDIT_LIMIT */
export const STARTER_MONTHLY_AUDIT_LIMIT = FREE_MONTHLY_AUDIT_LIMIT;

const PAID_PLANS = new Set([PLAN_FOUNDER, PLAN_AGENCY, "pro"]);

const PLAN_LIMITS = {
  [PLAN_STARTER]: FREE_MONTHLY_AUDIT_LIMIT,
  [PLAN_FOUNDER]: FOUNDER_MONTHLY_AUDIT_LIMIT,
  pro: FOUNDER_MONTHLY_AUDIT_LIMIT,
  [PLAN_AGENCY]: AGENCY_MONTHLY_AUDIT_LIMIT
};

export function resolveUserPlan(user) {
  const metadata = user?.user_metadata || {};
  const appMetadata = user?.app_metadata || {};
  const raw = metadata.plan || appMetadata.plan || PLAN_STARTER;

  if (raw === "pro") return PLAN_FOUNDER;
  if (raw === PLAN_FOUNDER || raw === PLAN_AGENCY) return raw;
  return PLAN_STARTER;
}

export function isStarterPlan(user) {
  return resolveUserPlan(user) === PLAN_STARTER;
}

export function getMonthlyAuditLimitForUser(user) {
  if (isSuperadmin(user)) return null;

  const plan = resolveUserPlan(user);
  return PLAN_LIMITS[plan] ?? FREE_MONTHLY_AUDIT_LIMIT;
}

export function getPlanLabel(plan) {
  if (plan === PLAN_FOUNDER || plan === "pro") return "Founder";
  if (plan === PLAN_AGENCY) return "Agency";
  return "Free";
}

export function starterPlanMetadata(existingMetadata = {}) {
  return {
    ...existingMetadata,
    plan: PLAN_STARTER,
    signup_source: existingMetadata.signup_source || "landing"
  };
}
