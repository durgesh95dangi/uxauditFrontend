// auth/callback/route.js - completes Supabase OAuth code exchange and redirects

import { NextResponse } from "next/server";
import { starterPlanMetadata } from "../../../lib/audit/plans.js";
import { getSupabaseServerClient } from "../../../lib/supabase/server.js";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  if (code) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      const loginUrl = new URL("/login", requestUrl.origin);
      loginUrl.searchParams.set("error", error.message);
      return NextResponse.redirect(loginUrl);
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user && !user.user_metadata?.plan) {
      await supabase.auth.updateUser({
        data: starterPlanMetadata(user.user_metadata || {})
      });
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
