// sectionTypes.js - maps section labels to audit profiles for token-efficient checklists

const HERO_PATTERN =
  /\b(hero|banner|intro|masthead|jumbotron|above.?fold|top.?fold)\b/i;
const SITE_CHROME_PATTERN =
  /\b(nav|navigation|menu|navbar)\b/i;
const HEADER_LABEL_PATTERN = /^header$/i;
const PRICING_PATTERN = /\b(pricing|price|plan|subscription|tier)\b/i;
const TESTIMONIAL_PATTERN =
  /\b(testimonial|review|social proof|customer story|case study|trust)\b/i;
const FEATURES_PATTERN =
  /\b(feature|benefit|how it works|capabilities|product tour|why us)\b/i;
const CTA_PATTERN = /\b(call to action|cta|sign.?up|get started|book demo|contact us)\b/i;
const FOOTER_PATTERN = /\b(footer|bottom|copyright)\b/i;
const NAV_PATTERN = /\b(nav|navigation|menu|navbar)\b/i;
const FORM_PATTERN = /\b(form|signup|sign-up|register|newsletter)\b/i;

/** @typedef {'hero'|'pricing'|'testimonial'|'features'|'cta'|'footer'|'nav'|'form'|'default'} SectionProfile */

/**
 * @param {string} label
 * @param {number} [index]
 * @param {number} [yStart]
 * @returns {SectionProfile}
 */
export function classifySectionProfile(label, index = 0, yStart = 0) {
  const text = String(label || "").trim();

  if (SITE_CHROME_PATTERN.test(text) || HEADER_LABEL_PATTERN.test(text)) {
    return "nav";
  }
  if (HERO_PATTERN.test(text)) return "hero";
  if (PRICING_PATTERN.test(text)) return "pricing";
  if (TESTIMONIAL_PATTERN.test(text)) return "testimonial";
  if (FEATURES_PATTERN.test(text)) return "features";
  if (CTA_PATTERN.test(text)) return "cta";
  if (FOOTER_PATTERN.test(text)) return "footer";
  if (NAV_PATTERN.test(text)) return "nav";
  if (FORM_PATTERN.test(text)) return "form";

  if (index === 0 && yStart < 500) return "hero";

  return "default";
}

/** Areas included per section profile (mobile area added separately on mobile viewport). */
export const PROFILE_AREAS = {
  hero: ["clarity", "conversion", "hierarchy", "trust", "accessibility", "copy", "performance"],
  pricing: ["conversion", "trust", "clarity", "hierarchy", "accessibility", "copy"],
  testimonial: ["trust", "hierarchy", "clarity", "accessibility", "copy"],
  features: ["clarity", "hierarchy", "performance", "accessibility", "copy"],
  cta: ["conversion", "clarity", "trust", "hierarchy", "accessibility", "copy"],
  footer: ["accessibility", "copy", "conversion"],
  nav: ["navigation", "hierarchy", "accessibility"],
  form: ["conversion", "accessibility", "copy", "trust"],
  default: ["clarity", "conversion", "hierarchy", "trust", "accessibility", "copy", "performance"]
};

/** Sonnet for high-impact sections; Haiku for the rest. */
export const PRIORITY_PROFILES = new Set(["hero", "pricing", "cta"]);

/**
 * @param {SectionProfile} profile
 * @returns {boolean}
 */
export function isPrioritySection(profile) {
  return PRIORITY_PROFILES.has(profile);
}

/**
 * Pick the desktop hero section for above-fold analysis (lowest y_start, hero-like label preferred).
 * @param {Array<{ id: string, label?: string, y_start?: number, yStart?: number }>} sections
 * @returns {string|null}
 */
export function findDesktopHeroScreenshotId(sections) {
  if (!sections?.length) return null;

  const sorted = [...sections].sort((a, b) => {
    const ya = a.y_start ?? a.yStart ?? 0;
    const yb = b.y_start ?? b.yStart ?? 0;
    return ya - yb;
  });

  const heroLike = sorted.find((s, i) => {
    const y = s.y_start ?? s.yStart ?? 0;
    const profile = classifySectionProfile(s.label, i, y);
    if (profile === "nav" || profile === "footer") return false;
    return profile === "hero" || y < 400;
  });

  return (heroLike ?? sorted[0])?.id ?? null;
}
