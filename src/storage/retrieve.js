import { supabase } from "./supabase.js";

const confidenceRank = { high: 3, medium: 2, low: 1 };

async function safeQuery(queryBuilder) {
  try {
    const { data, error } = await queryBuilder;
    if (error || !data) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export async function getByJobId(jobId) {
  return safeQuery(
    supabase.from("screenshots").select("*").eq("job_id", jobId).eq("failed", false).order("y_start", { ascending: true })
  );
}

export async function getSectionsByLabel(jobId, label) {
  return safeQuery(
    supabase.from("screenshots").select("*").ilike("label", `%${label}%`).eq("job_id", jobId).eq("type", "section").eq("failed", false)
  );
}

export async function getSectionsByLabelAndViewport(jobId, label, viewport) {
  return safeQuery(
    supabase
      .from("screenshots")
      .select("*")
      .ilike("label", `%${label}%`)
      .eq("job_id", jobId)
      .eq("type", "section")
      .eq("viewport", viewport)
      .eq("failed", false)
  );
}

export async function getByViewport(jobId, viewport) {
  return safeQuery(
    supabase
      .from("screenshots")
      .select("*")
      .eq("job_id", jobId)
      .eq("viewport", viewport)
      .eq("type", "section")
      .eq("failed", false)
      .order("y_start", { ascending: true })
  );
}

export async function getSectionForYPosition(jobId, y, viewport) {
  const data = await safeQuery(
    supabase
      .from("screenshots")
      .select("*")
      .eq("job_id", jobId)
      .eq("viewport", viewport)
      .eq("type", "section")
      .lte("y_start", y)
      .gte("y_end", y)
      .eq("failed", false)
  );

  if (!data || data.length === 0) {
    return null;
  }

  const sorted = [...data].sort((a, b) => (confidenceRank[b.confidence] || 0) - (confidenceRank[a.confidence] || 0));
  return sorted[0] || null;
}

export async function getFullPage(jobId, viewport) {
  return safeQuery(
    supabase.from("screenshots").select("*").eq("job_id", jobId).eq("type", "full").eq("viewport", viewport).single()
  );
}

export async function getElementByLabel(jobId, label) {
  return safeQuery(
    supabase.from("screenshots").select("*").eq("job_id", jobId).eq("type", "element").ilike("label", `%${label}%`)
  );
}

export async function searchByLabel(jobId, partialLabel) {
  return safeQuery(
    supabase
      .from("screenshots")
      .select("*")
      .eq("job_id", jobId)
      .ilike("label", `%${partialLabel}%`)
      .eq("failed", false)
      .order("confidence", { ascending: false })
  );
}

export async function getSectionsInYRange(jobId, yStart, yEnd, viewport) {
  return safeQuery(
    supabase
      .from("screenshots")
      .select("*")
      .eq("job_id", jobId)
      .eq("viewport", viewport)
      .lte("y_start", yEnd)
      .gte("y_end", yStart)
      .eq("failed", false)
  );
}

export async function getSectionAboveFold(jobId, viewport, viewportHeight) {
  return safeQuery(
    supabase
      .from("screenshots")
      .select("*")
      .eq("job_id", jobId)
      .eq("viewport", viewport)
      .eq("type", "section")
      .lt("y_start", viewportHeight)
      .eq("failed", false)
  );
}

export async function getFailedCaptures(jobId) {
  return safeQuery(supabase.from("screenshots").select("*").eq("job_id", jobId).eq("failed", true));
}
