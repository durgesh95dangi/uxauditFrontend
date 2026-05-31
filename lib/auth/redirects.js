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

  let destination = fallback;
  const keys = ["next", "redirectedFrom", "redirect"];
  for (const key of keys) {
    const value =
      typeof searchParams.get === "function"
        ? searchParams.get(key)
        : searchParams[key];

    if (value && value.startsWith("/") && !value.startsWith("//")) {
      destination = value;
      break;
    }
  }

  const urlVal =
    typeof searchParams.get === "function"
      ? searchParams.get("url")
      : searchParams.url;

  if (urlVal) {
    const separator = destination.includes("?") ? "&" : "?";
    return `${destination}${separator}url=${encodeURIComponent(urlVal)}`;
  }

  return destination;
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
  const urlVal =
    typeof searchParams.get === "function"
      ? searchParams.get("url")
      : searchParams.url;

  let destination = AUTH_ROUTES.dashboard;

  if (
    redirectPath &&
    redirectPath.startsWith("/") &&
    !redirectPath.startsWith("//")
  ) {
    destination = redirectPath;
  } else if (plan === "founder" || plan === "agency") {
    destination = `/pricing?plan=${encodeURIComponent(plan)}`;
    if (urlVal) {
      destination += `&url=${encodeURIComponent(urlVal)}`;
    }
    return destination;
  }

  // Construct search params to append
  const params = [];
  if (plan) params.push(`plan=${encodeURIComponent(plan)}`);
  if (urlVal) params.push(`url=${encodeURIComponent(urlVal)}`);

  if (params.length > 0) {
    const separator = destination.includes("?") ? "&" : "?";
    return `${destination}${separator}${params.join("&")}`;
  }

  return destination;
}
