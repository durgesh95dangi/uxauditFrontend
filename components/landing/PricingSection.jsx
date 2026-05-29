import Link from "next/link";
import {
  IconBadge,
  IconStar,
  IconUsers,
  IconZap,
  SectionEyebrow
} from "./LandingIcons.jsx";

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    desc: "No credit card needed.",
    icon: IconStar,
    tone: "blue",
    features: [
      "2 reports a month",
      "Desktop and phone screenshots",
      "A picture with every issue",
      "Email support"
    ],
    featured: false,
    cta: "Get started",
    href: "/signup"
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    desc: "Best for teams improving their site every week.",
    icon: IconZap,
    tone: "violet",
    features: [
      "Unlimited reports",
      "Full details for every issue",
      "Priority support",
      "Shareable report links"
    ],
    featured: true,
    comingSoon: true,
    cta: "Coming soon"
  },
  {
    name: "Agency",
    price: "Custom",
    period: "",
    desc: "For agencies running audits across multiple client sites.",
    icon: IconUsers,
    tone: "indigo",
    features: [
      "Volume pricing",
      "Shared workspace (coming soon)",
      "White-label reports (coming soon)",
      "Direct support channel"
    ],
    featured: false,
    comingSoon: true,
    cta: "Coming soon"
  }
];

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
          <h2 className="section-title">Pricing that makes sense</h2>
        </div>
        <div className="grid pricing-grid section-grid">
          {PLANS.map((plan) => (
            <article
              key={plan.name}
              className={`span-4 pricing-card${plan.featured ? " pricing-card-featured" : ""}`}
            >
              {plan.featured && (
                <span className="pricing-badge">Recommended</span>
              )}
              <IconBadge
                icon={plan.icon}
                tone={plan.tone}
                className="pricing-card-icon"
              />
              <h3>{plan.name}</h3>
              <p className="pricing-price">
                {plan.price}
                {plan.period && <span>{plan.period}</span>}
              </p>
              <p className="pricing-desc">→ {plan.desc}</p>
              <ul className="pricing-features">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              {plan.comingSoon ? (
                <button
                  type="button"
                  className={`btn btn-block btn-sm ${plan.featured ? "btn-primary" : "btn-secondary"}`}
                  disabled
                >
                  {plan.cta}
                </button>
              ) : (
                <Link
                  href={plan.href}
                  className={`btn btn-block btn-sm ${plan.featured ? "btn-primary" : "btn-secondary"}`}
                >
                  {plan.cta}
                </Link>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
