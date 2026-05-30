/**
 * Builds the OAuth redirect URL for Supabase Google sign-in.
 * Must match redirect URLs configured in the Supabase dashboard.
 */
export function buildOAuthCallbackUrl(origin, nextPath = "/dashboard") {
  const safeNext =
    nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : "/dashboard";

  return `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;
}

/**
 * Starts Google OAuth via Supabase Auth (provider configured in Supabase dashboard).
 */
export async function signInWithGoogle(supabase, { origin, nextPath } = {}) {
  const resolvedOrigin =
    origin || (typeof window !== "undefined" ? window.location.origin : "");

  if (!resolvedOrigin) {
    throw new Error("Unable to determine site origin for Google sign-in.");
  }

  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: buildOAuthCallbackUrl(resolvedOrigin, nextPath),
      queryParams: {
        prompt: "select_account"
      }
    }
  });
}
