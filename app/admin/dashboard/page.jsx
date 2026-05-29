import AdminDashboard from "../../../components/admin/AdminDashboard.jsx";
import { createPageMetadata } from "../../../lib/metadata.js";

export const metadata = createPageMetadata({
  title: "Admin Dashboard",
  description: "Overview of audits, users, and platform activity.",
  path: "/admin/dashboard"
});

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
