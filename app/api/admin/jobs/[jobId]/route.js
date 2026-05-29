import { requireSuperadminApi } from "../../../../../lib/auth/requireSuperadmin.js";
import {
  deleteAdminJob,
  updateAdminJob
} from "../../../../../lib/admin/mutations.js";
import { listAdminJobs } from "../../../../../lib/admin/queries.js";

export const dynamic = "force-dynamic";

function mapJob(job) {
  return {
    id: job.id,
    userId: job.user_id,
    url: job.url,
    status: job.status,
    issueCount: job.issue_count ?? 0,
    sectionCount: job.section_count ?? 0,
    overallScore: job.overall_score ?? null,
    createdAt: job.created_at,
    completedAt: job.completed_at,
    error: job.error || null
  };
}

export async function PATCH(request, context) {
  const gate = await requireSuperadminApi();
  if (!gate.ok) return gate.response;

  const params = await context.params;
  const jobId = params?.jobId;

  if (!jobId) {
    return Response.json({ error: "Missing jobId" }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const job = await updateAdminJob(jobId, {
      status: body?.status,
      url: body?.url
    });
    const jobs = await listAdminJobs({ limit: 500 });
    const match = jobs.find((row) => row.id === jobId);
    return Response.json({ job: match || mapJob(job) });
  } catch (err) {
    return Response.json(
      { error: err?.message || "Could not update audit" },
      { status: 400 }
    );
  }
}

export async function DELETE(_request, context) {
  const gate = await requireSuperadminApi();
  if (!gate.ok) return gate.response;

  const params = await context.params;
  const jobId = params?.jobId;

  if (!jobId) {
    return Response.json({ error: "Missing jobId" }, { status: 400 });
  }

  try {
    const result = await deleteAdminJob(jobId);
    return Response.json({ ok: true, ...result });
  } catch (err) {
    return Response.json(
      { error: err?.message || "Could not delete audit" },
      { status: 400 }
    );
  }
}
