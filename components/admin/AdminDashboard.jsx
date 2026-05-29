"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import AdminPageHeader from "./AdminPageHeader.jsx";
import {
  SeverityCard,
  StatCard,
  handleAdminForbidden
} from "./adminShared.jsx";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/stats");
      if (await handleAdminForbidden(response, router)) return;
      if (!response.ok) throw new Error("Could not load dashboard");
      setStats(await response.json());
    } catch (err) {
      setError(err?.message || "Could not load dashboard");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const bugs = stats?.bugsBySeverity || {};

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Dashboard"
        subtitle="Audit runs and bug findings across UXAuditX"
        onRefresh={loadData}
        loading={loading}
      />

      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}

      <section className="dashboard-panel admin-section-panel" aria-label="Run statistics">
        <h2 className="admin-section-title">Audit runs</h2>
        <div className="admin-stats-grid">
          <StatCard label="Total run" value={loading ? "…" : stats?.totalRun ?? 0} />
          <StatCard
            label="Pass"
            value={loading ? "…" : stats?.passed ?? 0}
            tone="pass"
          />
          <StatCard
            label="Failed"
            value={loading ? "…" : stats?.failed ?? 0}
            tone="fail"
          />
          <StatCard
            label="Running"
            value={loading ? "…" : stats?.running ?? 0}
            tone="run"
          />
        </div>
      </section>

      <section className="dashboard-panel admin-section-panel" aria-label="Bug severity">
        <h2 className="admin-section-title">Bugs by level</h2>
        <div className="admin-severity-grid">
          <SeverityCard
            label="Critical"
            value={loading ? "…" : bugs.critical ?? 0}
            tone="critical"
          />
          <SeverityCard
            label="High"
            value={loading ? "…" : bugs.high ?? 0}
            tone="high"
          />
          <SeverityCard
            label="Medium"
            value={loading ? "…" : bugs.medium ?? 0}
            tone="medium"
          />
          <SeverityCard
            label="Low"
            value={loading ? "…" : bugs.low ?? 0}
            tone="low"
          />
        </div>
        {!loading && stats && (
          <p className="admin-section-meta">
            {stats.totalBugs ?? 0} total bugs found · {stats.totalUsers ?? 0} registered users
          </p>
        )}
      </section>
    </div>
  );
}
