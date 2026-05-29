import SiteNav from "../../components/layout/SiteNav.jsx";
import SiteFooter from "../../components/layout/SiteFooter.jsx";
import HowItWorks from "../../components/landing/HowItWorks.jsx";
import SchemaMarkup from "../../components/SchemaMarkup.jsx";
import { howItWorksSchema } from "../../lib/landing/howItWorksSchema.js";
import { createPageMetadata, SITE_URL } from "../../lib/metadata.js";

export const metadata = createPageMetadata({
  title: "How UXAuditX Works — Website Audit in 3 Steps",
  description:
    "Paste your URL. We screenshot every section. You get a report with the biggest problems first and a simple fix for each one.",
  path: "/how-it-works"
});

const howItWorksPageSchema = {
  ...howItWorksSchema,
  url: `${SITE_URL}/how-it-works`
};

export default function HowItWorksPage() {
  return (
    <div className="page-shell">
      <SchemaMarkup schema={howItWorksPageSchema} />
      <SiteNav minimal />
      <main>
        <HowItWorks />
      </main>
      <SiteFooter />
    </div>
  );
}
