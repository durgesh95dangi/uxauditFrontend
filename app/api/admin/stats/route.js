import { requireSuperadminApi } from "../../../../lib/auth/requireSuperadmin.js";
import { getAdminStats } from "../../../../lib/admin/queries.js";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireSuperadminApi();
  if (!gate.ok) return gate.response;

  try {
    const stats = await getAdminStats();
    return Response.json(stats);
  } catch (error) {
    return Response.json(
      { error: error?.message || "Could not load admin stats" },
      { status: 500 }
    );
  }
}
