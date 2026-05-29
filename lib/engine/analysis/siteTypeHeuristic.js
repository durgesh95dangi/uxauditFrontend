// siteTypeHeuristic.js - instant site-type guess from URL/title (no API call)

const VALID_SITE_TYPES = new Set([
  "saas",
  "ecommerce",
  "landing-page",
  "blog",
  "portfolio",
  "unknown"
]);

/**
 * @param {string} url
 * @param {string} [pageTitle]
 * @returns {'saas'|'ecommerce'|'landing-page'|'blog'|'portfolio'|'unknown'}
 */
export function detectSiteTypeFromUrl(url, pageTitle = "") {
  let host = "";
  let path = "";

  try {
    const parsed = new URL(url);
    host = parsed.hostname.toLowerCase();
    path = `${parsed.pathname} ${parsed.search}`.toLowerCase();
  } catch {
    host = String(url || "").toLowerCase();
  }

  const title = String(pageTitle || "").toLowerCase();
  const text = `${host} ${path} ${title}`;

  if (
    /\b(shop|store|cart|checkout|product|collection|ecommerce|e-commerce|buy-now)\b/.test(
      text
    ) ||
    /\/(products|shop|collections|cart)\b/.test(path)
  ) {
    return "ecommerce";
  }

  if (
    /\b(blog|article|news|post|journal|magazine)\b/.test(text) ||
    /\/(blog|articles|news|posts)\b/.test(path)
  ) {
    return "blog";
  }

  if (
    /\b(portfolio|case-stud|our-work|projects|gallery)\b/.test(text) ||
    /\/(portfolio|work|projects)\b/.test(path)
  ) {
    return "portfolio";
  }

  if (
    /\b(saas|software|platform|dashboard|app\.|signup|sign-up|free-trial|pricing)\b/.test(
      text
    ) ||
    /\/(pricing|signup|register|demo|trial)\b/.test(path)
  ) {
    return "saas";
  }

  if (
    /\b(landing|get-started|book-demo|request-demo|waitlist|early-access)\b/.test(
      text
    )
  ) {
    return "landing-page";
  }

  return "unknown";
}

export function isKnownSiteType(siteType) {
  return VALID_SITE_TYPES.has(siteType) && siteType !== "unknown";
}
