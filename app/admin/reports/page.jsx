import AdminReports from "../../../components/admin/AdminReports.jsx";
import { createPageMetadata } from "../../../lib/metadata.js";

export const metadata = createPageMetadata({
  title: "Admin Reports",
  description: "Browse and manage all UX audit reports.",
  path: "/admin/reports"
});

export default function AdminReportsPage() {
  return <AdminReports />;
}
