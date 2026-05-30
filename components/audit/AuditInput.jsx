"use client";

import Link from "next/link";
import { useState } from "react";
import { DEMO_SITE } from "../../lib/landing/demoSite.js";

const AUDIT_CHECKS = [
  "Hero",
  "Navigation",
  "CTAs",
  "Trust",
  "Mobile",
  "Layout"
];

function formatLimitCopy(planLabel, monthlyLimit) {
  if (monthlyLimit == null) {
    return `${planLabel} plan — unlimited audits. Most jobs finish in under a minute.`;
  }

  const auditWord = monthlyLimit === 1 ? "audit" : "audits";
  return `${planLabel} plan — ${monthlyLimit} ${auditWord} per month. Most jobs finish in under a minute.`;
}

export default function AuditInput({ onJobStart, planLabel = "Free", monthlyLimit = 1 }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      const response = await fetch("/api/audit/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalized })
      });

      if (response.ok) {
        const { jobId } = await response.json();
        onJobStart(jobId);
        return;
      }

      const body = await response.json().catch(() => ({}));
      setError(body?.error || "Something went wrong");
    } catch (networkError) {
      setError(networkError?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="audit-input-card dashboard-panel">
      <header className="dashboard-panel-head">
        <h1 className="dashboard-panel-title audit-input-heading">Run an audit</h1>
      </header>
      <p className="dashboard-panel-sub audit-input-sub">
        {formatLimitCopy(planLabel, monthlyLimit)}
        {planLabel === "Free" && (
          <>
            {" "}
            <Link href="/pricing">Upgrade for more</Link>.
          </>
        )}
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
          {loading ? (
            <>
              <span
                className="audit-input-spinner"
                role="status"
                aria-hidden="true"
              />
              Analyzing…
            </>
          ) : (
            "Analyze"
          )}
        </button>
      </form>

      {error && (
        <p className="audit-input-error" role="alert">
          {error}
        </p>
      )}

      <div className="audit-input-chips">
        {AUDIT_CHECKS.map((check) => (
          <span key={check} className="audit-input-chip">
            {check}
          </span>
        ))}
      </div>
    </div>
  );
}
