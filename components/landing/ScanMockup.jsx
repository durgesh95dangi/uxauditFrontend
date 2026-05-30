"use client";

import { useEffect, useRef, useState } from "react";
import { DEMO_SITE } from "../../lib/landing/demoSite.js";
import { IconCheck, IconReport, IconScan, IconZap } from "./LandingIcons.jsx";

const REVIEW_STEPS = [
  "Opening page in browser",
  "Scrolling and capturing sections",
  "Analyzing screenshots",
  "Saving your report"
];

const REPORT_FINDINGS = [
  { severity: "critical", title: "Primary CTA blends into hero background", area: "Mobile" },
  { severity: "high", title: "Tap targets too small on mobile", area: "Mobile" },
  { severity: "medium", title: "Footer missing visible privacy link", area: "Desktop" }
];

const PHASE_MS = { paste: 3800, review: 8500, report: 4200 };

export default function ScanMockup() {
  const [phase, setPhase] = useState("paste");
  const [typedUrl, setTypedUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewStep, setReviewStep] = useState(0);
  const [reviewProgress, setReviewProgress] = useState(0);
  const [reportVisible, setReportVisible] = useState(false);
  const progressRef = useRef(null);

  useEffect(() => {
    const order = ["paste", "review", "report"];
    const timer = setTimeout(() => {
      setPhase((prev) => order[(order.indexOf(prev) + 1) % order.length]);
    }, PHASE_MS[phase]);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "paste") {
      setTypedUrl("");
      setSubmitting(false);
      return undefined;
    }

    let charIndex = 0;
    const typeTimer = setInterval(() => {
      charIndex += 1;
      setTypedUrl(DEMO_SITE.url.slice(0, charIndex));
      if (charIndex >= DEMO_SITE.url.length) clearInterval(typeTimer);
    }, 70);

    const submitTimer = setTimeout(() => setSubmitting(true), 2200);

    return () => {
      clearInterval(typeTimer);
      clearTimeout(submitTimer);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "review") {
      setReviewStep(0);
      setReviewProgress(0);
      return undefined;
    }

    const start = performance.now();
    const duration = PHASE_MS.review - 400;

    function tick(now) {
      const elapsed = now - start;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setReviewProgress(pct);
      setReviewStep(
        Math.min(REVIEW_STEPS.length - 1, Math.floor((pct / 100) * REVIEW_STEPS.length))
      );
      if (pct < 100) progressRef.current = requestAnimationFrame(tick);
    }

    progressRef.current = requestAnimationFrame(tick);

    return () => {
      if (progressRef.current) cancelAnimationFrame(progressRef.current);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "report") {
      setReportVisible(false);
      return undefined;
    }

    const timer = setTimeout(() => setReportVisible(true), 120);
    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <div className="hero-demo" aria-hidden="true">
      <div className="hero-demo-window">
        <div className="hero-demo-chrome">
          <span className="hero-demo-dot hero-demo-dot-red" />
          <span className="hero-demo-dot hero-demo-dot-amber" />
          <span className="hero-demo-dot hero-demo-dot-green" />
          <span className="hero-demo-brand">
            <IconScan size={12} />
            UXAuditX
          </span>
          <span className="hero-demo-phase-label">
            {phase === "paste" && "New audit"}
            {phase === "review" && "Review in progress"}
            {phase === "report" && "Report ready"}
          </span>
        </div>

        <div className={`hero-demo-stage hero-demo-stage--${phase}`}>
          <div className={`hero-demo-panel hero-demo-panel--paste${phase === "paste" ? " is-active" : ""}`}>
            <p className="hero-demo-panel-title">Run an audit</p>
            <p className="hero-demo-panel-sub">Paste a public URL to scan your live site.</p>
            <div className="hero-demo-input-row">
              <div className="hero-demo-input">
                <span className="hero-demo-input-prefix">https://</span>
                <span className="hero-demo-input-value">
                  {typedUrl}
                  {phase === "paste" && <span className="hero-demo-cursor" />}
                </span>
              </div>
              <button
                type="button"
                className={`hero-demo-btn${submitting ? " hero-demo-btn--active" : ""}`}
                tabIndex={-1}
              >
                {submitting ? (
                  <>
                    <span className="hero-demo-btn-spinner" />
                    Starting…
                  </>
                ) : (
                  <>
                    <IconZap size={14} />
                    Run audit
                  </>
                )}
              </button>
            </div>
            <div className="hero-demo-chips">
              {["Hero", "Navigation", "CTAs", "Mobile"].map((chip) => (
                <span key={chip} className="hero-demo-chip">
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className={`hero-demo-panel hero-demo-panel--review${phase === "review" ? " is-active" : ""}`}>
            <div className="hero-demo-review-top">
              <div className="hero-demo-review-head">
                <span className="hero-demo-review-badge">
                  <IconZap size={12} />
                  Audit in progress
                </span>
                <span className="hero-demo-review-pct">{Math.round(reviewProgress)}%</span>
              </div>
              <p className="hero-demo-review-url">{DEMO_SITE.url}</p>
              <div className="hero-demo-progress-track">
                <div
                  className="hero-demo-progress-fill"
                  style={{ width: `${reviewProgress}%` }}
                />
              </div>
            </div>

            <div className="hero-demo-review-body">
              <ul className="hero-demo-steps">
                {REVIEW_STEPS.map((label, i) => (
                  <li
                    key={label}
                    className={
                      i < reviewStep
                        ? "hero-demo-step hero-demo-step--done"
                        : i === reviewStep
                          ? "hero-demo-step hero-demo-step--active"
                          : "hero-demo-step"
                    }
                  >
                    {i < reviewStep ? (
                      <IconCheck size={14} />
                    ) : i === reviewStep ? (
                      <span className="hero-demo-step-spinner" />
                    ) : (
                      <span className="hero-demo-step-dot" />
                    )}
                    {label}
                  </li>
                ))}
              </ul>

              <div className="hero-demo-preview">
                <div className="hero-demo-preview-beam" />
                {DEMO_SITE.sections.map((section, i) => (
                  <div
                    key={section}
                    className={`hero-demo-preview-block${
                      i <= reviewStep ? " hero-demo-preview-block--captured" : ""
                    }`}
                  >
                    <span>{section}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={`hero-demo-panel hero-demo-panel--report${phase === "report" ? " is-active" : ""}`}>
            <div className="hero-demo-report-head">
              <span className="hero-demo-report-badge">
                <IconReport size={14} />
                UX report
              </span>
              <span className="hero-demo-report-score">12 issues found</span>
            </div>
            <p className="hero-demo-report-url">{DEMO_SITE.url}</p>

            <ul className={`hero-demo-findings${reportVisible ? " hero-demo-findings--visible" : ""}`}>
              {REPORT_FINDINGS.map((finding, i) => (
                <li
                  key={finding.title}
                  className="hero-demo-finding"
                  style={{ transitionDelay: `${i * 120}ms` }}
                >
                  <span className={`hero-demo-severity hero-demo-severity--${finding.severity}`}>
                    {finding.severity}
                  </span>
                  <div className="hero-demo-finding-copy">
                    <strong>{finding.title}</strong>
                    <span>{finding.area} capture</span>
                  </div>
                  <IconCheck size={14} />
                </li>
              ))}
            </ul>

            <div className="hero-demo-report-foot">
              <span>Sorted by severity</span>
              <span className="hero-demo-report-ready">
                <IconCheck size={14} />
                Ready to share
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
