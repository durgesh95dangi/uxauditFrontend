// buildReportPdfHtml.js - standalone HTML document matching the on-screen audit report

import { resolveSiteProfile } from "./siteProfile.js";
import { PDF_COLORS as C } from "../ui/pdfTheme.js";
const SEVERITY_RANK = { critical: 0, high: 1, medium: 2, low: 3 };
const SEVERITY_LABEL = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low"
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://uxauditx.com";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sortIssues(issues) {
  return [...(issues || [])].sort((a, b) => {
    const ra = SEVERITY_RANK[a?.severity] ?? 99;
    const rb = SEVERITY_RANK[b?.severity] ?? 99;
    return ra - rb;
  });
}

function scoreToneClass(score) {
  if (score >= 70) return "score-good";
  if (score >= 45) return "score-warn";
  return "score-bad";
}

function formatDate(iso) {
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

function renderIssueCard(issue) {
  const sev = issue.severity || "low";
  const viewport =
    issue.viewport === "mobile"
      ? '<span class="badge badge-mobile">Mobile</span>'
      : issue.viewport
        ? '<span class="badge badge-desktop">Desktop</span>'
        : "";

  return `
    <article class="issue-card">
      <div class="issue-head">
        <span class="sev sev-${escapeHtml(sev)}">${escapeHtml(SEVERITY_LABEL[sev] || sev)}</span>
        ${viewport}
        ${issue.point_id ? `<span class="badge">${escapeHtml(issue.point_id)}</span>` : ""}
        ${issue.area ? `<span class="badge badge-area">${escapeHtml(issue.area)}</span>` : ""}
      </div>
      <h4 class="issue-title">${escapeHtml(issue.title)}</h4>
      ${issue.description ? `<p class="issue-desc">${escapeHtml(issue.description)}</p>` : ""}
      <div class="issue-details">
        <p><strong>Why:</strong> ${escapeHtml(issue.why || "—")}</p>
        <p><strong>Business impact:</strong> ${escapeHtml(issue.business_impact || "—")}</p>
        <p><strong>How to fix:</strong> ${escapeHtml(issue.how_to_fix || "—")}</p>
        <p><strong>Effort:</strong> <span class="effort effort-${escapeHtml(issue.effort || "low")}">${escapeHtml((issue.effort || "low").toUpperCase())}</span></p>
      </div>
    </article>
  `;
}

function renderSectionMeta(label, sectionScores) {
  if (!sectionScores) return "";

  const desktop = sectionScores.desktop?.[label];
  const mobile = sectionScores.mobile?.[label];
  const flat = sectionScores[label];

  const blocks = [];

  function block(meta, vpLabel) {
    if (!meta) return "";
    const parts = [];
    if (meta.score != null) {
      parts.push(`<span class="section-score">${escapeHtml(vpLabel)}: ${meta.score}/100</span>`);
    }
    if (meta.positives?.length) {
      parts.push(
        `<div class="positives"><strong>What's working (${escapeHtml(vpLabel)}):</strong><ul>${meta.positives.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul></div>`
      );
    }
    return parts.join("");
  }

  if (desktop || mobile) {
    const d = block(desktop, "Desktop");
    const m = block(mobile, "Mobile");
    if (d || m) blocks.push(`<div class="section-meta">${d}${m}</div>`);
  } else if (flat) {
    const f = block(flat, "Section");
    if (f) blocks.push(`<div class="section-meta">${f}</div>`);
  }

  return blocks.join("");
}

function renderScreenshots(label, screenshotMap) {
  if (!screenshotMap) return "";

  const shots = [];
  if (screenshotMap.desktop?.[label]) {
    shots.push({ vp: "Desktop", url: screenshotMap.desktop[label] });
  }
  if (screenshotMap.mobile?.[label]) {
    shots.push({ vp: "Mobile", url: screenshotMap.mobile[label] });
  }

  if (!shots.length && screenshotMap[label]) {
    shots.push({ vp: "Desktop", url: screenshotMap[label] });
  }

  if (!shots.length) return "";

  return `
    <div class="shots">
      ${shots
        .map(
          (s) => `
        <div class="shot-wrap">
          <div class="shot-label">${escapeHtml(s.vp)}</div>
          <img src="${escapeHtml(s.url)}" alt="${escapeHtml(label)} ${escapeHtml(s.vp)}" class="shot-img" />
        </div>`
        )
        .join("")}
    </div>
  `;
}

function renderAuditQuality(quality) {
  if (!quality?.items?.length) return "";

  return `
    <section class="panel quality-panel">
      <h2>Audit quality</h2>
      <p class="muted">How the page was prepared before analysis</p>
      <ul class="quality-list">
        ${quality.items
          .map(
            (item) => `
          <li class="quality-item quality-${escapeHtml(item.status)}">
            <span class="quality-icon">${item.status === "ok" ? "✓" : item.status === "warn" ? "!" : item.status === "error" ? "×" : "–"}</span>
            <span class="quality-label">${escapeHtml(item.label)}</span>
            <span class="quality-detail">${escapeHtml(item.detail)}</span>
          </li>`
          )
          .join("")}
      </ul>
      ${
        quality.warnings?.length
          ? `<div class="quality-warnings">${quality.warnings.map((w) => `<p>${escapeHtml(w)}</p>`).join("")}</div>`
          : ""
      }
    </section>
  `;
}

function renderCoverPage({ job, siteProfile }) {
  const auditDate = formatDate(job?.completed_at || job?.created_at);
  const url = job?.url || "—";

  return `
    <section class="cover-page">
      <div class="cover-bg"></div>
      <div class="cover-lines"></div>
      <div class="cover-glow cover-glow--left"></div>
      <div class="cover-glow cover-glow--right"></div>
      <div class="cover-inner">
        <div class="cover-body">
          <h1 class="cover-title">Website Audit</h1>
          <dl class="cover-details">
            <div class="cover-detail">
              <dt>Website</dt>
              <dd>${escapeHtml(url)}</dd>
            </div>
            <div class="cover-detail">
              <dt>Audit date</dt>
              <dd>${escapeHtml(auditDate)}</dd>
            </div>
            <div class="cover-detail">
              <dt>Audit by</dt>
              <dd><a href="${SITE_URL}" class="cover-link">${escapeHtml(siteLinkLabel(SITE_URL))}</a></dd>
            </div>
          </dl>
        </div>

        <footer class="cover-footer">
          <div class="cover-about">
            <span class="cover-about-label">About this site</span>
            <p class="cover-category">${escapeHtml(siteProfile.category)}</p>
            <p class="cover-desc">${escapeHtml(siteProfile.description)}</p>
          </div>
        </footer>
      </div>
    </section>`;
}

function pdfStyles() {
  return `
    @page {
      size: A4;
      margin: 18mm 16mm 22mm;
      background: #000;
    }
    @page:first {
      margin: 0;
      background: #000;
    }
    * { box-sizing: border-box; }
    html {
      margin: 0;
      background: #000;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.45;
      color: ${C.ink};
      background: #000;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* ── Cover page ── */
    .cover-page {
      position: relative;
      width: 210mm;
      height: 297mm;
      page-break-after: always;
      break-after: page;
      overflow: hidden;
      background: #000;
    }
    .cover-bg {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 80% 60% at 20% 15%, rgba(139, 92, 246, 0.1) 0%, transparent 55%),
        radial-gradient(ellipse 70% 50% at 85% 85%, rgba(96, 165, 250, 0.06) 0%, transparent 50%),
        #000;
    }
    .cover-lines {
      position: absolute;
      inset: 0;
      opacity: 0.3;
      background-image:
        repeating-linear-gradient(
          -55deg,
          transparent,
          transparent 18px,
          rgba(255, 255, 255, 0.022) 18px,
          rgba(255, 255, 255, 0.022) 19px
        ),
        repeating-linear-gradient(
          35deg,
          transparent,
          transparent 42px,
          rgba(255, 255, 255, 0.012) 42px,
          rgba(255, 255, 255, 0.012) 43px
        );
    }
    .cover-glow {
      position: absolute;
      width: 280px;
      height: 280px;
      border-radius: 50%;
      filter: blur(80px);
      pointer-events: none;
    }
    .cover-glow--left {
      top: 10%;
      left: -8%;
      background: rgba(139, 92, 246, 0.12);
    }
    .cover-glow--right {
      bottom: 6%;
      right: -6%;
      background: rgba(96, 165, 250, 0.08);
    }
    .cover-inner {
      position: relative;
      z-index: 2;
      display: grid;
      grid-template-rows: auto 1fr auto;
      height: 100%;
      padding: 22mm 24mm 20mm;
      box-sizing: border-box;
      text-align: left;
    }
    .cover-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16mm;
    }
    .cover-brand {
      font-size: 9pt;
      font-weight: 600;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: #737373;
    }
    .cover-scores {
      display: flex;
      gap: 10mm;
      flex-shrink: 0;
    }
    .cover-score-block {
      text-align: right;
      min-width: 72px;
    }
    .cover-score-label {
      font-size: 7pt;
      font-family: ui-monospace, monospace;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #737373;
      margin-bottom: 4px;
    }
    .cover-score-num {
      font-size: 32pt;
      font-weight: 700;
      line-height: 1;
      letter-spacing: -0.03em;
    }
    .cover-score-num::after {
      content: "/100";
      font-size: 11pt;
      font-weight: 500;
      opacity: 0.45;
      margin-left: 2px;
    }
    .cover-score-na::after { content: ""; }
    .cover-body {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 8mm 0 12mm;
    }
    .cover-title {
      margin: 0 0 14mm;
      font-size: 52pt;
      font-weight: 700;
      letter-spacing: -0.04em;
      line-height: 0.92;
      color: #fff;
    }
    .cover-details {
      display: grid;
      grid-template-columns: minmax(0, 1.4fr) minmax(0, 0.9fr) minmax(0, 0.7fr);
      gap: 8mm 12mm;
      max-width: 100%;
      margin: 0;
    }
    .cover-detail dt {
      margin: 0 0 4px;
      font-size: 7pt;
      font-family: ui-monospace, monospace;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #737373;
    }
    .cover-detail dd {
      margin: 0;
      font-size: 11pt;
      color: #d4d4d4;
      line-height: 1.45;
      word-break: break-all;
    }
    .cover-detail:first-child dd {
      font-family: ui-monospace, monospace;
      font-size: 10pt;
      color: #a3a3a3;
    }
    .cover-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 12mm;
      padding-top: 10mm;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    .cover-about {
      flex: 1;
      max-width: 120mm;
    }
    .cover-about-label {
      display: block;
      margin-bottom: 6px;
      font-size: 7pt;
      font-family: ui-monospace, monospace;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #737373;
    }
    .cover-category {
      margin: 0 0 6px;
      font-size: 12pt;
      font-weight: 600;
      color: #ededed;
      letter-spacing: 0.01em;
    }
    .cover-desc {
      margin: 0;
      font-size: 10pt;
      line-height: 1.55;
      color: #a3a3a3;
    }
    .cover-byline {
      margin: 0;
      font-size: 9pt;
      color: #737373;
      text-align: right;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .cover-link {
      color: #a78bfa;
      text-decoration: none;
      font-weight: 600;
    }

    .page-content {
      position: relative;
      z-index: 1;
      background: #000;
      padding: 0;
    }
    .header {
      border-bottom: 1px solid rgba(255,255,255,0.12);
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .brand { font-size: 10pt; color: #737373; text-transform: uppercase; letter-spacing: 0.14em; margin: 0 0 6px; }
    h1 { margin: 0 0 8px; font-size: 18pt; letter-spacing: -0.03em; }
    .url { font-family: ui-monospace, monospace; font-size: 10pt; color: #a3a3a3; word-break: break-all; margin: 0; }
    .meta { font-size: 9pt; color: #737373; margin-top: 10px; }
    .summary {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }
    .summary-card {
      background: #141414;
      border-radius: 8px;
      padding: 12px 14px;
      border: 1px solid rgba(255,255,255,0.08);
    }
    .summary-num { font-size: 20pt; font-weight: 600; line-height: 1.1; }
    .summary-label { font-size: 8pt; color: #737373; font-family: ui-monospace, monospace; text-transform: uppercase; }
    .score-good { color: ${C.success}; }
    .score-warn { color: ${C.warning}; }
    .score-bad { color: ${C.error}; }
    .panel {
      background: #141414;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 8px;
      padding: 16px 18px;
      margin-bottom: 18px;
      break-inside: avoid;
    }
    .above-fold h2, .quality-panel h2, .section-block h2 { margin: 0 0 8px; font-size: 13pt; }
    .above-fold-score { font-size: 22pt; font-weight: 600; float: right; }
    .tag-row { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; }
    .tag { font-size: 8pt; padding: 3px 8px; border-radius: 999px; background: #1a1a1a; }
    .tag-pass { color: ${C.success}; background: ${C.successSoft}; }
    .tag-fail { color: ${C.error}; background: ${C.errorSoft}; }
    .risk { margin-top: 8px; font-size: 10pt; color: ${C.warning}; }
    .section-block { page-break-inside: avoid; margin-bottom: 24px; }
    .section-head { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 8px; }
    .section-head h2 { margin: 0; font-size: 14pt; }
    .section-count { font-size: 8pt; font-family: ui-monospace, monospace; color: #737373; background: #1a1a1a; padding: 3px 8px; border-radius: 999px; }
    .section-meta { font-size: 10pt; color: #a3a3a3; margin-bottom: 10px; }
    .section-score { display: inline-block; margin-right: 12px; font-weight: 600; }
    .positives ul { margin: 4px 0 0; padding-left: 18px; }
    .shots { display: grid; gap: 12px; margin-bottom: 14px; }
    .shot-label { font-size: 8pt; font-family: ui-monospace, monospace; color: #737373; text-transform: uppercase; margin-bottom: 4px; }
    .shot-img { width: 100%; max-height: 280px; object-fit: contain; object-position: top; border-radius: 6px; background: #1a1a1a; border: 1px solid rgba(255,255,255,0.08); }
    .issue-card {
      background: #101010;
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 8px;
      padding: 14px 16px;
      margin-bottom: 12px;
      break-inside: avoid;
    }
    .issue-head { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 6px; }
    .issue-title { margin: 0 0 6px; font-size: 12pt; }
    .issue-desc { margin: 0 0 8px; color: #a3a3a3; font-size: 10pt; }
    .issue-details p { margin: 6px 0; font-size: 9.5pt; color: #a3a3a3; line-height: 1.5; }
    .issue-details strong { color: #ededed; }
    .sev, .badge {
      font-size: 8pt;
      font-family: ui-monospace, monospace;
      padding: 2px 8px;
      border-radius: 999px;
      background: #1a1a1a;
    }
    .sev-critical { background: ${C.errorSoft}; color: ${C.error}; }
    .sev-high { background: ${C.warningSoft}; color: ${C.warning}; }
    .sev-medium { background: ${C.warningSoft}; color: ${C.warningMuted}; }
    .sev-low { background: ${C.linkSoft}; color: ${C.link}; }
    .badge-desktop { color: #93c5fd; }
    .badge-mobile { color: ${C.mobile}; }
    .effort { font-size: 8pt; font-family: ui-monospace, monospace; padding: 2px 6px; border-radius: 4px; }
    .effort-low { background: ${C.successSoft}; color: ${C.success}; }
    .effort-medium { background: ${C.warningSoft}; color: ${C.warning}; }
    .effort-high { background: ${C.errorSoft}; color: ${C.error}; }
    .quality-list { list-style: none; padding: 0; margin: 8px 0 0; }
    .quality-item { display: grid; grid-template-columns: 18px 1fr auto; gap: 8px; padding: 4px 0; font-size: 10pt; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .quality-detail { color: #737373; font-family: ui-monospace, monospace; font-size: 8pt; text-align: right; }
    .quality-warnings p { color: #fbbf24; font-size: 9pt; margin: 6px 0 0; }
    .muted { color: #737373; font-size: 9pt; margin: 0 0 8px; }
    .empty { text-align: center; padding: 28px; color: ${C.success}; }
    .pdf-footer {
      margin-top: 28px;
      padding-top: 14px;
      border-top: 1px solid rgba(255,255,255,0.1);
      text-align: center;
      font-size: 9pt;
      color: #737373;
    }
    .pdf-footer a {
      color: #a78bfa;
      text-decoration: none;
      font-weight: 600;
    }

    @media print {
      html,
      body,
      .cover-page,
      .cover-bg,
      .page-content,
      .panel,
      .issue-card {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      html,
      body {
        background: #000 !important;
      }
    }
  `;
}

/**
 * @param {object} report
 * @returns {string}
 */
export function buildReportPdfHtml(report) {
  const {
    job,
    summary,
    sections,
    screenshotMap,
    auditQuality,
    aboveFold,
    overallScore,
    mobileOverallScore,
    sectionScores
  } = report;

  const sectionLabels = Object.keys(sections || {}).filter(
    (label) => (sections[label]?.length ?? 0) > 0
  );

  const siteProfile = resolveSiteProfile(job);
  const coverHtml = renderCoverPage({
    job,
    siteProfile
  });

  const summaryCards = [
    overallScore != null
      ? `<div class="summary-card"><div class="summary-num ${scoreToneClass(overallScore)}">${overallScore}<span style="font-size:11pt;opacity:.5">/100</span></div><div class="summary-label">Desktop UX Score</div></div>`
      : "",
    mobileOverallScore != null
      ? `<div class="summary-card"><div class="summary-num ${scoreToneClass(mobileOverallScore)}">${mobileOverallScore}<span style="font-size:11pt;opacity:.5">/100</span></div><div class="summary-label">Mobile UX Score</div></div>`
      : "",
    `<div class="summary-card"><div class="summary-num">${summary?.totalIssues ?? 0}</div><div class="summary-label">Total Issues</div></div>`,
    `<div class="summary-card"><div class="summary-num">${summary?.critical ?? 0}</div><div class="summary-label">Critical</div></div>`,
    `<div class="summary-card"><div class="summary-num">${summary?.high ?? 0}</div><div class="summary-label">High</div></div>`,
    `<div class="summary-card"><div class="summary-num">${summary?.sectionsAnalyzed ?? 0}</div><div class="summary-label">Sections Analyzed</div></div>`
  ]
    .filter(Boolean)
    .join("");

  const aboveFoldHtml =
    aboveFold?.score != null
      ? `
    <section class="panel above-fold">
      <div class="above-fold-score ${scoreToneClass(aboveFold.score)}">${aboveFold.score}/100</div>
      <h2>First Impression Score</h2>
      <div class="tag-row">
        <span class="tag ${aboveFold.vp_clear ? "tag-pass" : "tag-fail"}">${aboveFold.vp_clear ? "✓" : "✗"} Value prop clear</span>
        <span class="tag ${aboveFold.cta_visible ? "tag-pass" : "tag-fail"}">${aboveFold.cta_visible ? "✓" : "✗"} CTA visible${aboveFold.cta_copy ? ` — "${escapeHtml(aboveFold.cta_copy)}"` : ""}</span>
      </div>
      ${aboveFold.top_risk ? `<p class="risk"><strong>Biggest risk:</strong> ${escapeHtml(aboveFold.top_risk)}</p>` : ""}
    </section>`
      : "";

  const sectionsHtml =
    sectionLabels.length === 0
      ? `<div class="panel empty">${summary?.totalIssues ? "No issue details available." : `${summary?.sectionsAnalyzed ?? 0} sections analyzed — no UX issues found.`}</div>`
      : sectionLabels
          .map((label) => {
            const items = sortIssues(sections[label]);
            return `
      <section class="section-block panel">
        <div class="section-head">
          <h2>${escapeHtml(label)}</h2>
          <span class="section-count">${items.length} ${items.length === 1 ? "issue" : "issues"}</span>
        </div>
        ${renderSectionMeta(label, sectionScores)}
        ${renderScreenshots(label, screenshotMap)}
        ${items.map(renderIssueCard).join("")}
      </section>`;
          })
          .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>UXAuditX Report — ${escapeHtml(job?.url || "Audit")}</title>
  <style>${pdfStyles()}</style>
</head>
<body>
  ${coverHtml}
  <div class="page-content">
    <header class="header">
      <p class="brand">UXAuditX — UX Audit Report</p>
      <h1>Website UX Audit</h1>
      <p class="url">${escapeHtml(job?.url || "—")}</p>
      <p class="meta">Generated ${escapeHtml(formatDate(job?.completed_at || job?.created_at))} · Job ${escapeHtml(job?.id || "")}</p>
    </header>

    <div class="summary">${summaryCards}</div>
    ${aboveFoldHtml}
    ${renderAuditQuality(auditQuality)}
    ${sectionsHtml}

    <footer class="pdf-footer">
      Report created by <a href="${SITE_URL}">${escapeHtml(siteLinkLabel(SITE_URL))}</a>
    </footer>
  </div>
</body>
</html>`;
}

export function buildPdfFilename(report) {
  let host = "site";
  try {
    host = new URL(report.job?.url || "https://example.com").hostname.replace(/^www\./, "");
  } catch {
    // keep default
  }
  const date = new Date().toISOString().slice(0, 10);
  return `uxauditx-audit-${host}-${date}.pdf`;
}

export { SITE_URL };
