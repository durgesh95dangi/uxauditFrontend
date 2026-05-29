// pdf/route.js - generates a PDF export of the audit report

import { getSupabaseServerClient } from "../../../../../../lib/supabase/server.js";
import {
  buildPdfFilename,
  buildReportPdfHtml
} from "../../../../../../lib/report/buildReportPdfHtml.js";
import { generateReportPdf } from "../../../../../../lib/report/generateReportPdf.js";
import { loadReportData } from "../../../../../../lib/report/loadReportData.js";

export async function GET(_request, context) {
  const ssr = await getSupabaseServerClient();
  const {
    data: { user }
  } = await ssr.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  const params = await context.params;
  const jobId = params?.jobId;

  const result = await loadReportData(jobId, user.id);
  if (!result.ok) {
    return new Response(
      JSON.stringify({
        error: result.error,
        message: result.message,
        status: result.statusValue
      }),
      {
        status: result.status,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    const html = buildReportPdfHtml(result.data);
    const pdfBuffer = await generateReportPdf(html);
    const filename = buildPdfFilename(result.data);

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store"
      }
    });
  } catch (error) {
    console.error("[PDF] Generation failed:", error?.message || error);
    return new Response(
      JSON.stringify({
        error: "Could not generate PDF",
        detail: error?.message || "Unknown error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
