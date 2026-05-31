"use client";

import Link from "next/link";
import { formatUsd } from "../../lib/billing/planRevenue.js";

export const STATUS_CLASS = {
  pending: "ra-status ra-status-pending",
  running: "ra-status ra-status-running",
  done: "ra-status ra-status-done",
  failed: "ra-status ra-status-failed"
};

export function formatDate(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export async function handleAdminForbidden(response, router) {
  if (response.status !== 403) return false;
  const body = await response.json().catch(() => ({}));
  if (body?.code === "PIN_REQUIRED") {
    router.refresh();
    return true;
  }
  router.replace("/login?next=/admin");
  return true;
}

export async function adminFetch(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.error || "Request failed");
  }
  return body;
}

export function formatDateOnly(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

export function PlanPurchasedIcon({ size = 14, className = "" }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

export { formatUsd };

export function PlanBadge({ planLabel, isActivePaid = true }) {
  const label = planLabel || "Free";
  const tone =
    label === "Agency" ? "agency" : label === "Founder" ? "founder" : "free";

  return (
    <span
      className={`admin-plan-badge admin-plan-badge--${tone}${
        isActivePaid ? "" : " admin-plan-badge--inactive"
      }`}
    >
      {label}
    </span>
  );
}

export function StatCard({ label, value, tone }) {
  return (
    <div className={`admin-stat-card${tone ? ` admin-stat-card--${tone}` : ""}`}>
      <span className="admin-stat-label">{label}</span>
      <strong className="admin-stat-value">{value}</strong>
    </div>
  );
}

export function SeverityCard({ label, value, tone }) {
  return (
    <div className={`admin-severity-card admin-severity-card--${tone}`}>
      <span className="admin-severity-label">{label}</span>
      <strong className="admin-severity-value">{value}</strong>
    </div>
  );
}

export function JobsTable({
  jobs,
  showUser = true,
  emptyLabel = "No audits yet",
  onDeleteJob,
  onCancelJob,
  busyJobId = null
}) {
  const hasActions = Boolean(onDeleteJob || onCancelJob);

  return (
    <div className="recent-audits-table-wrap">
      <table className="recent-audits-table admin-table">
        <thead>
          <tr>
            <th>URL</th>
            {showUser && <th>User</th>}
            <th>Status</th>
            <th>Issues</th>
            <th>Sections</th>
            <th>Score</th>
            <th>Started</th>
            {hasActions && <th aria-label="Actions" />}
          </tr>
        </thead>
        <tbody>
          {jobs.length === 0 ? (
            <tr>
              <td colSpan={showUser ? (hasActions ? 8 : 7) : hasActions ? 7 : 6} className="admin-empty">
                {emptyLabel}
              </td>
            </tr>
          ) : (
            jobs.map((job) => {
              const isBusy = busyJobId === job.id;
              return (
                <tr key={job.id}>
                  <td className="ra-url" title={job.url || ""}>
                    {job.url || "—"}
                  </td>
                  {showUser && (
                    <td className="admin-email" title={job.userEmail}>
                      {job.userEmail}
                    </td>
                  )}
                  <td>
                    <span className={STATUS_CLASS[job.status] || "ra-status"}>
                      {job.status === "running" && (
                        <span className="ra-status-spinner" aria-hidden="true" />
                      )}
                      {job.status || "—"}
                    </span>
                  </td>
                  <td>{job.status === "done" ? job.issueCount ?? 0 : "—"}</td>
                  <td>{job.status === "done" ? job.sectionCount ?? 0 : "—"}</td>
                  <td>{job.overallScore != null ? job.overallScore : "—"}</td>
                  <td className="admin-date">{formatDate(job.createdAt)}</td>
                  {hasActions && (
                    <td className="ra-action admin-row-actions">
                      {job.status === "done" && (
                        <Link
                          href={`/admin/report/${job.id}`}
                          className="btn btn-ghost btn-sm"
                        >
                          View
                        </Link>
                      )}
                      {(job.status === "running" || job.status === "pending") &&
                        onCancelJob && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            disabled={isBusy}
                            onClick={() => onCancelJob(job)}
                          >
                            Cancel
                          </button>
                        )}
                      {onDeleteJob && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm admin-btn-danger"
                          disabled={isBusy}
                          onClick={() => onDeleteJob(job)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
