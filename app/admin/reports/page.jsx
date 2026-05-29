import AdminReports from "../../../components/admin/AdminReports.jsx";
import { createPageMetadata } from "../../../lib/metadata.js";

export const metadata = createPageMetadata({
  title: "Admin Reports",
  description: "Browse and manage all UX audit reports.",
  path: "/admin/reports",
  noIndex: true
});

export default function AdminReportsPage() {
  return <AdminReports />;
}
