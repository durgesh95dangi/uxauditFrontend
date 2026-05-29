// report/[jobId]/route.js - returns the full audit report for a completed job

import { getSupabaseServerClient } from "../../../../../lib/supabase/server.js";
import { loadReportData } from "../../../../../lib/report/loadReportData.js";

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

  const result = await loadReportData(jobId, user.id);
  if (!result.ok) {
    return jsonResponse(
      {
        error: result.error,
        message: result.message,
        status: result.statusValue
      },
      result.status
    );
  }

  return jsonResponse(result.data);
}
