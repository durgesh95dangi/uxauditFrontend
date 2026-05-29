import AdminUserDetail from "../../../../components/admin/AdminUserDetail.jsx";
import { createPageMetadata } from "../../../../lib/metadata.js";

export async function generateMetadata({ params }) {
  const { userId } = await params;

  return createPageMetadata({
    title: "User Details",
    description: `Admin view for user ${userId}.`,
    path: `/admin/users/${userId}`,
    noIndex: true
  });
}

export default async function AdminUserDetailPage({ params }) {
  const { userId } = await params;
  return <AdminUserDetail userId={userId} />;
}
