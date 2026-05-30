import { SITE_URL } from "./metadata.js";

const LOCAL_ORIGIN_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

/** Canonical production URL from env or metadata (never localhost). */
export function getConfiguredSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || SITE_URL;
  return raw.replace(/\/$/, "");
}

function readRuntimeSiteUrl() {
  if (typeof window === "undefined") return null;
  const fromWindow = window.__UXAUDITX_PUBLIC_CONFIG__?.siteUrl;
  return fromWindow ? fromWindow.replace(/\/$/, "") : null;
}

export function isLocalOrigin(origin) {
  return LOCAL_ORIGIN_PATTERN.test(origin || "");
}

/**
 * Origin used in Supabase auth emails and OAuth redirectTo.
 * Always uses configured production URL unless explicitly overridden for local dev.
 */
export function getAuthRedirectOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return getConfiguredSiteUrl();
  }

  const runtime = readRuntimeSiteUrl();
  if (runtime) return runtime;

  if (typeof window !== "undefined") {
    const origin = window.location.origin.replace(/\/$/, "");
    if (isLocalOrigin(origin)) {
      return getConfiguredSiteUrl();
    }
    return origin;
  }

  return getConfiguredSiteUrl();
}

/**
 * General site URL for client UI (Paddle success URL, etc.).
 * Uses current origin on production domains; configured URL otherwise.
 */
export function getSiteUrl() {
  if (typeof window !== "undefined") {
    const origin = window.location.origin.replace(/\/$/, "");
    if (!isLocalOrigin(origin)) {
      return origin;
    }
  }

  return readRuntimeSiteUrl() || getConfiguredSiteUrl();
}

/** Resolve redirect origin on the server (proxy-safe). */
export function getSiteUrlFromRequest(request) {
  const configured = getConfiguredSiteUrl();
  const requestOrigin = new URL(request.url).origin.replace(/\/$/, "");

  if (isLocalOrigin(requestOrigin)) {
    return configured;
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost || request.headers.get("host");

  if (host && !isLocalOrigin(`https://${host.split(",")[0].trim()}`)) {
    const proto =
      request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
      (requestOrigin.startsWith("https") ? "https" : "http");
    return `${proto}://${host.split(",")[0].trim()}`.replace(/\/$/, "");
  }

  return requestOrigin || configured;
}

export function buildAuthCallbackUrl(nextPath = "/dashboard") {
  const safeNext =
    nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : "/dashboard";

  return `${getAuthRedirectOrigin()}/auth/callback?next=${encodeURIComponent(safeNext)}`;
}

export function buildAbsoluteUrl(path, request) {
  const origin = request ? getSiteUrlFromRequest(request) : getAuthRedirectOrigin();
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return new URL(safePath, origin);
}
