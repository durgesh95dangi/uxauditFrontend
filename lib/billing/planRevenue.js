import {
  PLAN_AGENCY,
  PLAN_FOUNDER,
  PLAN_STARTER,
  resolveUserPlan
} from "../audit/plans.js";

export const PLAN_MRR_USD = {
  [PLAN_STARTER]: 0,
  [PLAN_FOUNDER]: 19,
  pro: 19,
  [PLAN_AGENCY]: 199
};

const ACTIVE_PADDLE_STATUSES = new Set(["active", "trialing"]);

export function isActivePaidSubscription(user) {
  const plan = resolveUserPlan(user);
  if (plan === PLAN_STARTER) return false;

  const status = String(user?.user_metadata?.paddle_status || "")
    .trim()
    .toLowerCase();

  if (!status) return true;
  return ACTIVE_PADDLE_STATUSES.has(status);
}

export function getUserMrrUsd(user) {
  if (!isActivePaidSubscription(user)) return 0;
  const plan = resolveUserPlan(user);
  return PLAN_MRR_USD[plan] ?? 0;
}

export function formatUsd(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(Number(amount));
}
