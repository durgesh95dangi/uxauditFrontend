import Link from "next/link";
import SchemaMarkup from "../../components/SchemaMarkup.jsx";
import GuideLayout, { GuideSection } from "../../components/guide/GuideLayout.jsx";
import { createAbsoluteTitleMetadata, SITE_URL } from "../../lib/metadata.js";

export const metadata = createAbsoluteTitleMetadata({
  title: "Free Website Audit Tool — UX & Usability Check with Screenshots | UXAuditX",
  description:
    "Free website audit tool that screenshots every section on desktop and mobile, then gives you a prioritized UX report with plain fixes. No code. No install.",
  path: "/free-website-audit-tool"
});

const FAQ_ITEMS = [
  {
    q: "Is UXAuditX really free?",
    a: "Yes. The Starter plan includes 2 audits per month with desktop and mobile screenshots, a picture with every issue, and email support. No credit card required to sign up."
  },
  {
    q: "What does the free website audit check?",
    a: "It reviews your live page for UX and conversion issues: headline clarity, CTA visibility, mobile layout, trust signals, readability, and loading problems. Each finding includes a screenshot of where the issue appears."
  },
  {
    q: "How is this different from Google PageSpeed or SEO tools?",
    a: "Speed and SEO tools focus on technical metrics. UXAuditX looks at what visitors actually see — whether the page makes sense, whether buttons are obvious, and whether the mobile layout works. Speed is one factor, but clarity and trust matter just as much."
  },
  {
    q: "How long does a free audit take?",
    a: "Most reports are ready in under a minute. Paste your URL, wait while we scroll and capture each section, then read your prioritized report."
  }
];

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "UXAuditX Free Website Audit Tool",
  applicationCategory: "BusinessApplication",
  description:
    "Free automated website UX audit that captures screenshots of every section and delivers a prioritized report with fixes.",
  url: SITE_URL,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD"
  }
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

export default function FreeWebsiteAuditToolPage() {
  return (
    <>
      <SchemaMarkup schema={softwareSchema} />
      <SchemaMarkup schema={faqSchema} />

      <GuideLayout
        eyebrow="Free tool"
        title="Free website audit tool — UX checks with screenshots"
        intro="UXAuditX is a free website audit tool that opens your live page, scrolls through every section like a visitor, and returns a prioritized list of usability and conversion issues — each with a screenshot on desktop and mobile and a plain suggestion for what to fix."
        cta={
          <>
            <h2 className="guide-cta-title">Run your free audit now</h2>
            <p className="guide-cta-body">
              Sign up free, paste any URL, and get your report in under a minute.
              No code, no browser extension, no credit card.
            </p>
            <Link href="/signup" className="btn btn-primary">
              Start free audit →
            </Link>
          </>
        }
      >
        <GuideSection title="What you get with a free audit">
          <ul>
            <li>Screenshots of every section on desktop and phone</li>
            <li>Issues ranked by severity — critical problems first</li>
            <li>A picture pointing to exactly where each issue is</li>
            <li>Plain-English fix suggestions, not vague advice</li>
            <li>2 reports per month on the free Starter plan</li>
          </ul>
        </GuideSection>

        <GuideSection title="How the free audit works">
          <ol>
            <li>
              <strong>Paste your link</strong> — Any public URL. Nothing to install.
            </li>
            <li>
              <strong>We review every section</strong> — We scroll your page on
              desktop and mobile and capture each part.
            </li>
            <li>
              <strong>Your report is ready</strong> — Ranked issues with
              screenshots and specific fixes.
            </li>
          </ol>
          <p>
            See the full walkthrough on our{" "}
            <Link href="/how-it-works">how it works</Link> page.
          </p>
        </GuideSection>

        <GuideSection title="When to use a free website audit">
          <p>
            Run a free audit when you launch a new page, after a redesign, or
            when traffic is up but signups are flat. It&apos;s also useful before
            hiring a designer — you&apos;ll know exactly what to ask them to fix.
          </p>
          <p>
            Pair it with our{" "}
            <Link href="/website-usability-checklist">25-point usability checklist</Link>{" "}
            for a manual pass, or read{" "}
            <Link href="/landing-page-audit">the landing page audit guide</Link>{" "}
            if you only need to fix one high-traffic page.
          </p>
        </GuideSection>

        <GuideSection title="Free vs Pro">
          <p>
            The free Starter plan covers most solo founders and small teams — 2
            audits per month with full screenshots and issue details.{" "}
            <Link href="/pricing">Pro</Link> adds unlimited reports and shareable
            links if you need to send findings to a designer or client.
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
