"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DEMO_SITE } from "../../lib/landing/demoSite.js";
import AuditProgress from "../audit/AuditProgress.jsx";
import AdminPageHeader from "./AdminPageHeader.jsx";
import { handleAdminForbidden } from "./adminShared.jsx";

export default function AdminAuditRunner() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [fullReport, setFullReport] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jobId, setJobId] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a URL");
      return;
    }

    const normalized = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;

    try {
      // eslint-disable-next-line no-new
      new URL(normalized);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/audit/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalized, fullReport, skipQuota: true })
      });

      if (await handleAdminForbidden(response, router)) return;

      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(body?.error || "Could not start audit");
        return;
      }

      setJobId(body.jobId);
    } catch (networkError) {
      setError(networkError?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  function handleComplete(completedJobId) {
    router.push(`/admin/report/${completedJobId}`);
  }

  function handleBack() {
    setJobId(null);
    setUrl("");
  }

  if (jobId) {
    return (
      <div className="admin-page">
        <AuditProgress
          jobId={jobId}
          onComplete={handleComplete}
          onBackToReports={handleBack}
        />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Run audit"
        subtitle="Start an audit from admin — bypasses monthly limits"
      />

      <div className="audit-input-card dashboard-panel admin-audit-panel">
        <p className="dashboard-panel-sub audit-input-sub">
          Superadmin audits skip quota checks. Choose whether to run the full
          per-section analysis or preview the Starter report path.
        </p>

        <form onSubmit={handleSubmit} className="audit-input-form" noValidate>
          <input
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder={DEMO_SITE.urlWithProtocol}
            className="audit-input-field"
            disabled={loading}
            autoComplete="url"
            inputMode="url"
          />
          <button
            type="submit"
            className={`btn btn-primary audit-input-btn${loading ? " is-loading" : ""}`}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? "Starting…" : "Analyze"}
          </button>
        </form>

        <label className="admin-audit-option">
          <input
            type="checkbox"
            checked={fullReport}
            onChange={(event) => setFullReport(event.target.checked)}
            disabled={loading}
          />
          <span>
            <strong>Full report (unlimited analysis)</strong>
            <span className="admin-audit-option-hint">
              {fullReport
                ? "Every section analyzed with the full checklist — same as Founder/Agency."
                : "Starter report path — condensed analysis for testing free-tier output."}
            </span>
          </span>
        </label>

        {error && (
          <p className="audit-input-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
