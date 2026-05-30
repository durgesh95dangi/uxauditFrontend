import {
  AGENCY_MONTHLY_AUDIT_LIMIT,
  FOUNDER_MONTHLY_AUDIT_LIMIT,
  FREE_MONTHLY_AUDIT_LIMIT,
  PLAN_STARTER,
  resolveUserPlan
} from "./plans.js";
import { getPlanRank } from "../billing/planRank.js";

export const PRICING_CONTACT_EMAIL = "hello@uxauditx.com";

export const PRICING_PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "",
    desc: "Try UXAuditX on your site — no credit card needed.",
    audience: "Best for testing your first landing page.",
    auditLimit: FREE_MONTHLY_AUDIT_LIMIT,
    features: [
      "1 audit per month",
      "Desktop and mobile screenshots",
      "Visual proof for every issue",
      "Email support"
    ],
    featured: false,
    comingSoon: false,
    cta: "Get started free",
    href: "/signup"
  },
  {
    id: "founder",
    name: "Founder",
    price: "$19",
    period: "/month",
    desc: "Run regular audits across the sites you own or manage.",
    audience: "Best for founders running 1–5 businesses who need to improve each website.",
    auditLimit: FOUNDER_MONTHLY_AUDIT_LIMIT,
    features: [
      "5 audits per month",
      "Full report on every issue",
      "Desktop + mobile coverage",
      "Priority email support"
    ],
    featured: true,
    comingSoon: false,
    cta: "Get started",
    checkoutLabel: "Get started"
  },
  {
    id: "agency",
    name: "Agency",
    price: "$199",
    period: "/month",
    desc: "Audit client sites at scale without hiring a UX team.",
    audience: "Best for agencies with multiple clients who want repeatable website audits.",
    auditLimit: AGENCY_MONTHLY_AUDIT_LIMIT,
    features: [
      "50 audits per month",
      "Client-ready PDF reports",
      "Desktop + mobile for every audit",
      "Direct support channel"
    ],
    featured: false,
    comingSoon: false,
    cta: "Get started",
    checkoutLabel: "Get started"
  }
];

export const PRICING_CUSTOM = {
  title: "Need more than 50 audits?",
  body: "We offer custom pricing for high-volume teams, multi-brand operators, and enterprise rollouts.",
  cta: "Contact us for custom pricing",
  href: `mailto:${PRICING_CONTACT_EMAIL}?subject=UXAuditX%20custom%20pricing`
};

function pricingPlanRank(planId) {
  if (planId === "free") return getPlanRank(PLAN_STARTER);
  return getPlanRank(planId);
}

export function resolvePricingPlanId(user) {
  const plan = resolveUserPlan(user);
  if (plan === PLAN_STARTER) return "free";
  if (plan === "pro") return "founder";
  return plan;
}

export function getAuthenticatedPricingView(user) {
  const currentPricingId = resolvePricingPlanId(user);
  const currentRank = getPlanRank(resolveUserPlan(user));
  const currentPlan = PRICING_PLANS.find((plan) => plan.id === currentPricingId);
  const upgradePlans = PRICING_PLANS.filter(
    (plan) => pricingPlanRank(plan.id) > currentRank
  );

  return {
    currentPlan: currentPlan || PRICING_PLANS[0],
    upgradePlans
  };
}
