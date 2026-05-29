import SiteNav from "../../components/layout/SiteNav.jsx";
import SiteFooter from "../../components/layout/SiteFooter.jsx";
import PricingSection from "../../components/landing/PricingSection.jsx";
import { createPageMetadata } from "../../lib/metadata.js";

export const metadata = createPageMetadata({
  title: "Pricing — Free, Pro & Agency Plans",
  description:
    "Start free with 2 audits per month. Upgrade to Pro for unlimited reports and shareable links. No credit card needed.",
  path: "/pricing"
});

export default function PricingPage() {
  return (
    <div className="page-shell">
      <SiteNav minimal />
      <main>
        <PricingSection withAnchor={false} />
      </main>
      <SiteFooter />
    </div>
  );
}
