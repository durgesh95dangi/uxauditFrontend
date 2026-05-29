import { requireSuperadminApi } from "../../../../lib/auth/requireSuperadmin.js";
import {
  setAdminPinSession,
  verifyAdminPin
} from "../../../../lib/auth/adminPinSession.js";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const gate = await requireSuperadminApi({ skipPinCheck: true });
  if (!gate.ok) return gate.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const pin = body?.pin;
  if (!verifyAdminPin(pin)) {
    return Response.json({ error: "Incorrect PIN" }, { status: 401 });
  }

  const saved = await setAdminPinSession(gate.user.id);
  if (!saved) {
    return Response.json({ error: "Admin PIN not configured" }, { status: 503 });
  }

  return Response.json({ ok: true });
}
