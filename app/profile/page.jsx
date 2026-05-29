import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "../../lib/supabase/server.js";
import { createPageMetadata } from "../../lib/metadata.js";
import { toSafeUser } from "../../lib/user/safeUser.js";
import ProfileClient from "./ProfileClient.jsx";

export const metadata = createPageMetadata({
  title: "Profile",
  description: "Manage your UXAuditX account settings and profile details.",
  path: "/profile"
});

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <ProfileClient user={toSafeUser(user)} />;
}
