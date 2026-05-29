import Link from "next/link";
import SchemaMarkup from "../../components/SchemaMarkup.jsx";
import GuideLayout, { GuideSection } from "../../components/guide/GuideLayout.jsx";
import { createAbsoluteTitleMetadata, SITE_URL } from "../../lib/metadata.js";

export const metadata = createAbsoluteTitleMetadata({
  title: "Landing Page Audit Guide — What to Check and How to Fix It | UXAuditX",
  description:
    "A landing page audit reviews your hero, CTAs, mobile layout, and trust signals to find what's stopping visitors from converting. Learn what to check and run one free.",
  path: "/landing-page-audit"
});

const FAQ_ITEMS = [
  {
    q: "What is a landing page audit?",
    a: "A landing page audit is a focused review of a single page — usually your homepage or a campaign page — looking for usability and conversion problems. It checks whether visitors understand your offer, can find the main button, and trust you enough to sign up or buy."
  },
  {
    q: "How is a landing page audit different from a full website audit?",
    a: "A landing page audit focuses on one high-traffic page where conversions happen. A full website audit covers multiple pages, navigation, and deeper flows. For most startups, fixing the landing page first delivers the fastest conversion wins."
  },
  {
    q: "Can I audit my landing page for free?",
    a: "Yes. Paste your landing page URL into UXAuditX and get a free report with screenshots of each section, ranked issues, and plain-English fixes — usually in under a minute."
  },
  {
    q: "What should I fix first on a landing page?",
    a: "Start with above-the-fold clarity: headline, main CTA visibility, and mobile layout. Those three areas affect every visitor. Then work through trust signals, page speed, and secondary CTAs."
  }
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Landing Page Audit Guide — What to Check and How to Fix It",
  description:
    "A practical guide to auditing your landing page for conversion blockers — hero clarity, CTAs, mobile layout, and trust signals.",
  author: {
    "@type": "Organization",
    name: "UXAuditX",
    url: SITE_URL
  },
  publisher: {
    "@type": "Organization",
    name: "UXAuditX",
    url: SITE_URL
  },
  datePublished: "2025-05-29",
  dateModified: "2025-05-29",
  mainEntityOfPage: `${SITE_URL}/landing-page-audit`
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a
    }
  }))
};

export default function LandingPageAuditPage() {
  return (
    <>
      <SchemaMarkup schema={articleSchema} />
      <SchemaMarkup schema={faqSchema} />

      <GuideLayout
        eyebrow="Landing page guide"
        title="Landing page audit: what to check and how to fix it"
        intro="A landing page audit is a focused review of the page where most of your visitors arrive — checking whether they understand your offer, can find the next step, and trust you enough to convert. Unlike a full-site review, it concentrates on the one page that drives signups, demos, or sales."
        cta={
          <>
            <h2 className="guide-cta-title">Audit your landing page free</h2>
            <p className="guide-cta-body">
              Paste your URL into UXAuditX. We screenshot every section on desktop
              and mobile, then send you a prioritized list of issues with fixes.
            </p>
            <Link href="/" className="btn btn-primary">
              Run a free landing page audit →
            </Link>
          </>
        }
      >
        <GuideSection title="What does a landing page audit include?">
          <p>
            A good landing page audit looks at the page the way a first-time
            visitor sees it — not the way you see it after months of tweaking.
            That usually means reviewing:
          </p>
          <ul>
            <li>
              <strong>Hero and above-the-fold</strong> — Does the headline explain
              what you offer in five seconds? Is the main button visible without
              scrolling?
            </li>
            <li>
              <strong>CTAs and conversion path</strong> — Is there one clear next
              step? Do buttons stand out from the background?
            </li>
            <li>
              <strong>Mobile layout</strong> — Does the page work on a phone, or
              does text break, overlap, or push the CTA too far down?
            </li>
            <li>
              <strong>Trust and credibility</strong> — Reviews, privacy links,
              security badges, and social proof where people decide to act.
            </li>
            <li>
              <strong>Clarity and readability</strong> — Font sizes, contrast,
              and whether the page says too much without making the point.
            </li>
          </ul>
        </GuideSection>

        <GuideSection title="Manual vs automated landing page audits">
          <p>
            You can audit a landing page yourself with a{" "}
            <Link href="/website-usability-checklist">usability checklist</Link>{" "}
            — walk through 25 common checks and note what fails. That works well
            if you have time and know what to look for.
          </p>
          <p>
            An automated tool like UXAuditX scrolls through your live page,
            captures screenshots on desktop and mobile, and flags issues with
            severity rankings and fix suggestions. Most reports are ready in under
            a minute — useful when you want evidence, not just a gut feeling.
          </p>
        </GuideSection>

        <GuideSection title="How to run a landing page audit on your site">
          <ol>
            <li>
              Pick the page that matters most — usually your homepage or main
              campaign URL.
            </li>
            <li>
              Review it on both desktop and phone (or use a tool that checks both).
            </li>
            <li>
              List every place a visitor might get confused, hesitate, or miss the
              CTA.
            </li>
            <li>
              Fix the highest-impact issues first — headline clarity and main
              button visibility usually come before footer polish.
            </li>
            <li>
              Re-audit after changes to confirm fixes worked.
            </li>
          </ol>
          <p>
            For a deeper background on UX audits in general, read{" "}
            <Link href="/what-is-a-ux-audit">what is a UX audit</Link>. If
            conversions are the main concern, see{" "}
            <Link href="/why-is-my-website-not-converting">
              why your site might not be converting
            </Link>
            .
          </p>
        </GuideSection>

        <GuideSection title="Frequently asked questions">
          <dl className="guide-faq">
            {FAQ_ITEMS.map((item) => (
              <div key={item.q} className="guide-faq-item">
                <dt>{item.q}</dt>
                <dd>{item.a}</dd>
              </div>
            ))}
          </dl>
        </GuideSection>
      </GuideLayout>
    </>
  );
}
