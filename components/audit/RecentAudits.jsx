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

      <div className="recent-audits-table-wrap">
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
            {jobs.map((job) => {
              const status = job.status;
              return (
                <tr key={job.id}>
                  <td className="ra-url" title={job.url || ""}>
                    {job.url || "—"}
                  </td>
                  <td>
                    <StatusBadge status={status} />
                  </td>
                  <td className="ra-date">{formatDate(job.created_at)}</td>
                  <td className="ra-action">
                    {status === "done" && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => onViewReport?.(job.id)}
                      >
                        View Report
                      </button>
                    )}
                    {status === "running" && (
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
                    )}
                    {status === "failed" && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleRetry(job)}
                        disabled={retryingId === job.id}
                      >
                        {retryingId === job.id ? "Retrying..." : "Retry"}
                      </button>
                    )}
                    {status === "pending" && (
                      <span className="muted">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
