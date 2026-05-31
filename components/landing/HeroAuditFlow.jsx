"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { DEMO_SITE } from "../../lib/landing/demoSite.js";
import {
  HERO_AUDIT_BLURRED_PLACEHOLDERS,
  HERO_AUDIT_DEMO_SCORE,
  HERO_AUDIT_HIDDEN_COUNT,
  HERO_AUDIT_SCAN_DURATION_MS,
  HERO_AUDIT_SCAN_STEPS,
  HERO_AUDIT_VISIBLE_ISSUES
} from "../../lib/landing/heroAuditDemo.js";

function normalizeUrl(raw) {
  let normalized = raw.trim();
  if (!normalized) return null;
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }
  try {
    return new URL(normalized).toString();
  } catch {
    return null;
  }
}

function displayUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname + parsed.pathname.replace(/\/$/, "");
  } catch {
    return url;
  }
}

function IssueCard({ issue, blurred = false }) {
  return (
    <article
      className={`hero-audit-issue hero-audit-issue--${issue.severity}${
        blurred ? " hero-audit-issue--blurred" : ""
      }`}
      aria-hidden={blurred || undefined}
    >
      <span className={`hero-audit-issue-badge hero-audit-issue-badge--${issue.severity}`}>
        {issue.label}
      </span>
      <h3 className="hero-audit-issue-title">{issue.title}</h3>
      <p className="hero-audit-issue-desc">{issue.description}</p>
    </article>
  );
}

export default function HeroAuditFlow() {
  const [phase, setPhase] = useState("hero");
  const [urlInput, setUrlInput] = useState("");
  const [auditedUrl, setAuditedUrl] = useState("");
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const scanStartRef = useRef(null);
  const rafRef = useRef(null);

  const stopScan = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => () => stopScan(), [stopScan]);

  function startScan(normalizedUrl) {
    setError(null);
    setAuditedUrl(normalizedUrl);
    setPhase("scan");
    setProgress(0);
    setScanStepIndex(0);
    scanStartRef.current = performance.now();

    const tick = (now) => {
      const elapsed = now - scanStartRef.current;
      const ratio = Math.min(elapsed / HERO_AUDIT_SCAN_DURATION_MS, 1);
      setProgress(Math.round(ratio * 100));
      setScanStepIndex(
        Math.min(
          HERO_AUDIT_SCAN_STEPS.length - 1,
          Math.floor(ratio * HERO_AUDIT_SCAN_STEPS.length)
        )
      );

      if (ratio < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setPhase("results");
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const normalized = normalizeUrl(urlInput);
    if (!normalized) {
      setError("Please enter a valid URL");
      return;
    }
    startScan(normalized);
  }

  if (phase === "scan") {
    return (
      <div
        className="hero-audit-phase hero-audit-phase--scan"
        data-testid="hero-audit-phase-scan"
      >
        <p className="hero-audit-scan-url">{displayUrl(auditedUrl)}</p>
        <div className="hero-audit-progress-wrap">
          <div className="hero-audit-progress-track">
            <div
              className="hero-audit-progress-fill"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Audit progress"
            />
          </div>
          <div className="hero-audit-progress-meta">
            <span>{HERO_AUDIT_SCAN_STEPS[scanStepIndex]}</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "results") {
    return (
      <div
        className="hero-audit-phase hero-audit-phase--results"
        data-testid="hero-audit-phase-results"
      >
        <div className="hero-audit-results-head">
          <div className="hero-audit-score-block">
            <div className="hero-audit-score-pill hero-audit-score-pill--warn">
              Score: {HERO_AUDIT_DEMO_SCORE} / 100
            </div>
            <p className="hero-audit-results-url">{displayUrl(auditedUrl)}</p>
          </div>
        </div>

        <div className="hero-audit-issues">
          {HERO_AUDIT_VISIBLE_ISSUES.map((issue) => (
            <IssueCard key={issue.title} issue={issue} />
          ))}
          {HERO_AUDIT_BLURRED_PLACEHOLDERS.map((issue) => (
            <IssueCard key={issue.title} issue={issue} blurred />
          ))}
        </div>

        <div className="hero-audit-gate dashboard-panel">
          <span className="hero-audit-gate-pill">
            {HERO_AUDIT_HIDDEN_COUNT} more issues found
          </span>
          <h2 className="hero-audit-gate-title">See the full audit report</h2>
          <p className="hero-audit-gate-sub">
            Including page-by-page breakdown, priority fix order, and estimated
            conversion impact for each issue.
          </p>
          <Link href="/signup" className="btn btn-primary hero-audit-gate-btn">
            Create free account to unlock
          </Link>
          <p className="hero-audit-gate-fine">Free forever · No credit card needed</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="hero-audit-phase hero-audit-phase--hero"
      data-testid="hero-audit-phase-hero"
    >
      <div className="hero-orbi-copy hero-audit-copy">
        <p className="hero-orbi-badge">The solution</p>
        <h1 className="hero-orbi-title">
          Turn website visitors into paying customers.
        </h1>
        <p className="hero-orbi-lead">
          We look at your website through your customer&apos;s eyes, spot what&apos;s
          frustrating or confusing, and give you an easy-to-follow report so your
          team knows exactly what to fix.
        </p>

        <form className="hero-audit-form" onSubmit={handleSubmit} noValidate>
          <div className="hero-audit-input-row">
            <input
              type="text"
              value={urlInput}
              onChange={(event) => setUrlInput(event.target.value)}
              placeholder={DEMO_SITE.urlWithProtocol}
              className="hero-audit-input"
              autoComplete="url"
              inputMode="url"
              aria-label="Website URL to audit"
            />
            <button type="submit" className="btn btn-primary hero-audit-submit">
              Audit my site
            </button>
          </div>
          {error && (
            <p className="hero-audit-error" role="alert">
              {error}
            </p>
          )}
          <p className="hero-audit-hint">
            Free instant report · Results in 1–2 min
          </p>
        </form>
      </div>
    </div>
  );
}
