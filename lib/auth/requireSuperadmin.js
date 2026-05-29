import { getSupabaseServerClient } from "../supabase/server.js";
import { hasAdminPinSession } from "./adminPinSession.js";
import { isSuperadmin } from "./superadmin.js";

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

export async function requireSuperadminApi(options = {}) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, response: jsonResponse({ error: "Unauthorized" }, 401) };
  }

  if (!isSuperadmin(user)) {
    return { ok: false, response: jsonResponse({ error: "Forbidden" }, 403) };
  }

  if (!options.skipPinCheck) {
    const pinOk = await hasAdminPinSession(user.id);
    if (!pinOk) {
      return {
        ok: false,
        response: jsonResponse({ error: "PIN required", code: "PIN_REQUIRED" }, 403)
      };
    }
  }

  return { ok: true, user };
}

export async function requireSuperadminPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, redirectTo: "/login?next=/admin" };
  }

  if (!isSuperadmin(user)) {
    return { ok: false, redirectTo: "/dashboard" };
  }

  const pinOk = await hasAdminPinSession(user.id);
  if (!pinOk) {
    return { ok: true, user, needsPin: true };
  }

  return { ok: true, user, needsPin: false };
}
