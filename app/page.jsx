import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "../lib/supabase/server.js";
import GridFrame from "../components/layout/GridFrame.jsx";
import SiteNav from "../components/layout/SiteNav.jsx";
import SiteFooter from "../components/layout/SiteFooter.jsx";
import MeshGradient from "../components/layout/MeshGradient.jsx";
import CompanyLogos from "../components/landing/CompanyLogos.jsx";
import ExampleFindingCard from "../components/landing/ExampleFindingCard.jsx";
import HeroReport from "../components/landing/HeroReport.jsx";
import HowItWorks from "../components/landing/HowItWorks.jsx";
import FeatureVisual from "../components/landing/FeatureVisual.jsx";
import AnimateIn from "../components/landing/AnimateIn.jsx";
import LandingFaq from "../components/landing/LandingFaq.jsx";
import {
  IconAlert,
  IconBadge,
  IconCheck,
  IconEye,
  IconFile,
  IconGauge,
  IconGlobe,
  IconLayout,
  IconPhone,
  IconPointer,
  IconReport,
  IconScan,
  IconScreenshot,
  IconShield,
  IconSparkles,
  IconStar,
  IconText,
  IconUsers,
  IconZap,
  SectionEyebrow
} from "../components/landing/LandingIcons.jsx";
import { createAbsoluteTitleMetadata } from "../lib/metadata.js";

export const metadata = createAbsoluteTitleMetadata({
  title: "Free Website UX Audit Tool — Find What's Losing You Customers | UXAuditX",
  description:
    "Paste your URL and get a prioritized report of UX, CRO, and usability issues — with screenshots. Free. No code. Ready in under a minute.",
  openGraphTitle: "UXAuditX — Website Audit With Screenshots",
  openGraphDescription:
    "Find what's confusing visitors on your site. Every issue comes with a picture and a simple fix."
});

export const dynamic = "force-dynamic";

const WHY_CHOOSE = [
  {
    title: "Made for non-technical people",
    body: "If you can paste a link, you can use it. No code, no setup, and no confusing terms.",
    icon: IconUsers,
    tone: "indigo"
  },
  {
    title: "See the proof, not just a score",
    body: "Every issue comes with a picture of exactly where it is on your page.",
    icon: IconScreenshot,
    tone: "violet"
  },
  {
    title: "Fixes you can actually act on",
    body: "Each problem includes a clear, simple suggestion for what to do next.",
    icon: IconCheck,
    tone: "emerald"
  },
  {
    title: "Answers in under a minute",
    body: "Most reports are ready before your coffee is. Check again anytime you make a change.",
    icon: IconZap,
    tone: "blue"
  },
  {
    title: "Phone and computer, both checked",
    body: "Most visitors are on their phones, so we review your site on both.",
    icon: IconPhone,
    tone: "rose"
  },
  {
    title: "Free to start",
    body: "Run 3 reports a month at no cost. No card needed to sign up.",
    icon: IconStar,
    tone: "amber"
  }
];

const POWER_FEATURES = [
  {
    title: "We look at your real, live page",
    body:
      "We open your website the same way a visitor does, scroll through the whole page, and take a picture of every section — on both computer and phone.",
    mockType: "browser",
    icon: IconGlobe,
    tone: "indigo"
  },
  {
    title: "Every issue comes with a picture",
    body:
      "Each problem we find points to the exact spot on your page. You get how serious it is, why it matters, and a simple suggestion to fix it.",
    mockType: "issue",
    icon: IconScreenshot,
    tone: "violet"
  },
  {
    title: "One clear report, most urgent first",
    body:
      "The biggest problems show up at the top. Work through the list yourself or share it with your designer, and check again anytime after you make changes.",
    mockType: "report",
    icon: IconReport,
    tone: "blue"
  }
];

const AUDIT_AREAS = [
  {
    title: "Buttons & next steps",
    body: "Whether your main button stands out and what to do next is obvious at a glance.",
    icon: IconPointer,
    tone: "indigo"
  },
  {
    title: "Loading speed",
    body: "Slow sections and content that jumps around while your page is still loading.",
    icon: IconGauge,
    tone: "blue"
  },
  {
    title: "Easy to read & use",
    body: "Hard-to-read text, unclear labels, and anything that makes the page confusing.",
    icon: IconEye,
    tone: "violet"
  },
  {
    title: "Looks right on phones",
    body: "Buttons too small to tap, overlapping pieces, and text that breaks on a phone screen.",
    icon: IconPhone,
    tone: "emerald"
  },
  {
    title: "Builds trust",
    body: "Reviews, policies, and security cues — the things that reassure people before they pay.",
    icon: IconShield,
    tone: "amber"
  },
  {
    title: "Clear message",
    body: "Whether a new visitor can tell what you offer within a few seconds of arriving.",
    icon: IconText,
    tone: "rose"
  }
];

const SAMPLE_FINDINGS = [
  {
    severity: "critical",
    title: "Your main button is hard to see",
    context: "On phone · top of the page",
    section: "Top of page",
    viewport: "Phone",
    proof: "/landing/finding-hero-cta.svg",
    proofAlt: "Phone screenshot with a hard-to-see button highlighted",
    fix: "Make the button a brighter color so it stands out from the background.",
    icon: IconAlert
  },
  {
    severity: "high",
    title: "Your headline breaks onto messy lines",
    context: "On tablet · top of the page",
    section: "Top of page",
    viewport: "Tablet",
    proof: "/landing/finding-headline.svg",
    proofAlt: "Tablet screenshot with an awkwardly wrapped headline highlighted",
    fix: "Shorten the headline so it reads cleanly on smaller screens.",
    icon: IconLayout
  },
  {
    severity: "medium",
    title: "No privacy link in the footer",
    context: "On computer · bottom of the page",
    section: "Footer",
    viewport: "Computer",
    proof: "/landing/finding-footer.svg",
    proofAlt: "Computer screenshot with a missing privacy link highlighted",
    fix: "Add a Privacy link next to your Terms link in the footer.",
    icon: IconFile
  }
];

const PLANS = [
  {
    name: "Starter",
    price: "$0",
    period: "/mo",
    desc: "Enough to try it on your own site.",
    icon: IconStar,
    tone: "blue",
    features: [
      "3 reports a month",
      "Computer & phone report",
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
    period: "/mo",
    desc: "For teams improving their site every week.",
    icon: IconZap,
    tone: "violet",
    features: [
      "Unlimited reports",
      "Computer & phone screenshots",
      "Full details for every issue",
      "Priority support",
      "Shareable report links"
    ],
    featured: true,
    cta: "Get started",
    href: "/signup"
  },
  {
    name: "Agency",
    price: "Custom",
    period: "",
    desc: "Multiple client sites, invoicing, and onboarding help.",
    icon: IconUsers,
    tone: "indigo",
    features: [
      "Volume pricing",
      "Shared workspace (coming soon)",
      "White-label reports (coming soon)",
      "Direct support channel"
    ],
    featured: false,
    cta: "Email us",
    href: "mailto:hello@uxauditx.com"
  }
];

export default async function LandingPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="page-shell">
      <SiteNav />

      <main>
        <div className="landing-fold">
          <GridFrame />
          <section className="hero-band hero-band-split">
            <MeshGradient />
            <div className="container">
              <div className="grid hero-grid hero-split">
                <div className="hero-split-copy">
                  <div className="hero-eyebrow hero-eyebrow-badge">
                    <IconScan size={14} />
                    See your site through your visitors&apos; eyes
                  </div>
                  <h1 className="hero-title">
                    See what&apos;s wrong with your site — with screenshots
                  </h1>
                  <p className="hero-lead">
                    UXAuditX opens your website, takes pictures of every section,
                    and hands you a clear list of what&apos;s confusing or losing
                    customers — with simple fixes. Most reports are ready in under a
                    minute.
                  </p>
                  <div className="hero-actions">
                    <Link href="/signup" className="btn btn-primary">
                      Run a free audit
                    </Link>
                    <a href="#how-it-works" className="btn btn-secondary">
                      How it works
                    </a>
                  </div>
                  <ul className="hero-meta hero-meta-icons">
                    <li><IconZap size={14} /> 3 free reports a month</li>
                    <li><IconGlobe size={14} /> Nothing to install</li>
                    <li><IconShield size={14} /> Works on any live site</li>
                  </ul>
                </div>
                <div className="hero-split-visual">
                  <HeroReport />
                </div>
              </div>
            </div>
          </section>
        </div>

        <CompanyLogos />

        <HowItWorks />

        <section id="why" className="section-band section-band-soft">
          <div className="container">
            <div className="section-header section-header-center">
              <SectionEyebrow icon={IconSparkles} center>
                Why UXAuditX
              </SectionEyebrow>
              <h2 className="section-title">Why choose UXAuditX</h2>
              <p className="section-lead">
                Built for busy founders and small teams — clear answers, real
                proof, and no jargon.
              </p>
            </div>
            <div className="grid section-grid">
              {WHY_CHOOSE.map((item) => (
                <article
                  key={item.title}
                  className={`span-4 card-marketing card-marketing-flat card-marketing-icon card-marketing-icon--${item.tone}`}
                >
                  <IconBadge icon={item.icon} tone={item.tone} />
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="section-band">
          <div className="container">
            <div className="section-header section-header-left">
              <SectionEyebrow icon={IconSparkles}>What you get</SectionEyebrow>
              <h2 className="section-title section-title-left">How it works</h2>
              <p className="section-lead section-lead-left">
                No jargon, no setup. Just paste your link and get a clear list of
                what to fix.
              </p>
            </div>

            <div className="feature-showcase-list">
              {POWER_FEATURES.map((feature, i) => (
                <AnimateIn key={feature.title} delay={i * 80} className="feature-showcase-wrap">
                <article
                  className={`grid feature-showcase${i % 2 === 1 ? " feature-showcase-reverse" : ""}`}
                >
                  <div className="feature-showcase-copy">
                    <IconBadge icon={feature.icon} tone={feature.tone} />
                    <h3>{feature.title}</h3>
                    <p>{feature.body}</p>
                  </div>
                  <FeatureVisual type={feature.mockType} />
                </article>
                </AnimateIn>
              ))}
            </div>
          </div>
        </section>

        <section id="areas" className="section-band section-band-soft">
          <div className="container">
            <div className="section-header section-header-left">
              <SectionEyebrow icon={IconEye}>What we check</SectionEyebrow>
              <h2 className="section-title section-title-left">
                What we look at on your page
              </h2>
              <p className="section-lead section-lead-left">
                We review your pages the way a first-time visitor would, and point
                out what gets in the way of them signing up or buying.
              </p>
            </div>
            <div className="grid section-grid">
              {AUDIT_AREAS.map((area) => (
                <article key={area.title} className={`span-4 card-marketing card-marketing-flat card-marketing-icon card-marketing-icon--${area.tone}`}>
                  <IconBadge icon={area.icon} tone={area.tone} />
                  <h3>{area.title}</h3>
                  <p>{area.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="examples" className="section-band section-band-soft">
          <div className="container">
            <div className="section-header section-header-left">
              <SectionEyebrow icon={IconReport}>Examples</SectionEyebrow>
              <h2 className="section-title section-title-left">What you&apos;ll see</h2>
              <p className="section-lead section-lead-left">
                Real examples from a report — each one shows the problem, a picture
                of where it is, and a simple way to fix it.
              </p>
            </div>
            <div className="grid findings-grid section-grid">
              {SAMPLE_FINDINGS.map((item) => (
                <ExampleFindingCard key={item.title} finding={item} />
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="section-band">
          <div className="container">
            <div className="section-header section-header-center">
              <SectionEyebrow icon={IconStar} center>Plans</SectionEyebrow>
              <h2 className="section-title">Pricing</h2>
              <p className="section-lead">
                Start on Starter. Upgrade when you&apos;re running audits every week.
              </p>
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
                  <IconBadge icon={plan.icon} tone={plan.tone} className="pricing-card-icon" />
                  <h3>{plan.name}</h3>
                  <p className="pricing-price">
                    {plan.price}
                    {plan.period && <span>{plan.period}</span>}
                  </p>
                  <p className="pricing-desc">{plan.desc}</p>
                  <ul className="pricing-features">
                    {plan.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <Link
                    href={plan.href}
                    className={`btn btn-block btn-sm ${plan.featured ? "btn-primary" : "btn-secondary"}`}
                  >
                    {plan.cta}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="section-band section-band-soft">
          <div className="container section-band-narrow">
            <div className="section-header section-header-left">
              <SectionEyebrow icon={IconFile}>FAQ</SectionEyebrow>
              <h2 className="section-title section-title-left">Questions</h2>
            </div>
            <LandingFaq />
          </div>
        </section>

        <section className="showcase-band-dark">
          <div className="container showcase-band-dark-inner showcase-cta-inner">
            <div className="cta-illustration" aria-hidden="true">
              <IconScan size={48} />
            </div>
            <h2 className="section-title section-title-on-dark">
              Check your website now
            </h2>
            <p className="section-lead section-lead-on-dark">
              Sign up, paste your link, and read your report. That&apos;s it.
            </p>
            <div className="hero-actions">
              <Link href="/signup" className="btn btn-primary">
                Create free account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
