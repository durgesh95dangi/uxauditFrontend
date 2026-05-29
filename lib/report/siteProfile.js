// siteProfile.js - human-readable site category + one-line description for PDF cover

import { detectSiteTypeFromUrl } from "../engine/analysis/siteTypeHeuristic.js";

const CATEGORY_LABELS = {
  saas: "SaaS / Software Platform",
  ecommerce: "E-commerce / Online Store",
  "landing-page": "Marketing Landing Page",
  blog: "Blog / Content Publisher",
  portfolio: "Portfolio / Creative Agency",
  unknown: "Business Website"
};

const CATEGORY_DESCRIPTIONS = {
  saas:
    "Software product site evaluated for signup flow, pricing clarity, and product value communication.",
  ecommerce:
    "Online store assessed for product discovery, trust signals, navigation, and checkout experience.",
  "landing-page":
    "Marketing landing page reviewed for message clarity, CTA visibility, and conversion path.",
  blog:
    "Content-focused website analyzed for readability, navigation, and reader engagement.",
  portfolio:
    "Showcase website reviewed for visual presentation, work samples, and contact pathways.",
  unknown:
    "Business website audited for usability, clarity, trust, and conversion-focused user experience."
};

function hostnameFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function formatSiteCategory(siteType) {
  return CATEGORY_LABELS[siteType] || CATEGORY_LABELS.unknown;
}

export function buildSiteDescription(url, siteType) {
  const key = CATEGORY_LABELS[siteType] ? siteType : "unknown";
  const base = CATEGORY_DESCRIPTIONS[key];
  const host = hostnameFromUrl(url);

  if (host && key === "unknown") {
    return `${host} — business website audited for usability, clarity, trust, and conversion-focused UX.`;
  }

  return base;
}

/**
 * @param {object} job
 * @returns {{ siteType: string, category: string, description: string }}
 */
export function resolveSiteProfile(job) {
  const url = job?.url || "";
  const storedType = job?.audit_metadata?.site_type;
  const siteType =
    storedType && storedType !== "unknown"
      ? storedType
      : detectSiteTypeFromUrl(url);

  return {
    siteType,
    category: formatSiteCategory(siteType),
    description: buildSiteDescription(url, siteType)
  };
}
