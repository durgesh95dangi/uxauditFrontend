import AdminReportView from "./AdminReportView.jsx";
import { createPageMetadata } from "../../../../lib/metadata.js";

export async function generateMetadata({ params }) {
  const { jobId } = await params;

  return createPageMetadata({
    title: "Audit Report",
    description: `Admin view for audit report ${jobId}.`,
    path: `/admin/report/${jobId}`
  });
}

export default async function AdminReportPage({ params }) {
  const { jobId } = await params;
  return <AdminReportView jobId={jobId} />;
}
