"use client";

import { useRouter } from "next/navigation";
import AuditReport from "../../../../components/audit/AuditReport.jsx";
import AdminPageHeader from "../../../../components/admin/AdminPageHeader.jsx";

export default function AdminReportView({ jobId }) {
  const router = useRouter();

  return (
    <div className="admin-page admin-page--report">
      <AuditReport
        jobId={jobId}
        reportEndpoint={`/api/admin/report/${jobId}`}
        onBackToReports={() => router.push("/admin/reports")}
        backLabel="← Reports"
        renderAfterToolbar={
          <AdminPageHeader title="Audit report" subtitle="Full UX audit report" />
        }
      />
    </div>
  );
}
