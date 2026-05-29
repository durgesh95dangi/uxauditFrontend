// db.js - Supabase DB helpers for jobs, screenshots, and issues tables

import { supabase } from "../../../src/storage/supabase.js";

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

function sortBySeverity(issues) {
  return [...issues].sort((a, b) => {
    const aRank = SEVERITY_ORDER[a.severity] ?? 99;
    const bRank = SEVERITY_ORDER[b.severity] ?? 99;
    if (aRank !== bRank) return aRank - bRank;
    return new Date(a.created_at || 0) - new Date(b.created_at || 0);
  });
}

function toIntOrNull(value) {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : null;
}

function mapScreenshotPayload(jobId, screenshotData) {
  return {
    job_id: jobId,
    type: screenshotData.type,
    viewport: screenshotData.viewport,
    label: screenshotData.label,
    selector: screenshotData.selector,
    r2_key: screenshotData.r2Key ?? null,
    public_url: screenshotData.publicUrl ?? null,
    y_start: toIntOrNull(screenshotData.yStart),
    y_end: toIntOrNull(screenshotData.yEnd),
    clip: screenshotData.clip ?? null,
    confidence: screenshotData.confidence ?? null,
    failed: screenshotData.failed ?? false,
    fail_reason: screenshotData.failReason ?? null
  };
}

function mapIssuePayload(jobId, issueData) {
  return {
    job_id: jobId,
    screenshot_id: issueData.screenshotId ?? issueData.screenshot_id ?? null,
    section_label: issueData.sectionLabel ?? issueData.section_label ?? null,
    viewport: issueData.viewport ?? null,
    title: issueData.title,
    severity: issueData.severity,
    description: issueData.description ?? null,
    why: issueData.why ?? null,
    business_impact:
      issueData.businessImpact ?? issueData.business_impact ?? null,
    how_to_fix: issueData.howToFix ?? issueData.how_to_fix ?? null,
    effort: issueData.effort ?? null,
    category: issueData.category ?? null,
    screenshot_url:
      issueData.screenshotUrl ?? issueData.screenshot_url ?? null,
    point_id: issueData.point_id ?? issueData.pointId ?? null,
    area: issueData.area ?? null
  };
}

export async function createJob(userId, url) {
  const { data, error } = await supabase
    .from("audit_jobs")
    .insert({ user_id: userId, url, status: "pending" })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function updateJobStatus(jobId, status, extra = {}) {
  const payload = { status, last_heartbeat_at: new Date().toISOString() };

  if (extra.error !== undefined) payload.error = extra.error;
  if (extra.section_count !== undefined) payload.section_count = extra.section_count;
  if (extra.issue_count !== undefined) payload.issue_count = extra.issue_count;
  if (extra.completed_at !== undefined) payload.completed_at = extra.completed_at;
  if (extra.current_step !== undefined) payload.current_step = extra.current_step;
  if (extra.audit_metadata !== undefined) payload.audit_metadata = extra.audit_metadata;

  const { data, error } = await supabase
    .from("audit_jobs")
    .update(payload)
    .eq("id", jobId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

// heartbeat - updates last_heartbeat_at (and optionally current_step) without changing status.
// Safe to call frequently; failures are swallowed because losing a heartbeat must never
// abort the actual audit work.
export async function heartbeat(jobId, currentStep) {
  if (!jobId) return;

  const payload = { last_heartbeat_at: new Date().toISOString() };
  if (currentStep !== undefined) payload.current_step = currentStep;

  const { error } = await supabase
    .from("audit_jobs")
    .update(payload)
    .eq("id", jobId);

  if (error) {
    console.warn(`[heartbeat] ${jobId} (${currentStep}):`, error.message);
  }
}

export async function getJob(jobId) {
  const { data, error } = await supabase
    .from("audit_jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (error) throw error;
  return data;
}

export async function getRecentJobs(userId, limit = 10) {
  const { data, error } = await supabase
    .from("audit_jobs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function saveScreenshot(jobId, screenshotData) {
  const payload = mapScreenshotPayload(jobId, screenshotData);

  const { data, error } = await supabase
    .from("screenshots")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function saveScreenshots(jobId, screenshotsArray) {
  if (!screenshotsArray || screenshotsArray.length === 0) return [];

  const payload = screenshotsArray.map((item) => mapScreenshotPayload(jobId, item));

  const { data, error } = await supabase.from("screenshots").insert(payload).select("*");

  if (error) throw error;
  return data || [];
}

export async function getScreenshots(jobId, filters = {}) {
  let query = supabase.from("screenshots").select("*").eq("job_id", jobId);

  if (filters.viewport) query = query.eq("viewport", filters.viewport);
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.label) query = query.ilike("label", `%${filters.label}%`);
  if (filters.failed !== undefined) query = query.eq("failed", filters.failed);

  query = query.order("y_start", { ascending: true });

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function saveIssue(jobId, issueData) {
  const payload = mapIssuePayload(jobId, issueData);

  const { data, error } = await supabase
    .from("issues")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function saveIssues(jobId, issuesArray) {
  if (!issuesArray || issuesArray.length === 0) return 0;

  const payload = issuesArray.map((item) => mapIssuePayload(jobId, item));

  const { data, error } = await supabase.from("issues").insert(payload).select("id");

  if (error) throw error;
  return (data || []).length;
}

export async function getIssues(jobId, filters = {}) {
  let query = supabase.from("issues").select("*").eq("job_id", jobId);

  if (filters.severity) query = query.eq("severity", filters.severity);
  if (filters.viewport) query = query.eq("viewport", filters.viewport);
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.sectionLabel) query = query.eq("section_label", filters.sectionLabel);

  const { data, error } = await query;
  if (error) throw error;
  return sortBySeverity(data || []);
}

export async function updateScreenshotAnalysis(screenshotId, { sectionScore, positives }) {
  if (!screenshotId) return;

  const { error } = await supabase
    .from("screenshots")
    .update({
      section_score: sectionScore ?? null,
      positives: positives ?? []
    })
    .eq("id", screenshotId);

  if (error) {
    console.warn(`[updateScreenshotAnalysis] ${screenshotId}:`, error.message);
  }
}

export async function updateJobFields(jobId, fields) {
  if (!jobId || !fields || Object.keys(fields).length === 0) return;

  const { error } = await supabase
    .from("audit_jobs")
    .update(fields)
    .eq("id", jobId);

  if (error) {
    console.warn(`[updateJobFields] ${jobId}:`, error.message);
  }
}

export async function getSectionScores(jobId, viewport) {
  const { data, error } = await supabase
    .from("screenshots")
    .select("section_score, label")
    .eq("job_id", jobId)
    .eq("type", "section")
    .eq("viewport", viewport)
    .eq("failed", false)
    .not("section_score", "is", null);

  if (error) throw error;
  return data || [];
}

/** @deprecated use getSectionScores(jobId, "desktop") */
export async function getDesktopSectionScores(jobId) {
  return getSectionScores(jobId, "desktop");
}

export async function getFullReport(jobId) {
  const job = await getJob(jobId);

  const issues = await getIssues(jobId);
  const screenshots = await getScreenshots(jobId, { type: "section", viewport: "desktop" });

  const issuesBySection = issues.reduce((acc, issue) => {
    const key = issue.section_label || "unlabeled";
    if (!acc[key]) acc[key] = [];
    acc[key].push(issue);
    return acc;
  }, {});

  const summary = {
    totalIssues: issues.length,
    critical: issues.filter((i) => i.severity === "critical").length,
    high: issues.filter((i) => i.severity === "high").length,
    medium: issues.filter((i) => i.severity === "medium").length,
    low: issues.filter((i) => i.severity === "low").length,
    sectionsAnalyzed: new Set(screenshots.map((s) => s.label).filter(Boolean)).size
  };

  return {
    job,
    issues: issuesBySection,
    screenshots,
    summary
  };
}
