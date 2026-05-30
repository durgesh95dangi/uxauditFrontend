"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AuditQualityPanel from "./AuditQualityPanel.jsx";
import IssueRow from "./IssueRow.jsx";
import PageToolbar from "../layout/PageToolbar.jsx";
import ReportCoverHero from "./ReportCoverHero.jsx";
import ReportMeta from "./ReportMeta.jsx";
import { IconDownload, IconExternalLink } from "../landing/LandingIcons.jsx";

const SEVERITY_RANK = { critical: 0, high: 1, medium: 2, low: 3 };

function sortIssues(issues) {
  return [...(issues || [])].sort((a, b) => {
    const ra = SEVERITY_RANK[a?.severity] ?? 99;
    const rb = SEVERITY_RANK[b?.severity] ?? 99;
    if (ra !== rb) return ra - rb;
    const sa = String(a?.section_label || "");
    const sb = String(b?.section_label || "");
    return sa.localeCompare(sb);
  });
}

function flattenIssues(sections) {
  const flat = [];
  for (const [label, items] of Object.entries(sections || {})) {
    for (const issue of items || []) {
      flat.push({
        ...issue,
        section_label: issue.section_label || label
      });
    }
  }
  return sortIssues(flat);
}

function buildScreenshotMap(report) {
  if (report?.screenshotMap) return report.screenshotMap;

  const nested = { desktop: {}, mobile: {} };
  for (const shot of report?.screenshots || []) {
    if (shot.type !== "section") continue;
    const vp = shot.viewport === "mobile" ? "mobile" : "desktop";
    if (shot.label && !nested[vp][shot.label]) {
      nested[vp][shot.label] = shot.public_url;
    }
  }
  return nested;
}

function resolveIssueScreenshot(issue, screenshotMap) {
  if (issue.screenshot_url) return issue.screenshot_url;

  const label = issue.section_label;
  if (!label || !screenshotMap) return null;

  const isNested =
    screenshotMap.desktop != null || screenshotMap.mobile != null;

  if (isNested) {
    const vp = issue.viewport === "mobile" ? "mobile" : "desktop";
    return screenshotMap[vp]?.[label] || screenshotMap.desktop?.[label] || null;
  }

  return screenshotMap[label] || null;
}

function SkeletonReport() {
  return (
    <div className="report-skeleton report-skeleton--minimal" aria-hidden="true">
      <div className="report-skeleton-cover" />
      <div className="report-skeleton-body">
        <div className="report-skeleton-line report-skeleton-line-sm" />
        <div className="report-skeleton-issues">
          {[0, 1, 2].map((i) => (
            <div key={i} className="report-skeleton-issue" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AuditReport({
  jobId,
  onBackToReports,
  reportEndpoint,
  backLabel = "← Back",
  renderAfterToolbar = null
}) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  const loadReport = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    setError(null);
    try {
      const endpoint = reportEndpoint || `/api/audit/report/${jobId}`;
      const response = await fetch(endpoint);
      if (response.status === 202) {
        setError("Report is still being generated. Please wait a moment.");
        return;
      }
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error || "Could not load report");
      }
      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(err?.message || "Could not load report. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [jobId, reportEndpoint]);

  const handleDownloadPdf = useCallback(async () => {
    if (!jobId || pdfLoading) return;
    setPdfLoading(true);
    try {
      const response = await fetch(`/api/audit/report/${jobId}/pdf`);
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error || "Could not generate PDF");
      }
      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] || "uxauditx-report.pdf";
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      window.alert(err?.message || "Could not download PDF. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  }, [jobId, pdfLoading]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  useEffect(() => {
    if (!lightboxImage) return undefined;
    function onKeyDown(event) {
      if (event.key === "Escape") setLightboxImage(null);
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxImage]);

  const screenshotMap = useMemo(() => buildScreenshotMap(report), [report]);
  const sections = report?.sections || report?.issues || {};
  const allIssues = useMemo(() => flattenIssues(sections), [sections]);

  if (loading) {
    return (
      <div className="report-shell">
        <SkeletonReport />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="report-shell">
        <div className="report-error-card">
          <p>{error || "Could not load report. Please try again."}</p>
          <div className="report-error-actions">
            <button type="button" className="btn btn-primary" onClick={loadReport}>
              Retry
            </button>
            {typeof onBackToReports === "function" && (
              <button type="button" className="btn btn-ghost" onClick={onBackToReports}>
                ← Back
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const { job, summary, aboveFold } = report;
  const hasIssues = (summary?.totalIssues ?? 0) > 0;
  const issueCount = summary?.totalIssues ?? allIssues.length;

  return (
    <div className="report-shell">
      <PageToolbar
        className="page-toolbar--report"
        onBack={onBackToReports}
        backLabel={backLabel}
      >
        <a
          href={job?.url || "#"}
          className="btn btn-ghost btn-sm page-toolbar-icon-btn"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open site"
          title="Open site"
        >
          <IconExternalLink size={18} />
        </a>
        <button
          type="button"
          className="btn btn-ghost btn-sm page-toolbar-icon-btn report-pdf"
          onClick={handleDownloadPdf}
          disabled={pdfLoading}
          aria-label={pdfLoading ? "Generating PDF" : "Download PDF"}
          title={pdfLoading ? "Generating PDF" : "Download PDF"}
        >
          <IconDownload size={18} />
        </button>
      </PageToolbar>

      {renderAfterToolbar}

      <ReportCoverHero job={job} summary={summary} />

      <div className="report-body--minimal">
        <ReportMeta summary={summary} aboveFold={aboveFold} />
        <AuditQualityPanel quality={report.auditQuality} />

        <section className="report-issues" aria-label="Audit issues">
          {hasIssues && allIssues.length > 0 && (
            <h2 className="report-issues-heading">
              Issues
              <span className="report-issues-count">{issueCount}</span>
            </h2>
          )}

          {!hasIssues ? (
            <p className="report-empty">
              {summary?.sectionsAnalyzed ?? 0} sections analyzed — no issues found.
            </p>
          ) : allIssues.length === 0 ? (
            <p className="report-empty">No issue details available.</p>
          ) : (
            <div className="issue-list issue-list--minimal">
              {(() => {
                const shownScreens = new Set();
                return allIssues.map((issue, idx) => {
                  const screenshotUrl = resolveIssueScreenshot(issue, screenshotMap);
                  const screenKey = `${issue.section_label || "section"}-${issue.viewport || "desktop"}`;
                  const showScreenshot =
                    screenshotUrl && !shownScreens.has(screenKey);
                  if (showScreenshot) shownScreens.add(screenKey);

                  return (
                    <IssueRow
                      key={`${issue.viewport || "desktop"}-${issue.section_label}-${issue.title || "issue"}-${idx}`}
                      issue={issue}
                      index={idx}
                      screenshotUrl={showScreenshot ? screenshotUrl : null}
                      onZoom={setLightboxImage}
                    />
                  );
                });
              })()}
            </div>
          )}
        </section>
      </div>

      {lightboxImage && (
        <div
          className="lightbox"
          onClick={() => setLightboxImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Screenshot preview"
        >
          <img
            src={lightboxImage}
            alt="Screenshot full size"
            className="lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            className="lightbox-close"
            onClick={() => setLightboxImage(null)}
            aria-label="Close preview"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
