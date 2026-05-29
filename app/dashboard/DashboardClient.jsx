"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowserClient } from "../../lib/supabase/client.js";
import AuditInput from "../../components/audit/AuditInput.jsx";
import AuditProgress from "../../components/audit/AuditProgress.jsx";
import AuditReport from "../../components/audit/AuditReport.jsx";
import RecentAudits from "../../components/audit/RecentAudits.jsx";
import SiteNav from "../../components/layout/SiteNav.jsx";

export default function DashboardClient({ user }) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [view, setView] = useState("input");
  const [jobId, setJobId] = useState(null);
  const [activeReportJobId, setActiveReportJobId] = useState(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  function handleJobStart(newJobId) {
    setJobId(newJobId);
    setView("progress");
  }

  function handleComplete(completedJobId) {
    setActiveReportJobId(completedJobId);
    setView("report");
  }

  function handleViewReport(reportJobId) {
    setActiveReportJobId(reportJobId);
    setView("report");
  }

  function handleViewProgress(runningJobId) {
    setJobId(runningJobId);
    setView("progress");
  }

  function handleBackToReports() {
    setView("input");
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="dashboard-shell">
      <SiteNav
        user={user}
        onSignOut={handleSignOut}
        isSigningOut={isSigningOut}
      />

      <main className="dashboard-main">
        <div className="dashboard-container">
          {view === "input" && (
            <div className="dashboard-panels">
              <AuditInput onJobStart={handleJobStart} />
              <RecentAudits
                userId={user.id}
                onViewReport={handleViewReport}
                onViewProgress={handleViewProgress}
              />
            </div>
          )}

          {view === "progress" && jobId && (
            <AuditProgress
              jobId={jobId}
              onComplete={handleComplete}
              onBackToReports={handleBackToReports}
            />
          )}

          {view === "report" && activeReportJobId && (
            <AuditReport
              jobId={activeReportJobId}
              onBackToReports={handleBackToReports}
            />
          )}
        </div>
      </main>
    </div>
  );
}
