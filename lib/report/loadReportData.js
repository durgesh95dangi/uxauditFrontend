// loadReportData.js - shared report payload for API + PDF export

import { supabase as adminClient } from "../../src/storage/supabase.js";
import { normalizeAuditQuality } from "../engine/auditQuality.js";
import {
  REPORT_TIER_FULL,
  reportTierLabel,
  resolveJobReportTier
} from "../audit/reportTier.js";
import { resolveSiteProfile } from "./siteProfile.js";

/**
 * @param {string} jobId
 * @param {string} userId
 * @param {{ skipOwnerCheck?: boolean }} [options]
 * @returns {Promise<{ ok: true, data: object } | { ok: false, status: number, error: string, message?: string }>}
 */
export async function loadReportData(jobId, userId, options = {}) {
  if (!jobId) {
    return { ok: false, status: 400, error: "Missing jobId" };
  }

  const { data: job, error: jobErr } = await adminClient
    .from("audit_jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (jobErr || !job) {
    return { ok: false, status: 404, error: "Not found" };
  }

  if (!options.skipOwnerCheck && job.user_id !== userId) {
    return { ok: false, status: 403, error: "Forbidden" };
  }

  if (job.status !== "done") {
    return {
      ok: false,
      status: 202,
      error: "Not ready",
      message: "Report not ready yet",
      statusValue: job.status
    };
  }

  const [issuesResult, screenshotsResult] = await Promise.all([
    adminClient
      .from("issues")
      .select("*")
      .eq("job_id", jobId)
      .order("created_at", { ascending: true }),
    adminClient
      .from("screenshots")
      .select("*")
      .eq("job_id", jobId)
      .eq("type", "section")
      .in("viewport", ["desktop", "mobile"])
      .eq("failed", false)
      .order("y_start", { ascending: true })
  ]);

  if (issuesResult.error) {
    return { ok: false, status: 500, error: issuesResult.error.message };
  }
  if (screenshotsResult.error) {
    return { ok: false, status: 500, error: screenshotsResult.error.message };
  }

  const issues = issuesResult.data || [];
  const screenshots = screenshotsResult.data || [];

  const grouped = {};
  for (const issue of issues) {
    const label = issue.section_label || "Unknown";
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(issue);
  }

  const uniqueSectionLabels = new Set(
    screenshots.map((s) => s.label).filter(Boolean)
  );

  const desktopIssues = issues.filter((i) => i.viewport === "desktop");
  const mobileIssues = issues.filter((i) => i.viewport === "mobile");

  const summary = {
    totalIssues: issues.length,
    critical: issues.filter((i) => i.severity === "critical").length,
    high: issues.filter((i) => i.severity === "high").length,
    medium: issues.filter((i) => i.severity === "medium").length,
    low: issues.filter((i) => i.severity === "low").length,
    sectionsAnalyzed: uniqueSectionLabels.size || screenshots.length,
    sectionsWithIssues: Object.keys(grouped).length,
    desktopIssues: desktopIssues.length,
    mobileIssues: mobileIssues.length
  };

  const screenshotMap = { desktop: {}, mobile: {} };
  const sectionScores = { desktop: {}, mobile: {} };

  for (const s of screenshots) {
    const vp = s.viewport === "mobile" ? "mobile" : "desktop";
    if (s.label) {
      if (!screenshotMap[vp][s.label]) {
        screenshotMap[vp][s.label] = s.public_url;
      }
      sectionScores[vp][s.label] = {
        score: s.section_score ?? null,
        positives: s.positives || []
      };
    }
  }

  const aboveFold = {
    score: job.above_fold_score ?? null,
    vp_clear: job.above_fold_vp_clear ?? null,
    cta_visible: job.above_fold_cta_visible ?? null,
    cta_copy: job.above_fold_cta_copy ?? null,
    top_risk: job.above_fold_top_risk ?? null
  };

  const hasAboveFold =
    aboveFold.score != null ||
    aboveFold.vp_clear != null ||
    aboveFold.cta_visible != null ||
    aboveFold.top_risk;

  const reportTier = resolveJobReportTier(job, REPORT_TIER_FULL);

  return {
    ok: true,
    data: {
      job,
      reportTier,
      reportTierLabel: reportTierLabel(reportTier),
      summary,
      sections: grouped,
      screenshots,
      screenshotMap,
      auditQuality: normalizeAuditQuality(job.audit_metadata, summary),
      aboveFold: hasAboveFold ? aboveFold : null,
      overallScore: job.overall_score ?? null,
      mobileOverallScore: job.mobile_overall_score ?? null,
      sectionScores,
      siteProfile: resolveSiteProfile(job)
    }
  };
}
