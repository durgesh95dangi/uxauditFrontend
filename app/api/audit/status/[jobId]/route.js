// status/[jobId]/route.js - returns the current state of a job (polled by AuditProgress)

import { getSupabaseServerClient } from "../../../../../lib/supabase/server.js";
import { supabase as adminClient } from "../../../../../src/storage/supabase.js";

export const dynamic = "force-dynamic";

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

export async function GET(_request, context) {
  const ssr = await getSupabaseServerClient();
  const {
    data: { user }
  } = await ssr.auth.getUser();

  if (!user) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const params = await context.params;
  const jobId = params?.jobId;
  if (!jobId) {
    return jsonResponse({ error: "Missing jobId" }, 400);
  }

  const { data: job, error } = await adminClient
    .from("audit_jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (error || !job) {
    return jsonResponse({ error: "Not found" }, 404);
  }

  if (job.user_id !== user.id) {
    return jsonResponse({ error: "Forbidden" }, 403);
  }

  let previewUrl = null;
  let previewLabel = null;
  let capturedSections = [];

  if (job.status === "running" || job.status === "done") {
    const { data: shots } = await adminClient
      .from("screenshots")
      .select("label, public_url, viewport, y_start, r2_key")
      .eq("job_id", jobId)
      .eq("type", "section")
      .eq("failed", false)
      .order("y_start", { ascending: true });

    if (shots?.length) {
      capturedSections = shots.map((shot) => ({
        label: shot.label,
        viewport: shot.viewport
      }));

      const heroShot =
        shots.find((shot) => /hero_preview/i.test(shot.r2_key || "")) ||
        shots.find(
          (shot) =>
            shot.viewport === "desktop" &&
            /hero/i.test(shot.label || "") &&
            (shot.y_start ?? 0) <= 20
        );

      previewUrl = heroShot?.public_url || null;
      previewLabel = heroShot?.label || null;
    }
  }

  return jsonResponse({
    jobId,
    url: job.url,
    status: job.status,
    currentStep: job.current_step || null,
    lastHeartbeatAt: job.last_heartbeat_at || null,
    issueCount: job.issue_count,
    sectionCount: job.section_count,
    previewUrl,
    previewLabel,
    capturedSections,
    error: job.error || null,
    createdAt: job.created_at,
    completedAt: job.completed_at
  });
}
