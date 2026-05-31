"use client";

import Link from "next/link";
import IssueRow from "../audit/IssueRow.jsx";
import ReportCoverHero from "../audit/ReportCoverHero.jsx";
import ReportMeta from "../audit/ReportMeta.jsx";
import {
  buildHeroAuditDemoJob,
  HERO_AUDIT_BLURRED_PLACEHOLDERS,
  HERO_AUDIT_DEMO_ABOVE_FOLD,
  HERO_AUDIT_DEMO_SUMMARY,
  HERO_AUDIT_HIDDEN_COUNT,
  HERO_AUDIT_VISIBLE_ISSUES,
  mapIssuesForPreview
} from "../../lib/landing/demoReport.js";

function BlurredIssueRow({ issue, index }) {
  return (
    <div className="hero-audit-issue-row--blurred" aria-hidden="true">
      <IssueRow issue={issue} index={index} interactive={false} />
    </div>
  );
}

export default function HeroAuditResults({ auditedUrl }) {
  const job = buildHeroAuditDemoJob(auditedUrl);
  const visibleIssues = mapIssuesForPreview(HERO_AUDIT_VISIBLE_ISSUES);

  return (
    <div className="report-shell report-shell--landing hero-audit-report">
      <ReportCoverHero job={job} summary={HERO_AUDIT_DEMO_SUMMARY} />

      <div className="report-body--minimal">
        <ReportMeta aboveFold={HERO_AUDIT_DEMO_ABOVE_FOLD} />

        <section className="report-issues" aria-label="Sample audit issues">
          <h2 className="report-issues-heading">
            Issues
            <span className="report-issues-count">{HERO_AUDIT_DEMO_SUMMARY.totalIssues}</span>
          </h2>

          <div className="issue-list issue-list--minimal">
            {visibleIssues.map(({ issue, index, screenshotUrl, key }) => (
              <IssueRow
                key={key}
                issue={issue}
                index={index}
                screenshotUrl={screenshotUrl}
                interactive={false}
              />
            ))}

            {HERO_AUDIT_BLURRED_PLACEHOLDERS.map((issue, index) => (
              <BlurredIssueRow
                key={`${issue.title}-${index}`}
                issue={issue}
                index={HERO_AUDIT_VISIBLE_ISSUES.length + index}
              />
            ))}
          </div>
        </section>

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
    </div>
  );
}
