import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "../../lib/supabase/server.js";
import { createPageMetadata } from "../../lib/metadata.js";
import { toSafeUser } from "../../lib/user/safeUser.js";
import DashboardClient from "./DashboardClient.jsx";

export const metadata = createPageMetadata({
  title: "Dashboard",
  description: "Run website audits, track progress, and view your UX reports.",
  path: "/dashboard",
  noIndex: true
});

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <DashboardClient user={toSafeUser(user)} />;
}
