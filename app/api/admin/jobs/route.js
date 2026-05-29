import { requireSuperadminApi } from "../../../../lib/auth/requireSuperadmin.js";
import { listAdminJobs } from "../../../../lib/admin/queries.js";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const gate = await requireSuperadminApi();
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(
    500,
    Math.max(1, Number.parseInt(searchParams.get("limit") || "500", 10) || 500)
  );

  try {
    const jobs = await listAdminJobs({ limit });
    return Response.json({ jobs });
  } catch (error) {
    return Response.json(
      { error: error?.message || "Could not load audits" },
      { status: 500 }
    );
  }
}
