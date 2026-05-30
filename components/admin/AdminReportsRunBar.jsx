"use client";

import { useState } from "react";
import { DEMO_SITE } from "../../lib/landing/demoSite.js";
import { handleAdminForbidden } from "./adminShared.jsx";

export default function AdminReportsRunBar({ onStarted, onError, router }) {
  const [url, setUrl] = useState("");
  const [fullReport, setFullReport] = useState(true);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmed = url.trim();
    if (!trimmed) {
      onError?.("Please enter a URL");
      return;
    }

    const normalized = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;

    try {
      // eslint-disable-next-line no-new
      new URL(normalized);
    } catch {
      onError?.("Please enter a valid URL");
      return;
    }

    setLoading(true);
    onError?.(null);

    try {
      const response = await fetch("/api/admin/audit/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalized, fullReport, skipQuota: true })
      });

      if (await handleAdminForbidden(response, router)) return;

      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        onError?.(body?.error || "Could not start audit");
        return;
      }

      onStarted?.(body.jobId);
      setUrl("");
    } catch (networkError) {
      onError?.(networkError?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className="dashboard-panel admin-panel admin-reports-run"
      aria-label="Run new audit"
    >
      <form onSubmit={handleSubmit} className="admin-reports-run-form" noValidate>
        <input
          type="search"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder={DEMO_SITE.urlWithProtocol}
          className="admin-reports-run-input"
          disabled={loading}
          autoComplete="url"
          inputMode="url"
          aria-label="Website URL to audit"
        />
        <button
          type="submit"
          className={`btn btn-primary admin-reports-run-btn${loading ? " is-loading" : ""}`}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? "Starting…" : "Analyze"}
        </button>
      </form>

      <label className="admin-audit-option admin-reports-run-option">
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
              ? "Full per-section analysis — same as Founder/Agency."
              : "Starter report path for testing free-tier output."}
          </span>
        </span>
      </label>
    </section>
  );
}
