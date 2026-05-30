import SiteNav from "../../components/layout/SiteNav.jsx";
import SiteFooter from "../../components/layout/SiteFooter.jsx";
import PricingSection from "../../components/landing/PricingSection.jsx";
import { createPageMetadata } from "../../lib/metadata.js";

export const metadata = createPageMetadata({
  title: "Pricing — Free, Founder & Agency Plans",
  description:
    "Start free with 1 audit per month. Founder plan ($19/mo) includes 5 audits. Agency plan ($199/mo) includes 50 audits. Custom pricing available.",
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
