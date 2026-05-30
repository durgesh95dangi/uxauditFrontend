import { redirect } from "next/navigation";
import { isSuperadmin } from "../../lib/auth/superadmin.js";
import { getSupabaseServerClient } from "../../lib/supabase/server.js";
import { toSafeUser } from "../../lib/user/safeUser.js";
import { createPageMetadata } from "../../lib/metadata.js";
import PricingPageClient from "./PricingPageClient.jsx";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Pricing — Free, Founder & Agency Plans",
  description:
    "Start free with 1 audit per month. Founder plan ($19/mo) includes 5 audits. Agency plan ($199/mo) includes 50 audits. Custom pricing available.",
  path: "/pricing"
});

export default async function PricingPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user && isSuperadmin(user)) {
    redirect("/admin");
  }

  return <PricingPageClient user={toSafeUser(user)} />;
}
