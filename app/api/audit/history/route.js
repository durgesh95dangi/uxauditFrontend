// history/route.js - returns the last 10 audit jobs for the authenticated user

import { getSupabaseServerClient } from "../../../../lib/supabase/server.js";
import { supabase as adminClient } from "../../../../src/storage/supabase.js";

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

export async function GET() {
  const ssr = await getSupabaseServerClient();

  const {
    data: { user }
  } = await ssr.auth.getUser();

  if (!user) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const { data, error } = await adminClient
    .from("audit_jobs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  return jsonResponse(data || []);
}
