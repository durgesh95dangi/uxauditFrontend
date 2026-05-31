"use client";

import { useEffect, useState } from "react";
import AuditProgress from "../audit/AuditProgress.jsx";
import { DEMO_SITE } from "../../lib/landing/demoSite.js";
import { HERO_AUDIT_DEMO_DURATION_MS } from "../../lib/landing/demoReport.js";
import HeroAuditResults from "./HeroAuditResults.jsx";

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

export default function HeroAuditFlow({ onPhaseChange }) {
  const [phase, setPhase] = useState("hero");
  const [urlInput, setUrlInput] = useState("");
  const [auditedUrl, setAuditedUrl] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    onPhaseChange?.(phase);
  }, [phase, onPhaseChange]);

  useEffect(() => {
    if (phase !== "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [phase]);

  function startScan(normalizedUrl) {
    setError(null);
    setAuditedUrl(normalizedUrl);
    setPhase("scan");
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
        <AuditProgress
          demoAuditUrl={auditedUrl}
          demoDurationMs={HERO_AUDIT_DEMO_DURATION_MS}
          onComplete={() => setPhase("results")}
        />
      </div>
    );
  }

  if (phase === "results") {
    return (
      <div
        className="hero-audit-phase hero-audit-phase--results"
        data-testid="hero-audit-phase-results"
      >
        <HeroAuditResults auditedUrl={auditedUrl} />
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
            <span className="hero-audit-hint-strong">Free instant report</span>
            <span className="hero-audit-hint-sep" aria-hidden="true">
              ·
            </span>
            <span>Results in 1–2 min</span>
          </p>
        </form>
      </div>
    </div>
  );
}
