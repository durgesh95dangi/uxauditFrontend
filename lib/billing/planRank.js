import { PLAN_AGENCY, PLAN_FOUNDER, PLAN_STARTER } from "../audit/plans.js";

const PLAN_RANK = {
  [PLAN_STARTER]: 0,
  [PLAN_FOUNDER]: 1,
  pro: 1,
  [PLAN_AGENCY]: 2
};

export function getPlanRank(planId) {
  return PLAN_RANK[planId] ?? 0;
}

export function isPlanAtLeast(currentPlan, targetPlan) {
  return getPlanRank(currentPlan) >= getPlanRank(targetPlan);
}
