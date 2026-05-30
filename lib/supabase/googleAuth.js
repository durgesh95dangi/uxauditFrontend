import { buildAuthCallbackUrl } from "../siteUrl.js";

/**
 * Starts Google OAuth via Supabase Auth (provider configured in Supabase dashboard).
 */
export async function signInWithGoogle(supabase, { nextPath } = {}) {
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: buildAuthCallbackUrl(nextPath),
      queryParams: {
        prompt: "select_account"
      }
    }
  });
}
