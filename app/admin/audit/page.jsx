import AdminAuditRunner from "../../../components/admin/AdminAuditRunner.jsx";
import { createPageMetadata } from "../../../lib/metadata.js";

export const metadata = createPageMetadata({
  title: "Run Audit",
  description: "Run a UX audit from the admin panel.",
  path: "/admin/audit"
});

export default function AdminAuditPage() {
  return <AdminAuditRunner />;
}
