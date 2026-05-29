import Link from "next/link";
import SchemaMarkup from "../../components/SchemaMarkup.jsx";
import GuideLayout from "../../components/guide/GuideLayout.jsx";
import UsabilityChecklistInteractive from "../../components/guide/UsabilityChecklistInteractive.jsx";
import {
  ALL_CHECKLIST_ITEMS,
  CHECKLIST_GROUPS
} from "../../lib/landing/usabilityChecklist.js";
import { createAbsoluteTitleMetadata, SITE_URL } from "../../lib/metadata.js";

export const metadata = createAbsoluteTitleMetadata({
  title: "Free Website Usability Checklist — 25 Points to Check | UXAuditX",
  description:
    "A free 25-point website usability checklist covering hero, navigation, CTAs, mobile, and trust. Check items off as you go — then run a free audit to see issues with screenshots.",
  path: "/website-usability-checklist"
});

const FAQ_ITEMS = [
  {
    q: "What is a website usability checklist?",
    a: "A website usability checklist is a structured list of things to review on your site — headlines, buttons, mobile layout, trust signals, and more. It helps you spot landing page issues that block signups and sales without needing a design background."
  },
  {
    q: "How often should I use a usability checklist?",
    a: "Run through it when you launch a new page, after a redesign, or whenever conversions drop. Many teams re-check after each round of fixes to make sure changes actually worked on both desktop and mobile."
  },
  {
    q: "Can a checklist replace a UX audit?",
    a: "A checklist is a great starting point for manual review, but it relies on your own eyes. An automated UX audit catches issues you might miss — with screenshots of exactly where each problem is on your live page."
  }
];

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Website Usability Checklist — 25 Points to Check",
  description:
    "A five-step usability review covering hero, navigation, CTAs, mobile experience, and trust signals.",
  step: CHECKLIST_GROUPS.map((group, index) => ({
    "@type": "HowToStep",
    position: index + 1,
    name: group.title,
    text: `Review these five items: ${group.items.map((item) => item.title).join("; ")}.`
  }))
};

const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Website Usability Checklist",
  numberOfItems: ALL_CHECKLIST_ITEMS.length,
  itemListElement: ALL_CHECKLIST_ITEMS.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.title,
    description: item.body
  }))
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

export default function WebsiteUsabilityChecklistPage() {
  return (
    <>
      <SchemaMarkup schema={howToSchema} />
      <SchemaMarkup schema={itemListSchema} />
      <SchemaMarkup schema={faqSchema} />

      <GuideLayout
        eyebrow="Free checklist"
        title="Website usability checklist (25 things to check)"
        intro="Use this checklist to review your homepage or landing page for the most common usability problems — unclear headlines, hidden buttons, broken mobile layouts, and missing trust signals. Check off each item as you go."
      >
        <UsabilityChecklistInteractive />

        <div className="guide-cta guide-cta--inline">
          <h2 className="guide-cta-title">Found issues on your site?</h2>
          <p className="guide-cta-body">
            Run a free automated UX audit to see landing page issues with
            screenshots — most reports are ready in under a minute.
          </p>
          <Link href="/" className="btn btn-primary">
            Run a free automated audit to see them with screenshots →
          </Link>
        </div>

        <section className="legal-section">
          <h2>Frequently asked questions</h2>
          <dl className="guide-faq">
            {FAQ_ITEMS.map((item) => (
              <div key={item.q} className="guide-faq-item">
                <dt>{item.q}</dt>
                <dd>{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </GuideLayout>
    </>
  );
}
