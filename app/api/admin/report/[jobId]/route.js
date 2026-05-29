import { requireSuperadminApi } from "../../../../../lib/auth/requireSuperadmin.js";
import { loadReportData } from "../../../../../lib/report/loadReportData.js";

export const dynamic = "force-dynamic";

export async function GET(_request, context) {
  const gate = await requireSuperadminApi();
  if (!gate.ok) return gate.response;

  const params = await context.params;
  const jobId = params?.jobId;

  const result = await loadReportData(jobId, gate.user.id, { skipOwnerCheck: true });
  if (!result.ok) {
    return Response.json(
      {
        error: result.error,
        message: result.message,
        status: result.statusValue
      },
      { status: result.status }
    );
  }

  return Response.json(result.data);
}
