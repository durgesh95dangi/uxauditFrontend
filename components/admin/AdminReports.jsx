"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import AuditProgress from "../audit/AuditProgress.jsx";
import AdminConfirmDialog from "./AdminConfirmDialog.jsx";
import AdminPageHeader from "./AdminPageHeader.jsx";
import AdminReportsRunBar from "./AdminReportsRunBar.jsx";
import { JobsTable, adminFetch, handleAdminForbidden } from "./adminShared.jsx";

export default function AdminReports() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteJobTarget, setDeleteJobTarget] = useState(null);
  const [busyJobId, setBusyJobId] = useState(null);
  const [activeJobId, setActiveJobId] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/jobs?limit=500");
      if (await handleAdminForbidden(response, router)) return;
      if (!response.ok) throw new Error("Could not load reports");
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (err) {
      setError(err?.message || "Could not load reports");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleCancelJob(job) {
    setBusyJobId(job.id);
    setError(null);
    try {
      await adminFetch(`/api/admin/jobs/${job.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "failed" })
      });
      await loadData();
    } catch (err) {
      setError(err?.message || "Could not cancel audit");
    } finally {
      setBusyJobId(null);
    }
  }

  async function handleDeleteJob() {
    if (!deleteJobTarget) return;
    setBusyJobId(deleteJobTarget.id);
    setError(null);
    try {
      await adminFetch(`/api/admin/jobs/${deleteJobTarget.id}`, {
        method: "DELETE"
      });
      setDeleteJobTarget(null);
      await loadData();
    } catch (err) {
      setError(err?.message || "Could not delete audit");
    } finally {
      setBusyJobId(null);
    }
  }

  function handleAuditStarted(jobId) {
    setActiveJobId(jobId);
    setError(null);
  }

  function handleAuditComplete(completedJobId) {
    setActiveJobId(null);
    router.push(`/admin/report/${completedJobId}`);
  }

  function handleAuditBack() {
    setActiveJobId(null);
    loadData();
  }

  if (activeJobId) {
    return (
      <div className="admin-page">
        <AuditProgress
          jobId={activeJobId}
          onComplete={handleAuditComplete}
          onBackToReports={handleAuditBack}
        />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Reports"
        subtitle="Run audits, view results, cancel, or delete"
        onRefresh={loadData}
        loading={loading}
      />

      <AdminReportsRunBar
        router={router}
        onStarted={handleAuditStarted}
        onError={setError}
      />

      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}

      <section className="recent-audits dashboard-panel admin-panel" aria-label="All reports">
        <header className="recent-audits-head dashboard-panel-head">
          <h2 className="recent-audits-title dashboard-panel-title">All audits</h2>
          <span className="admin-count">{jobs.length} shown</span>
        </header>

        {loading && jobs.length === 0 ? (
          <p className="admin-empty">Loading reports…</p>
        ) : (
          <JobsTable
            jobs={jobs}
            showUser
            onDeleteJob={(job) => setDeleteJobTarget(job)}
            onCancelJob={handleCancelJob}
            busyJobId={busyJobId}
          />
        )}
      </section>

      <AdminConfirmDialog
        open={Boolean(deleteJobTarget)}
        title="Delete audit"
        message={`Delete the audit for ${deleteJobTarget?.url || "this URL"}?`}
        loading={busyJobId === deleteJobTarget?.id}
        onCancel={() => setDeleteJobTarget(null)}
        onConfirm={handleDeleteJob}
      />
    </div>
  );
}
