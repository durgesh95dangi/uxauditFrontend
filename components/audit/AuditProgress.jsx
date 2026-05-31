"use client";

import { useEffect, useRef, useState } from "react";
import PageToolbar from "../layout/PageToolbar.jsx";
import { DEMO_SITE } from "../../lib/landing/demoSite.js";

const STEPS = [
  { id: 0, label: "Getting started", minSeconds: 0 },
  { id: 1, label: "Understanding your website", minSeconds: 4 },
  { id: 2, label: "Reviewing desktop experience", minSeconds: 15 },
  { id: 3, label: "Reviewing mobile experience", minSeconds: 35 },
  { id: 4, label: "Organizing your findings", minSeconds: 55 },
  { id: 5, label: "Identifying improvements", minSeconds: 65 },
  { id: 6, label: "Preparing your report", minSeconds: 120 }
];

const SERVER_STEP_INDEX = {
  starting: 0,
  detecting_site_type: 1,
  capturing_hero_preview: 1,
  capturing_desktop: 2,
  capturing_mobile: 3,
  capturing_viewports: 2,
  preparing_analysis: 4,
  analyzing: 5,
  saving_issues: 6,
  done: 6,
  failed: 6
};

const ANALYSIS_STEP_IDS = new Set([4, 5]);

const POLL_INTERVAL_MS = 1500;
const POLL_INTERVAL_SLOW_MS = 4000;
const TICK_INTERVAL_MS = 1000;
const COMPLETION_DELAY_MS = 1000;

function mapServerStep(serverStep) {
  if (!serverStep) return null;
  if (SERVER_STEP_INDEX[serverStep] !== undefined) {
    return SERVER_STEP_INDEX[serverStep];
  }
  if (serverStep.startsWith("analyzing")) return SERVER_STEP_INDEX.analyzing;
  if (serverStep.startsWith("capturing_desktop")) return SERVER_STEP_INDEX.capturing_desktop;
  if (serverStep.startsWith("capturing_mobile")) return SERVER_STEP_INDEX.capturing_mobile;
  if (serverStep.startsWith("capturing_viewports")) return SERVER_STEP_INDEX.capturing_viewports;
  return null;
}

function stepForElapsed(elapsed) {
  let stepIndex = 0;
  for (let i = 0; i < STEPS.length; i += 1) {
    if (STEPS[i].minSeconds <= elapsed) stepIndex = i;
  }
  return stepIndex;
}

function formatElapsed(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function uniqueSectionLabels(sections) {
  const labels = [];
  const seen = new Set();
  for (const section of sections || []) {
    const label = section?.label;
    if (!label || seen.has(label)) continue;
    seen.add(label);
    labels.push(label);
  }
  return labels;
}

function ScanLaserOverlay() {
  return (
    <div className="progress-preview-scan" aria-hidden="true">
      <div className="progress-preview-laser-trail" />
      <div className="progress-preview-laser-line" />
    </div>
  );
}

function ProgressHeroPreview({
  auditUrl,
  previewUrl,
  previewLabel,
  capturedSections,
  currentStep,
  scanning
}) {
  const sectionLabels = uniqueSectionLabels(capturedSections);
  const heroLabel = previewLabel || sectionLabels[0] || "Hero";
  const isAnalyzing = ANALYSIS_STEP_IDS.has(currentStep);
  const showLaser = scanning && !isAnalyzing;

  return (
    <div className="progress-preview-card">
      <div className="progress-preview-chrome">
        <span className="progress-preview-dot progress-preview-dot-red" />
        <span className="progress-preview-dot progress-preview-dot-amber" />
        <span className="progress-preview-dot progress-preview-dot-green" />
        <span className="progress-preview-url" title={auditUrl}>
          {auditUrl || "Your website"}
        </span>
      </div>

      <div
        className={`progress-preview-body${
          showLaser ? " progress-preview-body--scanning" : ""
        }${isAnalyzing ? " progress-preview-body--analyzing" : ""}`}
      >
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt={`${heroLabel} section preview`}
              className="progress-preview-shot"
            />
            {showLaser && <ScanLaserOverlay />}
            {isAnalyzing && (
              <div className="progress-preview-analyze" aria-hidden="true">
                <span className="progress-preview-analyze-pulse" />
                <span>Reviewing this section</span>
              </div>
            )}
          </>
        ) : (
          <div className="progress-preview-placeholder">
            <span className="progress-preview-placeholder-label">{heroLabel}</span>
            <div className="progress-preview-placeholder-lines">
              <span />
              <span />
              <span className="progress-preview-placeholder-lines-short" />
            </div>
            {showLaser && <ScanLaserOverlay />}
          </div>
        )}

        <span className="progress-preview-section-tag">{heroLabel}</span>
      </div>

      {sectionLabels.length > 1 && (
        <ul className="progress-preview-sections" aria-label="Sections captured">
          {sectionLabels.slice(0, 5).map((label) => (
            <li key={label}>{label}</li>
          ))}
          {sectionLabels.length > 5 && (
            <li className="progress-preview-sections-more">
              +{sectionLabels.length - 5} more
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

export default function AuditProgress({
  jobId,
  onComplete,
  onBackToReports,
  demoAuditUrl,
  demoDurationMs = 12000
}) {
  const isDemo = Boolean(demoAuditUrl);
  const [status, setStatus] = useState(isDemo ? "running" : "pending");
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState(null);
  const [auditUrl, setAuditUrl] = useState(demoAuditUrl || "");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLabel, setPreviewLabel] = useState(null);
  const [capturedSections, setCapturedSections] = useState([]);

  const tickIntervalRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const completionTimeoutRef = useRef(null);
  const finishedRef = useRef(false);
  const previewSeenRef = useRef(false);
  const serverDrivenRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!demoAuditUrl) return undefined;

    finishedRef.current = false;
    serverDrivenRef.current = true;
    previewSeenRef.current = false;
    setAuditUrl(demoAuditUrl);
    setStatus("running");
    setCurrentStep(0);
    setElapsedSeconds(0);
    setError(null);
    setPreviewUrl(null);
    setPreviewLabel(null);
    setCapturedSections([]);

    const demoSections = DEMO_SITE.sections;
    const startedAt = Date.now();
    const maxVirtualSeconds = STEPS[STEPS.length - 1].minSeconds;

    const demoInterval = setInterval(() => {
      if (finishedRef.current) return;

      const elapsedMs = Date.now() - startedAt;
      const elapsedSec = Math.floor(elapsedMs / 1000);
      const ratio = Math.min(elapsedMs / demoDurationMs, 1);
      const virtualElapsed = Math.floor(ratio * maxVirtualSeconds);

      setElapsedSeconds(elapsedSec);
      setCurrentStep(stepForElapsed(virtualElapsed));

      if (ratio >= 0.18) {
        setPreviewUrl("/landing/finding-hero-cta.svg");
        setPreviewLabel("Hero");
        setCapturedSections([{ label: "Hero" }]);
      }
      if (ratio >= 0.42) {
        setCapturedSections([
          { label: "Hero" },
          { label: "Features" }
        ]);
      }
      if (ratio >= 0.62) {
        setCapturedSections(demoSections.map((label) => ({ label })));
      }

      if (ratio >= 1) {
        finishedRef.current = true;
        clearInterval(demoInterval);
        setCurrentStep(STEPS.length - 1);
        setStatus("done");
        completionTimeoutRef.current = setTimeout(() => {
          onCompleteRef.current?.();
        }, COMPLETION_DELAY_MS);
      }
    }, 200);

    return () => {
      finishedRef.current = true;
      clearInterval(demoInterval);
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
        completionTimeoutRef.current = null;
      }
    };
  }, [demoAuditUrl, demoDurationMs]);

  useEffect(() => {
    if (!jobId || isDemo) return undefined;

    finishedRef.current = false;

    function stopAllTimers() {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }

    tickIntervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (!finishedRef.current && !serverDrivenRef.current) {
          setCurrentStep(stepForElapsed(next));
        }
        return next;
      });
    }, TICK_INTERVAL_MS);

    async function poll() {
      if (finishedRef.current) return;

      try {
        const response = await fetch(`/api/audit/status/${jobId}`);
        if (!response.ok && response.status !== 202) {
          return;
        }
        const data = await response.json().catch(() => ({}));

        if (data?.url) {
          setAuditUrl(data.url);
        }

        if (data?.previewUrl) {
          if (!previewSeenRef.current) {
            previewSeenRef.current = true;
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = setInterval(poll, POLL_INTERVAL_SLOW_MS);
            }
          }
          setPreviewUrl((prev) => prev || data.previewUrl);
        }
        if (data?.previewLabel) {
          setPreviewLabel(data.previewLabel);
        }
        if (Array.isArray(data?.capturedSections)) {
          setCapturedSections(data.capturedSections);
        }

        if (data?.status) {
          setStatus(data.status);
        }

        const mappedStep = mapServerStep(data?.currentStep);
        if (mappedStep !== null) {
          serverDrivenRef.current = true;
          setCurrentStep(mappedStep);
        }

        if (data?.status === "done") {
          finishedRef.current = true;
          setCurrentStep(STEPS.length - 1);
          stopAllTimers();
          completionTimeoutRef.current = setTimeout(() => {
            onCompleteRef.current?.(jobId);
          }, COMPLETION_DELAY_MS);
          return;
        }

        if (data?.status === "failed") {
          finishedRef.current = true;
          setError(data.error || "Your audit could not be completed. Please try again.");
          stopAllTimers();
        }
      } catch {
        // Transient network error — keep polling.
      }
    }

    poll();
    pollIntervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      finishedRef.current = true;
      stopAllTimers();
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
        completionTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, isDemo]);

  const totalSteps = STEPS.length;
  const progressPercent = Math.min(
    100,
    Math.round(((currentStep + 1) / totalSteps) * 100)
  );
  const scanning = status === "running" || status === "pending";

  if (error) {
    return (
      <div className="progress-card progress-card-error">
        {typeof onBackToReports === "function" && (
          <PageToolbar onBack={onBackToReports} />
        )}
        <h3 className="progress-error-title">Audit could not be completed</h3>
        <p className="progress-error-msg">{error}</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="progress-shell">
      {typeof onBackToReports === "function" && (
        <PageToolbar onBack={onBackToReports} />
      )}

      <div className="progress-layout">
        <ProgressHeroPreview
          auditUrl={auditUrl}
          previewUrl={previewUrl}
          previewLabel={previewLabel}
          capturedSections={capturedSections}
          currentStep={currentStep}
          scanning={scanning}
        />

        <div className="progress-card progress-card--steps">
          <div className="progress-header">
            <p className="progress-eyebrow">Your audit is underway</p>
            <p className="progress-url" title={auditUrl}>
              {auditUrl || "Reviewing your website…"}
            </p>
          </div>

          <div className="progress-bar" aria-hidden="true">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <ol className="progress-steps">
            {STEPS.map((step) => {
              const stateClass =
                step.id < currentStep
                  ? "done"
                  : step.id === currentStep
                    ? "active"
                    : "upcoming";

              return (
                <li key={step.id} className={`progress-step ${stateClass}`}>
                  <span className="progress-step-icon" aria-hidden="true">
                    {step.id < currentStep ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5 10.5l3 3 7-7"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : step.id === currentStep ? (
                      <span className="progress-step-spinner" />
                    ) : null}
                  </span>
                  <span className="progress-step-label">{step.label}</span>
                </li>
              );
            })}
          </ol>

          <div className="progress-footer">
            <p className="progress-hint">Most audits finish in under two minutes</p>
            <p className="progress-elapsed">
              Time elapsed: <span>{formatElapsed(elapsedSeconds)}</span>
            </p>
          </div>

          {status === "pending" && (
            <p className="progress-meta">
              {elapsedSeconds < 4
                ? "Setting up your audit…"
                : "Your audit will begin shortly…"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
