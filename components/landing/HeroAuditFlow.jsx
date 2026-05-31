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
      <div className="hero-split-layout">
        <div className="hero-split-left hero-orbi-copy hero-audit-copy">
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
            <div className="hero-audit-hints-row">
              <div className="hero-audit-hint-badge">
                <svg className="hero-audit-hint-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="hero-audit-hint-strong">Free instant report</span>
              </div>
              <div className="hero-audit-hint-badge">
                <svg className="hero-audit-hint-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>Results in 1–2 min</span>
              </div>
            </div>
          </form>
        </div>

        <div className="hero-split-right">
          <AnimatedReportMockup />
        </div>
      </div>
    </div>
  );
}

function AnimatedReportMockup() {
  const [phase, setPhase] = useState("scanning");
  const [issues, setIssues] = useState([]);
  const [score, setScore] = useState("--");
  const [status, setStatus] = useState("Analyzing structure...");

  useEffect(() => {
    let timer1, timer2, timer3, resetTimer;

    const runAnimation = () => {
      setPhase("scanning");
      setIssues([]);
      setScore("--");
      setStatus("Analyzing structure...");

      timer1 = setTimeout(() => {
        setPhase("issue1");
        setStatus("Checking page elements...");
        setScore("86");
        setIssues([
          {
            id: 1,
            title: "CTA is not action-oriented",
            desc: "Primary button uses passive 'Submit' text. Change to 'Start Free Trial'.",
            severity: "CRITICAL"
          }
        ]);
      }, 1500);

      timer2 = setTimeout(() => {
        setPhase("issue2");
        setStatus("Verifying contrast ratios...");
        setScore("68");
        setIssues([
          {
            id: 1,
            title: "CTA is not action-oriented",
            desc: "Primary button uses passive 'Submit' text. Change to 'Start Free Trial'.",
            severity: "CRITICAL"
          },
          {
            id: 2,
            title: "Low contrast ratio on hero copy",
            desc: "Subheadline contrast is 2.4:1. Increase to 4.5:1 for readability.",
            severity: "CRITICAL"
          }
        ]);
      }, 3500);

      timer3 = setTimeout(() => {
        setPhase("complete");
        setStatus("Audit Complete");
        setScore("51");
        setIssues([
          {
            id: 1,
            title: "CTA is not action-oriented",
            desc: "Primary button uses passive 'Submit' text. Change to 'Start Free Trial'.",
            severity: "CRITICAL"
          },
          {
            id: 2,
            title: "Low contrast ratio on hero copy",
            desc: "Subheadline contrast is 2.4:1. Increase to 4.5:1 for readability.",
            severity: "CRITICAL"
          },
          {
            id: 3,
            title: "Mobile links overlap",
            desc: "Navigation links are too close. Add at least 8px margin spacing.",
            severity: "CRITICAL"
          }
        ]);
      }, 5500);

      resetTimer = setTimeout(() => {
        runAnimation();
      }, 9500);
    };

    runAnimation();

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(resetTimer);
    };
  }, []);

  return (
    <div className="hero-report-mockup" aria-hidden="true">
      <div className="hero-report-mockup-header">
        <div className="hero-report-mockup-url">
          <span className="hero-report-dot red" />
          <span className="hero-report-dot yellow" />
          <span className="hero-report-dot green" />
          <span className="hero-report-address">mysite.com/audit</span>
        </div>
        <div className="hero-report-status">
          {phase === "scanning" && (
            <svg 
              className="animate-spin" 
              viewBox="0 0 24 24" 
              fill="none" 
              style={{ 
                width: "12px", 
                height: "12px", 
                animation: "spin 1s linear infinite", 
                marginRight: "6px", 
                color: "var(--color-brand)",
                display: "inline-block",
                verticalAlign: "middle"
              }}
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style={{ opacity: 0.75 }} />
            </svg>
          )}
          <span style={{ verticalAlign: "middle" }}>{status}</span>
        </div>
      </div>
      <div className="hero-report-mockup-body">
        <div className="hero-report-score-section">
          <div 
            className="hero-report-score-circle"
            style={{
              borderColor: score === "--" ? "rgba(255, 255, 255, 0.05)" : score === "86" ? "#eab308" : "#ef4444"
            }}
          >
            <span className="hero-report-score-val">{score}</span>
            <span className="hero-report-score-lbl">Score</span>
          </div>
          <div className="hero-report-meta-info">
            <div className="hero-report-meta-line" />
            <div className="hero-report-meta-line short" />
          </div>
        </div>
        <div className="hero-report-issues-list">
          {issues.map((issue) => (
            <div key={issue.id} className="hero-report-issue-card">
              <div className="hero-report-issue-head">
                <span className="issue-badge-critical">{issue.severity}</span>
                <h4 className="hero-report-issue-title">{issue.title}</h4>
              </div>
              <p className="hero-report-issue-desc">{issue.desc}</p>
            </div>
          ))}
          {issues.length === 0 && (
            <div 
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                opacity: 0.25
              }}
            >
              <div style={{ height: "48px", background: "rgba(255,255,255,0.06)", borderRadius: "4px" }} />
              <div style={{ height: "48px", background: "rgba(255,255,255,0.06)", borderRadius: "4px" }} />
              <div style={{ height: "48px", background: "rgba(255,255,255,0.06)", borderRadius: "4px" }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
