import { AUTH_ROUTES } from "./redirects.js";

/** Sign out and navigate to login (consistent across app shells). */
export async function signOutToLogin(supabase, router, options = {}) {
  if (!supabase) return;

  await supabase.auth.signOut();

  const next = options.next;
  const loginPath =
    next && next.startsWith("/") && !next.startsWith("//")
      ? `${AUTH_ROUTES.login}?next=${encodeURIComponent(next)}`
      : AUTH_ROUTES.login;

  if (router) {
    router.push(loginPath);
    router.refresh();
    return;
  }

  if (typeof window !== "undefined") {
    window.location.assign(loginPath);
  }
}
