import Link from "next/link";
import SchemaMarkup from "../../components/SchemaMarkup.jsx";
import GuideLayout, { GuideSection } from "../../components/guide/GuideLayout.jsx";
import { createAbsoluteTitleMetadata, SITE_URL } from "../../lib/metadata.js";

export const metadata = createAbsoluteTitleMetadata({
  title: "What Is a UX Audit? Complete Guide for 2025 | UXAuditX",
  description:
    "A UX audit is a systematic review of your website that finds usability problems, conversion blockers, and design issues. Learn what it includes, how it works, and how to run one free.",
  path: "/what-is-a-ux-audit"
});

const FAQ_ITEMS = [
  {
    q: "Do I need a designer to run a UX audit?",
    a: "No. Automated tools like UXAuditX let you paste a URL and get a report in under a minute — no design background required. You can share the findings with a designer later if you want help implementing fixes."
  },
  {
    q: "How often should I run a UX audit?",
    a: "Run one when you launch a new page, after a redesign, or whenever conversion rates drop. Many teams check again after each round of changes to make sure fixes actually worked."
  },
  {
    q: "Is a UX audit the same as user testing?",
    a: "Not exactly. User testing watches real people use your site. A UX audit reviews your pages systematically — like a trained expert walking through every section — and flags issues with screenshots and fixes."
  },
  {
    q: "Can a UX audit help with conversions?",
    a: "Yes. Most conversion problems are visible on the page: unclear buttons, weak headlines, missing trust signals, or layouts that break on phones. A UX audit finds those blockers and tells you what to change."
  }
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "What Is a UX Audit?",
  description:
    "A UX audit is a systematic review of your website that finds usability problems, conversion blockers, and design issues.",
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
  mainEntityOfPage: `${SITE_URL}/what-is-a-ux-audit`
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

export default function WhatIsAUxAuditPage() {
  return (
    <>
      <SchemaMarkup schema={articleSchema} />
      <SchemaMarkup schema={faqSchema} />

      <GuideLayout
        title="What is a UX audit?"
        intro="A UX audit is a structured review of your website from a visitor's point of view. It finds what's confusing, broken, or blocking people from signing up or buying — with pictures of each issue and plain suggestions to fix them."
        cta={
          <>
            <h2 className="guide-cta-title">Run a free UX audit on your site</h2>
            <p className="guide-cta-body">
              Paste your URL and get a prioritized report with screenshots — most
              are ready in under a minute. No install, no code, no credit card.
            </p>
            <Link href="/" className="btn btn-primary">
              Check my website free →
            </Link>
          </>
        }
      >
        <GuideSection title="What does a UX audit include?">
          <p>
            A good UX audit looks at your page the way a first-time visitor
            would — not just your code or your search rankings. It typically
            covers:
          </p>
          <ul>
            <li>
              <strong>Buttons and next steps</strong> — Is your main action
              obvious? Does it stand out from everything around it?
            </li>
            <li>
              <strong>Readability</strong> — Font sizes, contrast, and wording
              that people can scan without squinting or re-reading.
            </li>
            <li>
              <strong>Mobile layout</strong> — Buttons too small to tap, text
              that breaks awkwardly, overlapping elements on a phone screen.
            </li>
            <li>
              <strong>Trust signals</strong> — Reviews, privacy links, security
              badges, and refund policies that reassure people before they pay.
            </li>
            <li>
              <strong>Loading speed</strong> — Slow sections and content that
              jumps around while the page is still loading.
            </li>
            <li>
              <strong>Clear message</strong> — Can someone tell what you offer
              within five seconds of landing?
            </li>
          </ul>
          <p>
            With{" "}
            <Link href="/">UXAuditX</Link>, every finding comes with a
            screenshot of exactly where the problem is — not just a vague score.
          </p>
        </GuideSection>

        <GuideSection title="How long does a UX audit take?">
          <p>
            A manual UX audit from a consultant can take days or weeks — booking
            calls, sharing access, waiting for a PDF. Automated tools are much
            faster.
          </p>
          <p>
            With UXAuditX, you paste your URL and most reports are ready in under
            a minute. We scroll through every section on both phone and computer,
            take pictures as we go, and rank the biggest problems first.
          </p>
        </GuideSection>

        <GuideSection title="What's the difference between a UX audit and an SEO audit?">
          <p>
            An <strong>SEO audit</strong> focuses on search engines — keywords,
            meta tags, crawl errors, backlinks, and whether Google can index your
            pages properly.
          </p>
          <p>
            A <strong>UX audit</strong> focuses on people — what they see, click,
            and understand when they actually land on your site. You can rank #1
            on Google and still lose visitors if your button is hard to find or
            your headline makes no sense.
          </p>
          <p>
            Both matter. SEO brings people to your door. UX decides whether they
            stay, trust you, and convert.
          </p>
        </GuideSection>

        <GuideSection title="How do I run a UX audit on my website?">
          <p>You have two main options:</p>
          <ol>
            <li>
              <strong>Hire a UX consultant</strong> — Best for large redesigns
              or complex products. Expect higher cost and longer turnaround.
            </li>
            <li>
              <strong>Use an automated audit tool</strong> — Best for quick,
              repeatable checks on live pages. Paste a URL, get a report with
              screenshots and fixes in under a minute.
            </li>
          </ol>
          <p>
            To run one free right now, go to the{" "}
            <Link href="/">UXAuditX homepage</Link>, paste your URL, and read
            your report. If you want a deeper look at landing pages specifically,
            see our{" "}
            <Link href="/landing-page-audit">landing page audit guide</Link>.
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
