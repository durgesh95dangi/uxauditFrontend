"use client";

import { useEffect, useRef, useState } from "react";
import { DEMO_SITE } from "../../lib/landing/demoSite.js";

const TARGET_SCORE = 78;
const CYCLE_MS = 7200;

const FINDINGS = [
  {
    sev: "critical",
    label: "Critical",
    title: "Main button is hard to see",
    meta: "Top of page · Phone"
  },
  {
    sev: "high",
    label: "High",
    title: "Headline breaks onto messy lines",
    meta: "Top of page · Tablet"
  },
  {
    sev: "medium",
    label: "Medium",
    title: "Footer is missing a privacy link",
    meta: "Footer · Computer"
  },
  {
    sev: "low",
    label: "Low",
    title: "Hard-to-read text in the details",
    meta: "Features · Computer"
  }
];

const RADIUS = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function HeroReport() {
  const [cycle, setCycle] = useState(0);
  const [score, setScore] = useState(0);
  const reducedRef = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedRef.current = media.matches;
    if (media.matches) {
      setScore(TARGET_SCORE);
      return undefined;
    }
    const id = setInterval(() => setCycle((c) => c + 1), CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (reducedRef.current) return undefined;

    let raf;
    let start;
    const duration = 1500;
    const delay = 700;

    setScore(0);
    const timeout = setTimeout(() => {
      const run = (ts) => {
        if (start === undefined) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setScore(Math.round(eased * TARGET_SCORE));
        if (progress < 1) raf = requestAnimationFrame(run);
      };
      raf = requestAnimationFrame(run);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [cycle]);

  const dash = (score / 100) * CIRCUMFERENCE;
  const scoreTone =
    score >= 70 ? "good" : score >= 45 ? "warn" : "bad";

  return (
    <div className="hero-report" aria-hidden="true">
      <div className="hero-report-glow" />

      <div className="hero-report-card" key={cycle}>
        <div className="hero-report-chrome">
          <span className="hero-report-dot" />
          <span className="hero-report-dot" />
          <span className="hero-report-dot" />
          <span className="hero-report-url">www.{DEMO_SITE.url}</span>
          <span className="hero-report-live">
            <i className="hero-report-live-dot" />
            Live
          </span>
        </div>

        <div className="hero-report-body">
          <div className="hero-report-head hero-report-head--in">
            <div className={`hero-report-score hero-report-score--${scoreTone}`}>
              <svg viewBox="0 0 64 64" className="hero-report-ring">
                <circle
                  className="hero-report-ring-track"
                  cx="32"
                  cy="32"
                  r={RADIUS}
                />
                <circle
                  className="hero-report-ring-value"
                  cx="32"
                  cy="32"
                  r={RADIUS}
                  strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
                />
              </svg>
              <span className="hero-report-score-num">{score}</span>
            </div>

            <div className="hero-report-head-meta">
              <span className="hero-report-title">UX Audit Report</span>
              <span className="hero-report-sub">
                12 issues across 3 sections
              </span>
              <div className="hero-report-chips">
                <span className="hero-report-chip hero-report-chip--critical">
                  2 Critical
                </span>
                <span className="hero-report-chip hero-report-chip--high">
                  4 High
                </span>
                <span className="hero-report-chip hero-report-chip--medium">
                  6 Medium
                </span>
              </div>
            </div>
          </div>

          <ul className="hero-report-findings">
            {FINDINGS.map((finding, index) => (
              <li
                key={finding.title}
                className="hero-report-finding"
                style={{ animationDelay: `${0.7 + index * 0.3}s` }}
              >
                <span
                  className={`hero-report-sev hero-report-sev--${finding.sev}`}
                >
                  {finding.label}
                </span>
                <span className="hero-report-finding-body">
                  <span className="hero-report-finding-title">
                    {finding.title}
                  </span>
                  <span className="hero-report-finding-meta">
                    {finding.meta}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <div className="hero-report-complete">
            <span className="hero-report-complete-check">✓</span>
            Audit complete · {DEMO_SITE.sections.length} sections analyzed
          </div>
        </div>
      </div>
    </div>
  );
}
