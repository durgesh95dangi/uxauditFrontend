/**
 * GA4 measurement ID — set NEXT_PUBLIC_GA_MEASUREMENT_ID in env (Railway / .env).
 * Falls back to the production property ID when unset.
 */
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-S95YG8H187";

/** Skip GA in local dev unless NEXT_PUBLIC_GA_ENABLED=true */
export function isGa4Enabled() {
  if (!GA_MEASUREMENT_ID) return false;

  if (process.env.NODE_ENV === "development") {
    return process.env.NEXT_PUBLIC_GA_ENABLED === "true";
  }

  return true;
}

function gtagReady() {
  return typeof window !== "undefined" && typeof window.gtag === "function";
}

/**
 * Set or clear the GA4 User-ID (Supabase auth UUID only — never email or other PII).
 * @param {string | null | undefined} userId
 */
export function setGa4UserId(userId) {
  if (!isGa4Enabled() || !gtagReady()) return;

  const id = typeof userId === "string" ? userId.trim() : "";
  window.gtag("config", GA_MEASUREMENT_ID, {
    user_id: id || undefined
  });
}

/**
 * Record a client-side page view (used on App Router navigations).
 * @param {string} pagePath — pathname + search, e.g. "/dashboard?upgraded=1"
 */
export function trackGa4PageView(pagePath) {
  if (!isGa4Enabled() || !gtagReady()) return;

  const path = pagePath || window.location.pathname + window.location.search;

  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.origin + path,
    page_title: document.title
  });
}

/**
 * Fire a custom GA4 event.
 * @param {string} eventName — GA4 event name (snake_case recommended)
 * @param {Record<string, string | number | boolean | undefined>} [params]
 *
 * @example
 * trackGa4Event("sign_up", { method: "email" });
 * trackGa4Event("audit_started", { plan: "starter" });
 */
export function trackGa4Event(eventName, params = {}) {
  if (!isGa4Enabled() || !gtagReady()) return;
  if (!eventName || typeof eventName !== "string") return;

  const payload = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null)
  );

  window.gtag("event", eventName, payload);
}
