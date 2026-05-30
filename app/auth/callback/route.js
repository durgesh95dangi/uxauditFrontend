// auth/callback/route.js - completes Supabase OAuth code exchange and redirects

import { NextResponse } from "next/server";
import { starterPlanMetadata } from "../../../lib/audit/plans.js";
import { AUTH_ROUTES, safeNextPath } from "../../../lib/auth/redirects.js";
import { buildAbsoluteUrl } from "../../../lib/siteUrl.js";
import { getSupabaseServerClient } from "../../../lib/supabase/server.js";

export const dynamic = "force-dynamic";

function redirectToLogin(request, message) {
  const loginUrl = buildAbsoluteUrl(AUTH_ROUTES.login, request);
  if (message) {
    loginUrl.searchParams.set("error", message);
  }
  return NextResponse.redirect(loginUrl);
}

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const oauthError = requestUrl.searchParams.get("error");
  const oauthErrorDescription = requestUrl.searchParams.get(
    "error_description"
  );
  const next = safeNextPath(requestUrl.searchParams.get("next"));

  if (oauthError) {
    return redirectToLogin(
      request,
      oauthErrorDescription || oauthError
    );
  }

  if (!code) {
    return redirectToLogin(request, "Missing authentication code.");
  }

  const supabase = await getSupabaseServerClient();
  const { data: sessionData, error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return redirectToLogin(request, exchangeError.message);
  }

  if (!sessionData?.session) {
    return redirectToLogin(
      request,
      "Sign-in completed but no session was created. Please try again."
    );
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

  return NextResponse.redirect(buildAbsoluteUrl(next, request));
}
