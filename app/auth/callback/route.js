// auth/callback/route.js - completes Supabase OAuth code exchange and redirects

import { NextResponse } from "next/server";
import { starterPlanMetadata } from "../../../lib/audit/plans.js";
import { getSupabaseServerClient } from "../../../lib/supabase/server.js";

export const dynamic = "force-dynamic";

function safeNextPath(next) {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return "/dashboard";
}

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const oauthError = requestUrl.searchParams.get("error");
  const oauthErrorDescription = requestUrl.searchParams.get("error_description");
  const next = safeNextPath(requestUrl.searchParams.get("next"));

  if (oauthError) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set(
      "error",
      oauthErrorDescription || oauthError
    );
    return NextResponse.redirect(loginUrl);
  }

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
      const isGoogleUser =
        user.app_metadata?.provider === "google" ||
        user.identities?.some((identity) => identity.provider === "google");

      await supabase.auth.updateUser({
        data: starterPlanMetadata({
          ...(user.user_metadata || {}),
          signup_source: isGoogleUser
            ? "google"
            : user.user_metadata?.signup_source
        })
      });
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
