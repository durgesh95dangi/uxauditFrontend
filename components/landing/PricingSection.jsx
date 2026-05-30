"use client";

import Link from "next/link";
import {
  IconBadge,
  IconStar,
  IconUsers,
  IconZap,
  SectionEyebrow
} from "./LandingIcons.jsx";
import PricingPlanCta from "../billing/PricingPlanCta.jsx";
import {
  getAuthenticatedPricingView,
  PRICING_CUSTOM,
  PRICING_PLANS
} from "../../lib/audit/pricing.js";

const PLAN_ICONS = {
  free: IconStar,
  founder: IconZap,
  agency: IconUsers
};

const PLAN_TONES = {
  free: "blue",
  founder: "violet",
  agency: "indigo"
};

function PricingCard({ plan, isCurrent = false, isUpgrade = false }) {
  const Icon = PLAN_ICONS[plan.id] || IconStar;
  const tone = PLAN_TONES[plan.id] || "blue";
  const showFeatured = plan.featured && !isCurrent;

  return (
    <article
      className={`span-4 pricing-card${
        isCurrent ? " pricing-card-current" : ""
      }${showFeatured ? " pricing-card-featured" : ""}`}
    >
      {isCurrent && <span className="pricing-badge pricing-badge-current">Current plan</span>}
      {!isCurrent && showFeatured && (
        <span className="pricing-badge">Recommended</span>
      )}
      <IconBadge icon={Icon} tone={tone} className="pricing-card-icon" />
      <h3>{plan.name}</h3>
      <p className="pricing-price">
        {plan.price}
        {plan.period && <span>{plan.period}</span>}
      </p>
      <p className="pricing-desc">{plan.desc}</p>
      <p className="pricing-audience">{plan.audience}</p>
      <ul className="pricing-features">
        {plan.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      {isCurrent ? (
        plan.id === "free" ? (
          <Link href="/dashboard" className="btn btn-block btn-sm btn-secondary">
            Go to dashboard
          </Link>
        ) : (
          <button type="button" className="btn btn-block btn-sm btn-secondary" disabled>
            Current plan
          </button>
        )
      ) : plan.id === "free" ? (
        <Link
          href={plan.href}
          className={`btn btn-block btn-sm ${showFeatured ? "btn-primary" : "btn-secondary"}`}
        >
          {plan.cta}
        </Link>
      ) : (
        <PricingPlanCta
          planId={plan.id}
          label={isUpgrade ? "Upgrade" : plan.checkoutLabel || plan.cta}
          featured={showFeatured}
        />
      )}
    </article>
  );
}

export default function PricingSection({ withAnchor = true, user = null }) {
  const isAuthed = Boolean(user);
  const authedView = isAuthed ? getAuthenticatedPricingView(user) : null;

  return (
    <section
      id={withAnchor ? "pricing" : undefined}
      className="section-band"
    >
      <div className="container">
        <div className="section-header section-header-center">
          <SectionEyebrow icon={IconStar} center>
            Plans
          </SectionEyebrow>
          <h2 className="section-title">
            {isAuthed ? "Your plan" : "Pricing that scales with you"}
          </h2>
          <p className="section-lead">
            {isAuthed
              ? authedView.upgradePlans.length > 0
                ? "You're on a plan that works. Upgrade anytime for more audits."
                : "You're on our highest plan. Contact us if you need more volume."
              : "Start free, upgrade when you are auditing more sites every month."}
          </p>
        </div>

        {isAuthed ? (
          <div className="pricing-authed">
            <div className="pricing-authed-current">
              <PricingCard plan={authedView.currentPlan} isCurrent />
            </div>

            {authedView.upgradePlans.length > 0 ? (
              <div className="pricing-authed-upgrades">
                <h3 className="pricing-authed-upgrades-title">Upgrade options</h3>
                <div className="grid pricing-grid section-grid pricing-authed-grid">
                  {authedView.upgradePlans.map((plan) => (
                    <PricingCard key={plan.id} plan={plan} isUpgrade />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="grid pricing-grid section-grid">
            {PRICING_PLANS.map((plan) => (
              <PricingCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}

        <div className="pricing-custom">
          <h3 className="pricing-custom-title">{PRICING_CUSTOM.title}</h3>
          <p className="pricing-custom-body">{PRICING_CUSTOM.body}</p>
          <a href={PRICING_CUSTOM.href} className="btn btn-secondary btn-sm">
            {PRICING_CUSTOM.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
