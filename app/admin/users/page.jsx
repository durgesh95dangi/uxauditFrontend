import AdminUsers from "../../../components/admin/AdminUsers.jsx";
import { createPageMetadata } from "../../../lib/metadata.js";

export const metadata = createPageMetadata({
  title: "Admin Users",
  description: "View and manage UXAuditX user accounts.",
  path: "/admin/users"
});

export default function AdminUsersPage() {
  return <AdminUsers />;
}
