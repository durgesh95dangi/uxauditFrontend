"use client";

import { useMemo } from "react";
import { resolveSiteProfile } from "../../lib/report/siteProfile.js";
import AuditSummaryInline from "./AuditSummaryInline.jsx";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://uxauditx.com";

function formatAuditDate(iso) {
  if (!iso) return new Date().toLocaleDateString("en-US", { dateStyle: "long" });
  try {
    return new Date(iso).toLocaleDateString("en-US", { dateStyle: "long" });
  } catch {
    return iso;
  }
}

function siteLinkLabel(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "uxauditx.com";
  }
}

export default function ReportCoverHero({ job, summary }) {
  const siteProfile = useMemo(() => resolveSiteProfile(job), [job]);
  const auditDate = formatAuditDate(job?.completed_at || job?.created_at);
  const auditByLabel = siteLinkLabel(SITE_URL);
  const showSummary =
    summary &&
    (summary.totalIssues != null || summary.sectionsAnalyzed != null);

  return (
    <section className="report-cover-hero" aria-label="Audit report cover">
      <div className="report-cover-bg" aria-hidden="true" />
      <div className="report-cover-lines" aria-hidden="true" />
      <div className="report-cover-glow report-cover-glow--left" aria-hidden="true" />
      <div className="report-cover-glow report-cover-glow--right" aria-hidden="true" />

      <div className="report-cover-inner">
        <div className="report-cover-body">
          <h1 className="report-cover-title">Website Audit</h1>

          <dl className="report-cover-details">
            <div className="report-cover-detail report-cover-detail--url">
              <dt>Website</dt>
              <dd>{job?.url || "—"}</dd>
            </div>
            <div className="report-cover-detail">
              <dt>Audit date</dt>
              <dd>{auditDate}</dd>
            </div>
            <div className="report-cover-detail">
              <dt>Audit by</dt>
              <dd>
                <a
                  href={SITE_URL}
                  className="report-cover-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {auditByLabel}
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <footer className="report-cover-footer">
          <div className="report-cover-about">
            <span className="report-cover-about-label">About this site</span>
            <p className="report-cover-category">{siteProfile.category}</p>
            <p className="report-cover-desc">{siteProfile.description}</p>
          </div>
          {showSummary && (
            <div className="report-cover-footer-stats">
              <AuditSummaryInline
                variant="cards"
                className="report-cover-stat-cards"
                issues={summary.totalIssues ?? 0}
                high={summary.high ?? 0}
                sections={summary.sectionsAnalyzed ?? 0}
              />
            </div>
          )}
        </footer>
      </div>
    </section>
  );
}
