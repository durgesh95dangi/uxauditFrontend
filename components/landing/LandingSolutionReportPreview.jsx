import { DEMO_ISSUES, DEMO_JOB, DEMO_SUMMARY } from "../../lib/landing/demoReport.js";

const SEVERITY_LABEL = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low"
};

export default function LandingSolutionReportPreview() {
  const issue = DEMO_ISSUES[0];

  return (
    <div className="landing-ui-preview landing-ui-preview--solution-report">
      <div className="solution-report-preview">
        <header className="solution-report-preview-head">
          <div>
            <p className="solution-report-preview-kicker">UX Audit Report</p>
            <p className="solution-report-preview-url">{DEMO_JOB.url}</p>
          </div>
          <span className="solution-report-preview-badge">
            {DEMO_SUMMARY.totalIssues} issues
          </span>
        </header>

        <article className="solution-report-preview-issue">
          <div className="solution-report-preview-issue-meta">
            <span className={`issue-row-sev issue-row-sev--${issue.severity}`}>
              {SEVERITY_LABEL[issue.severity]}
            </span>
            <span className="solution-report-preview-section">
              {issue.section_label} · {issue.viewport === "mobile" ? "Phone" : "Desktop"}
            </span>
          </div>
          <h3 className="solution-report-preview-title">{issue.title}</h3>
          {issue.screenshot_url ? (
            <div className="solution-report-preview-shot-wrap">
              <img
                src={issue.screenshot_url}
                alt=""
                className="solution-report-preview-shot"
              />
            </div>
          ) : null}
          <p className="solution-report-preview-fix">
            <strong>Fix:</strong> {issue.how_to_fix}
          </p>
        </article>
      </div>
    </div>
  );
}
