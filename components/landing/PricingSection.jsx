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
import { PRICING_CUSTOM, PRICING_PLANS } from "../../lib/audit/pricing.js";

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

export default function PricingSection({ withAnchor = true }) {
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
          <h2 className="section-title">Pricing that scales with you</h2>
          <p className="section-lead">
            Start free, upgrade when you are auditing more sites every month.
          </p>
        </div>

        <div className="grid pricing-grid section-grid">
          {PRICING_PLANS.map((plan) => {
            const Icon = PLAN_ICONS[plan.id] || IconStar;
            const tone = PLAN_TONES[plan.id] || "blue";

            return (
              <article
                key={plan.id}
                className={`span-4 pricing-card${plan.featured ? " pricing-card-featured" : ""}`}
              >
                {plan.featured && (
                  <span className="pricing-badge">Recommended</span>
                )}
                <IconBadge
                  icon={Icon}
                  tone={tone}
                  className="pricing-card-icon"
                />
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
                {plan.id === "free" ? (
                  <Link
                    href={plan.href}
                    className={`btn btn-block btn-sm ${plan.featured ? "btn-primary" : "btn-secondary"}`}
                  >
                    {plan.cta}
                  </Link>
                ) : (
                  <PricingPlanCta
                    planId={plan.id}
                    label={plan.checkoutLabel || plan.cta}
                    featured={plan.featured}
                  />
                )}
              </article>
            );
          })}
        </div>

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
