import { redirect } from "next/navigation";
import { requireSuperadminPage } from "../../lib/auth/requireSuperadmin.js";
import { createPageMetadata } from "../../lib/metadata.js";
import { toSafeUser } from "../../lib/user/safeUser.js";
import AdminShell from "./AdminShell.jsx";

export const metadata = createPageMetadata({
  title: "Admin",
  description: "UXAuditX admin area.",
  path: "/admin",
  noIndex: true
});

export const dynamic = "force-dynamic";

export default async function AdminRootLayout({ children }) {
  const gate = await requireSuperadminPage();

  if (!gate.ok) {
    redirect(gate.redirectTo);
  }

  return (
    <AdminShell user={toSafeUser(gate.user)} needsPin={gate.needsPin}>
      {children}
    </AdminShell>
  );
}
