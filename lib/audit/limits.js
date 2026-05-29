import {
  STARTER_MONTHLY_AUDIT_LIMIT,
  getMonthlyAuditLimitForUser
} from "./plans.js";

export { STARTER_MONTHLY_AUDIT_LIMIT as MONTHLY_AUDIT_LIMIT } from "./plans.js";

export function monthStartUtcIso(date = new Date()) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)
  ).toISOString();
}

export function monthlyLimitPayload(used, limit = STARTER_MONTHLY_AUDIT_LIMIT) {
  return {
    error: `You've used all ${limit} audits on the free Starter plan this month. Upgrade when Pro launches for unlimited reports, or wait until the 1st when your limit resets.`,
    code: "monthly_limit_reached",
    plan: "starter",
    limit,
    used
  };
}

export function getAuditQuotaForUser(user) {
  const limit = getMonthlyAuditLimitForUser(user);
  return {
    limit,
    applies: limit != null
  };
}
