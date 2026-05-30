export const AUTH_ROUTES = {
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  authCallback: "/auth/callback",
  dashboard: "/dashboard",
  admin: "/admin"
};

export function safeNextPath(next, fallback = AUTH_ROUTES.dashboard) {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return fallback;
}

/**
 * Resolve post-login destination from URL search params.
 * Supports next, redirectedFrom (proxy), and redirect (signup/pricing).
 */
export function resolvePostLoginPath(searchParams, fallback = AUTH_ROUTES.dashboard) {
  if (!searchParams) return fallback;

  const keys = ["next", "redirectedFrom", "redirect"];
  for (const key of keys) {
    const value =
      typeof searchParams.get === "function"
        ? searchParams.get(key)
        : searchParams[key];

    if (value && value.startsWith("/") && !value.startsWith("//")) {
      return value;
    }
  }

  return fallback;
}

export function resolvePostSignupPath(searchParams) {
  if (!searchParams) return AUTH_ROUTES.dashboard;

  const redirectPath =
    typeof searchParams.get === "function"
      ? searchParams.get("redirect")
      : searchParams.redirect;
  const plan =
    typeof searchParams.get === "function"
      ? searchParams.get("plan")
      : searchParams.plan;

  if (
    redirectPath &&
    redirectPath.startsWith("/") &&
    !redirectPath.startsWith("//")
  ) {
    return plan
      ? `${redirectPath}?plan=${encodeURIComponent(plan)}`
      : redirectPath;
  }

  if (plan === "founder" || plan === "agency") {
    return `/pricing?plan=${encodeURIComponent(plan)}`;
  }

  return AUTH_ROUTES.dashboard;
}
