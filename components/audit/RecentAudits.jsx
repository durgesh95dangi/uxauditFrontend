"use client";

import { useCallback, useEffect, useState } from "react";

const STATUS_CONFIG = {
  pending: { className: "ra-status ra-status-pending", label: "Pending" },
  running: { className: "ra-status ra-status-running", label: "Analyzing..." },
  done: { className: "ra-status ra-status-done", label: "Complete" },
  failed: { className: "ra-status ra-status-failed", label: "Failed" }
};

function formatDate(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function StatusBadge({ status }) {
  const config =
    STATUS_CONFIG[status] || {
      className: "ra-status ra-status-unknown",
      label: status || "—"
    };

  return (
    <span className={config.className}>
      {status === "running" && (
        <span className="ra-status-spinner" aria-hidden="true" />
      )}
      {config.label}
    </span>
  );
}

function AuditJobActions({
  job,
  retryingId,
  onViewReport,
  onViewProgress,
  onRetry
}) {
  const status = job.status;

  if (status === "done") {
    return (
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => onViewReport?.(job.id)}
      >
        View Report
      </button>
    );
  }

  if (status === "running") {
    return (
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => onViewProgress?.(job.id)}
        disabled={typeof onViewProgress !== "function"}
        title={
          typeof onViewProgress !== "function"
            ? "Progress view unavailable"
            : undefined
        }
      >
        View Progress
      </button>
    );
  }

  if (status === "failed") {
    return (
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => onRetry(job)}
        disabled={retryingId === job.id}
      >
        {retryingId === job.id ? "Retrying..." : "Retry"}
      </button>
    );
  }

  return <span className="muted">—</span>;
}

export default function RecentAudits({ userId, onViewReport, onViewProgress }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState(null);

  const loadJobs = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await fetch("/api/audit/history");
      if (!response.ok) {
        setJobs([]);
        return;
      }
      const data = await response.json();
      const list = Array.isArray(data) ? data : data?.jobs || [];
      setJobs(list);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  async function handleRetry(job) {
    if (!job?.url || retryingId) return;
    setRetryingId(job.id);
    try {
      const response = await fetch("/api/audit/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: job.url })
      });
      if (!response.ok) return;
      const { jobId: newJobId } = await response.json();
      if (newJobId && typeof onViewProgress === "function") {
        onViewProgress(newJobId);
      } else {
        await loadJobs();
      }
    } catch {
      // Ignore — user can retry again from the list.
    } finally {
      setRetryingId(null);
    }
  }

  if (loading) return null;
  if (!jobs || jobs.length === 0) return null;

  return (
    <section className="recent-audits dashboard-panel" aria-label="Recent audits">
      <header className="recent-audits-head dashboard-panel-head">
        <h2 className="recent-audits-title dashboard-panel-title">Recent audits</h2>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={loadJobs}
        >
          Refresh
        </button>
      </header>

      <ul className="recent-audits-list recent-audits-mobile">
        {jobs.map((job) => (
          <li key={job.id}>
            <article className="recent-audit-card">
              <div className="recent-audit-card-body">
                <p className="recent-audit-card-url" title={job.url || ""}>
                  {job.url || "—"}
                </p>
                <div className="recent-audit-card-meta">
                  <StatusBadge status={job.status} />
                  <time
                    className="recent-audit-card-date"
                    dateTime={job.created_at || undefined}
                  >
                    {formatDate(job.created_at)}
                  </time>
                </div>
              </div>
              <div className="recent-audit-card-action">
                <AuditJobActions
                  job={job}
                  retryingId={retryingId}
                  onViewReport={onViewReport}
                  onViewProgress={onViewProgress}
                  onRetry={handleRetry}
                />
              </div>
            </article>
          </li>
        ))}
      </ul>

      <div className="recent-audits-table-wrap recent-audits-desktop">
        <table className="recent-audits-table">
          <thead>
            <tr>
              <th>URL</th>
              <th>Status</th>
              <th>Date</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td className="ra-url" title={job.url || ""}>
                  {job.url || "—"}
                </td>
                <td>
                  <StatusBadge status={job.status} />
                </td>
                <td className="ra-date">{formatDate(job.created_at)}</td>
                <td className="ra-action">
                  <AuditJobActions
                    job={job}
                    retryingId={retryingId}
                    onViewReport={onViewReport}
                    onViewProgress={onViewProgress}
                    onRetry={handleRetry}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
