import ReportCoverHero from "../audit/ReportCoverHero.jsx";
import ReportMeta from "../audit/ReportMeta.jsx";
import IssueRow from "../audit/IssueRow.jsx";
import { MONTHLY_AUDIT_LIMIT } from "../../lib/audit/limits.js";
import { DEMO_SITE } from "../../lib/landing/demoSite.js";
import {
  DEMO_ABOVE_FOLD,
  DEMO_ISSUES,
  DEMO_JOB,
  DEMO_SUMMARY
} from "../../lib/landing/demoReport.js";

const AUDIT_CHECKS = ["Hero", "Navigation", "CTAs", "Trust", "Mobile", "Layout"];

const PROGRESS_STEPS = [
  { id: 0, label: "Getting started", state: "done" },
  { id: 1, label: "Understanding your website", state: "done" },
  { id: 2, label: "Reviewing desktop experience", state: "done" },
  { id: 3, label: "Reviewing mobile experience", state: "active" },
  { id: 4, label: "Organizing your findings", state: "upcoming" },
  { id: 5, label: "Identifying improvements", state: "upcoming" },
  { id: 6, label: "Preparing your report", state: "upcoming" }
];

export function LandingInputPreview() {
  return (
    <div className="landing-ui-preview landing-ui-preview--input">
      <div className="audit-input-card dashboard-panel">
        <header className="dashboard-panel-head">
          <h2 className="dashboard-panel-title audit-input-heading">Run an audit</h2>
        </header>
        <p className="dashboard-panel-sub audit-input-sub">
          Free plan — {MONTHLY_AUDIT_LIMIT} audit per month.
        </p>
        <div className="audit-input-form">
          <input
            type="url"
            readOnly
            value={DEMO_SITE.urlWithProtocol}
            className="audit-input-field"
            tabIndex={-1}
            aria-hidden="true"
          />
          <button type="button" className="btn btn-primary audit-input-btn" tabIndex={-1}>
            Analyze
          </button>
        </div>
        <div className="audit-input-chips">
          {AUDIT_CHECKS.map((check) => (
            <span key={check} className="audit-input-chip">
              {check}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LandingProgressPreview() {
  return (
    <div className="landing-ui-preview landing-ui-preview--progress">
      <div className="progress-shell progress-shell--compact">
        <div className="progress-layout progress-layout--compact">
          <div className="progress-preview-card">
            <div className="progress-preview-chrome">
              <span className="progress-preview-dot progress-preview-dot-red" />
              <span className="progress-preview-dot progress-preview-dot-amber" />
              <span className="progress-preview-dot progress-preview-dot-green" />
              <span className="progress-preview-url">{DEMO_SITE.urlWithProtocol}</span>
            </div>
            <div className="progress-preview-body progress-preview-body--scanning">
              <img
                src="/landing/finding-hero-cta.svg"
                alt=""
                className="progress-preview-shot"
              />
              <div className="progress-preview-scan" aria-hidden="true">
                <div className="progress-preview-laser-trail" />
                <div className="progress-preview-laser-line" />
              </div>
              <span className="progress-preview-section-tag">Hero</span>
            </div>
            <ul className="progress-preview-sections" aria-label="Sections captured">
              {DEMO_SITE.sections.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
          </div>

          <div className="progress-card progress-card--steps">
            <div className="progress-header">
              <p className="progress-eyebrow">Your audit is underway</p>
              <p className="progress-url">{DEMO_SITE.urlWithProtocol}</p>
            </div>
            <div className="progress-bar" aria-hidden="true">
              <div className="progress-bar-fill" style={{ width: "52%" }} />
            </div>
            <ol className="progress-steps">
              {PROGRESS_STEPS.map((step) => (
                <li key={step.id} className={`progress-step ${step.state}`}>
                  <span className="progress-step-icon" aria-hidden="true">
                    {step.state === "done" ? (
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
                    ) : step.state === "active" ? (
                      <span className="progress-step-spinner" />
                    ) : null}
                  </span>
                  <span className="progress-step-label">{step.label}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingIssuePreview() {
  const issue = DEMO_ISSUES[0];

  return (
    <div className="landing-ui-preview landing-ui-preview--issue">
      <div className="report-shell report-shell--landing">
        <div className="report-body--minimal">
          <div className="issue-list issue-list--minimal">
            <IssueRow
              issue={issue}
              index={0}
              screenshotUrl={issue.screenshot_url}
              interactive={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeatureShowcasePreview({ type }) {
  if (type === "browser") return <LandingProgressPreview />;
  if (type === "issue") return <LandingIssuePreview />;
  return <LandingReportPreview issues={DEMO_ISSUES.slice(0, 2)} compact />;
}

export function LandingReportPreview({ issues = DEMO_ISSUES, compact = false }) {
  const shownScreens = new Set();

  return (
    <div
      className={`landing-ui-preview landing-ui-preview--report${
        compact ? " landing-ui-preview--report-compact" : ""
      }`}
    >
      <div className="report-shell report-shell--landing">
        <ReportCoverHero job={DEMO_JOB} summary={DEMO_SUMMARY} />
        <div className="report-body--minimal">
          <ReportMeta summary={DEMO_SUMMARY} aboveFold={DEMO_ABOVE_FOLD} />
          <section className="report-issues" aria-label="Sample audit issues">
            <h2 className="report-issues-heading">
              Issues
              <span className="report-issues-count">{DEMO_SUMMARY.totalIssues}</span>
            </h2>
            <div className="issue-list issue-list--minimal">
              {issues.map((issue, idx) => {
                const screenKey = `${issue.section_label}-${issue.viewport || "desktop"}`;
                const showScreenshot =
                  issue.screenshot_url && !shownScreens.has(screenKey);
                if (showScreenshot) shownScreens.add(screenKey);

                return (
                  <IssueRow
                    key={`${issue.title}-${idx}`}
                    issue={issue}
                    index={idx}
                    screenshotUrl={showScreenshot ? issue.screenshot_url : null}
                    interactive={false}
                  />
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
