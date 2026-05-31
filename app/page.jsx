import Link from "next/link";
import { redirect } from "next/navigation";
import nextDynamic from "next/dynamic";
import { FREE_MONTHLY_AUDIT_LIMIT } from "../lib/audit/plans.js";
import { isSuperadmin } from "../lib/auth/superadmin.js";
import { getSupabaseServerClient } from "../lib/supabase/server.js";
import LandingPageBody from "../components/landing/LandingPageBody.jsx";
import OrbiSolutionSection from "../components/landing/OrbiSolutionSection.jsx";
import PricingSection from "../components/landing/PricingSection.jsx";
import SchemaMarkup from "../components/SchemaMarkup.jsx";
import { howItWorksSchema } from "../lib/landing/howItWorksSchema.js";
import {
  IconBadge,
  IconCheck,
  IconFile,
  IconPhone,
  IconScan,
  IconScreenshot,
  IconSparkles,
  IconStar,
  IconUsers,
  IconZap,
  SectionEyebrow
} from "../components/landing/LandingIcons.jsx";
import { createAbsoluteTitleMetadata, SITE_URL } from "../lib/metadata.js";

const LandingFaq = nextDynamic(() => import("../components/landing/LandingFaq.jsx"), {
  ssr: true
});

export const dynamic = "force-dynamic";

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
        text: "Yes. The free plan gives you 1 audit per month, screenshots on both devices, and a picture with every issue. No credit card required."
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
    body: "One free audit every month, no credit card, no catch.",
    icon: IconStar,
    tone: "amber"
  }
];

export default async function LandingPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    redirect(isSuperadmin(user) ? "/admin" : "/dashboard");
  }

  return (
    <div className="page-shell">
      <SchemaMarkup schema={softwareApplicationSchema} />
      <SchemaMarkup schema={faqSchema} />
      <SchemaMarkup schema={howItWorksSchema} />

      <LandingPageBody>
        <OrbiSolutionSection />

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
      </LandingPageBody>
    </div>
  );
}
