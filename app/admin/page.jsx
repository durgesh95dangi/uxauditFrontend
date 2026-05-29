import { redirect } from "next/navigation";
import { createPageMetadata } from "../../lib/metadata.js";

export const metadata = createPageMetadata({
  title: "Admin",
  description: "UXAuditX admin area.",
  path: "/admin",
  noIndex: true
});

export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}
