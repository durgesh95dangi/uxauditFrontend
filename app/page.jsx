import Link from "next/link";
import dynamic from "next/dynamic";
import GridFrame from "../components/layout/GridFrame.jsx";
import SiteNav from "../components/layout/SiteNav.jsx";
import SiteFooter from "../components/layout/SiteFooter.jsx";
import MeshGradient from "../components/layout/MeshGradient.jsx";
import CompanyLogos from "../components/landing/CompanyLogos.jsx";
import ExampleFindingCard from "../components/landing/ExampleFindingCard.jsx";
import HeroReport from "../components/landing/HeroReport.jsx";
import PricingSection from "../components/landing/PricingSection.jsx";
import AnimateIn from "../components/landing/AnimateIn.jsx";
import SchemaMarkup from "../components/SchemaMarkup.jsx";
import { howItWorksSchema } from "../lib/landing/howItWorksSchema.js";
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
import { createAbsoluteTitleMetadata, SITE_URL } from "../lib/metadata.js";

const FeatureVisual = dynamic(() => import("../components/landing/FeatureVisual.jsx"), {
  ssr: true
});

const HowItWorks = dynamic(() => import("../components/landing/HowItWorks.jsx"), {
  ssr: true
});

const LandingFaq = dynamic(() => import("../components/landing/LandingFaq.jsx"), {
  ssr: true
});

export const metadata = createAbsoluteTitleMetadata({
  title: "Free Website UX Audit Tool — Find What's Losing You Customers | UXAuditX",
  description:
    "Paste your URL and get a prioritized list of UX, CRO and usability issues with screenshots. Free. No code. Ready in under a minute."
});

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "UXAuditX",
  applicationCategory: "BusinessApplication",
  description:
    "Automated website UX audit tool that takes screenshots of every section and delivers a prioritized report of usability, CRO, and design issues.",
  url: SITE_URL,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD"
  },
  featureList: [
    "Automated UX audit with screenshots",
    "CRO issue detection",
    "Mobile and desktop analysis",
    "Severity-ranked report",
    "No code required"
  ]
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How does UXAuditX work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You paste your URL. We open your site, scroll through every section like a visitor, take screenshots, and build a report. Each issue shows you the exact spot on your page, how serious it is, and what to do about it. Most reports are ready in under a minute."
      }
    },
    {
      "@type": "Question",
      name: "Is UXAuditX free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The free Starter plan gives you 3 reports per month, screenshots on both devices, and a picture with every issue. No credit card required."
      }
    },
    {
      "@type": "Question",
      name: "What does a UX audit check?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Button and CTA clarity, readability, mobile layout issues, trust signals, page speed problems, and whether your headline makes sense to a first-time visitor. It checks both desktop and phone."
      }
    },
    {
      "@type": "Question",
      name: "Do I need to install anything?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Paste a link, get a report. Nothing to install, no code, no browser extension."
      }
    },
    {
      "@type": "Question",
      name: "How is this different from a speed test?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Speed tests only check load time. UXAuditX looks at everything a real visitor actually sees — clarity, layout, trust, mobile usability, and whether people know what to do next. Speed is one part of it, but it's far from the whole picture."
      }
    }
  ]
};

const WHY_CHOOSE = [
  {
    title: "Evidence over scores",
    body: "Most tools give you a number. We give you a picture. Every issue points to the exact spot on your page — you can see the problem in under three seconds.",
    icon: IconScreenshot,
    tone: "violet"
  },
  {
    title: "Made for non-technical people",
    body: "You don't need to know what \"cumulative layout shift\" means. We write every finding in plain language. If you can paste a link, you can use this.",
    icon: IconUsers,
    tone: "indigo"
  },
  {
    title: "Fixes you can actually do",
    body: "\"Improve usability\" isn't a fix. \"Make the button a brighter color so it stands out from the background\" is. Every issue comes with a specific, clear suggestion.",
    icon: IconCheck,
    tone: "emerald"
  },
  {
    title: "Answers in under a minute",
    body: "Hiring a UX consultant takes weeks and costs hundreds. You can have your first report in the time it takes to make a coffee. Run it again whenever you make changes.",
    icon: IconZap,
    tone: "blue"
  },
  {
    title: "Phone and computer, both checked",
    body: "More than half your visitors are on their phones. We audit your site on both mobile and desktop and flag issues on each separately.",
    icon: IconPhone,
    tone: "rose"
  },
  {
    title: "Free to start",
    body: "Three audits a month, no credit card, no catch.",
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
    title: "Buttons and next steps",
    body: "Is your main button obvious at a glance? Does it stand out from everything around it? Is there a clear next step after someone reads your headline?",
    icon: IconPointer,
    tone: "indigo"
  },
  {
    title: "Loading speed",
    body: "Slow sections and content that jumps around while your page is still loading. Both hurt trust and conversions.",
    icon: IconGauge,
    tone: "blue"
  },
  {
    title: "Readability",
    body: "Hard-to-read text, tiny font sizes, low contrast, unclear labels. If someone has to squint or re-read, they'll leave.",
    icon: IconEye,
    tone: "violet"
  },
  {
    title: "Mobile layout",
    body: "Buttons too small to tap, text that breaks awkwardly, overlapping elements on a phone screen.",
    icon: IconPhone,
    tone: "emerald"
  },
  {
    title: "Trust signals",
    body: "Reviews, privacy links, security badges, and refund policies. These are the things that reassure people right before they pay.",
    icon: IconShield,
    tone: "amber"
  },
  {
    title: "Clear message",
    body: "Can a new visitor tell what you offer within five seconds of landing? If not, most of them will click away.",
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

export default function LandingPage() {
  return (
    <div className="page-shell">
      <SchemaMarkup schema={softwareApplicationSchema} />
      <SchemaMarkup schema={faqSchema} />
      <SchemaMarkup schema={howItWorksSchema} />
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
                    See what&apos;s actually losing you customers — with screenshots
                  </h1>
                  <p className="hero-lead">
                    Paste your URL. We open your website, scroll through every section,
                    take pictures, and hand you a plain-English list of what&apos;s broken
                    — each with a photo of exactly where it is and a simple fix. Most
                    reports are ready in under a minute.
                  </p>
                  <div className="hero-actions">
                    <Link href="/signup" className="btn btn-primary">
                      Check my website free →
                    </Link>
                  </div>
                  <p className="hero-trust-line">
                    No install · No code · No designer needed · Free plan available
                  </p>
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
              <h2 className="section-title">Why people use UXAuditX instead of guessing</h2>
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
                What UXAuditX checks on your page
              </h2>
              <p className="section-lead section-lead-left">
                We review your pages the way a first-time visitor would — looking
                for anything that gets in the way of them signing up, buying, or
                contacting you.
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

        <PricingSection />

        <section id="faq" className="section-band section-band-soft">
          <div className="container section-band-narrow">
            <div className="section-header section-header-left">
              <SectionEyebrow icon={IconFile}>FAQ</SectionEyebrow>
              <h2 className="section-title section-title-left">Common questions</h2>
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
