import {
  FREE_MONTHLY_AUDIT_LIMIT,
  PLAN_AGENCY,
  PLAN_FOUNDER,
  PLAN_STARTER,
  getMonthlyAuditLimitForUser,
  resolveUserPlan
} from "./plans.js";

export { FREE_MONTHLY_AUDIT_LIMIT as MONTHLY_AUDIT_LIMIT } from "./plans.js";
export { STARTER_MONTHLY_AUDIT_LIMIT } from "./plans.js";

export function monthStartUtcIso(date = new Date()) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)
  ).toISOString();
}

function upgradeHint(plan) {
  if (plan === PLAN_STARTER) {
    return "Upgrade to Founder ($19/mo) for 5 audits per month.";
  }
  if (plan === PLAN_FOUNDER) {
    return "Upgrade to Agency ($199/mo) for 50 audits per month.";
  }
  if (plan === PLAN_AGENCY) {
    return "Contact hello@uxauditx.com for custom volume pricing.";
  }
  return "See pricing for upgrade options.";
}

export function monthlyLimitPayload(used, limit = FREE_MONTHLY_AUDIT_LIMIT, plan = PLAN_STARTER) {
  const planLabel =
    plan === PLAN_FOUNDER ? "Founder" : plan === PLAN_AGENCY ? "Agency" : "Free";

  return {
    error: `You've used all ${limit} audits on the ${planLabel} plan this month. ${upgradeHint(plan)} Or wait until the 1st when your limit resets.`,
    code: "monthly_limit_reached",
    plan,
    limit,
    used
  };
}

export function monthlyLimitPayloadForUser(user, used) {
  const plan = resolveUserPlan(user);
  const limit = getMonthlyAuditLimitForUser(user) ?? FREE_MONTHLY_AUDIT_LIMIT;
  return monthlyLimitPayload(used, limit, plan);
}

export function getAuditQuotaForUser(user) {
  const limit = getMonthlyAuditLimitForUser(user);
  return {
    limit,
    applies: limit != null,
    plan: resolveUserPlan(user)
  };
}
