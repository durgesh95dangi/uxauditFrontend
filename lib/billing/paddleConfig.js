import { PLAN_AGENCY, PLAN_FOUNDER } from "../audit/plans.js";

export function getPaddleEnvironment() {
  const raw = (process.env.PADDLE_ENVIRONMENT || "sandbox").toLowerCase();
  return raw === "production" ? "production" : "sandbox";
}

export function isPaddleConfigured() {
  return Boolean(
    process.env.PADDLE_API_KEY &&
      process.env.PADDLE_WEBHOOK_SECRET &&
      process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
  );
}

export function getPaddlePriceId(planId) {
  if (planId === PLAN_FOUNDER || planId === "founder") {
    return process.env.NEXT_PUBLIC_PADDLE_PRICE_FOUNDER || "";
  }
  if (planId === PLAN_AGENCY || planId === "agency") {
    return process.env.NEXT_PUBLIC_PADDLE_PRICE_AGENCY || "";
  }
  return "";
}

export function isPaddleCheckoutReady(planId) {
  return Boolean(
    process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN && getPaddlePriceId(planId)
  );
}

export function resolvePlanFromPriceId(priceId) {
  if (!priceId) return null;

  const founderPrice = process.env.NEXT_PUBLIC_PADDLE_PRICE_FOUNDER;
  const agencyPrice = process.env.NEXT_PUBLIC_PADDLE_PRICE_AGENCY;

  if (founderPrice && priceId === founderPrice) return PLAN_FOUNDER;
  if (agencyPrice && priceId === agencyPrice) return PLAN_AGENCY;

  return null;
}
