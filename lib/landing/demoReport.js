import { DEMO_SITE } from "./demoSite.js";

export const DEMO_JOB = {
  url: DEMO_SITE.urlWithProtocol,
  completed_at: "2025-05-29T12:00:00.000Z",
  created_at: "2025-05-29T12:00:00.000Z",
  site_type: "marketing"
};

export const DEMO_SUMMARY = {
  totalIssues: 12,
  critical: 2,
  high: 4,
  medium: 6,
  low: 0,
  sectionsAnalyzed: 3
};

export const DEMO_ABOVE_FOLD = {
  score: 78,
  vp_clear: false,
  cta_visible: false,
  top_risk: "CTA low contrast on mobile"
};

export const DEMO_ISSUES = [
  {
    severity: "critical",
    title: "Your main button is hard to see",
    description:
      "The primary CTA blends into the background on mobile. Visitors may not notice where to tap next.",
    how_to_fix:
      "Make the button a brighter color so it stands out from the background.",
    section_label: "Hero",
    viewport: "mobile",
    screenshot_url: "/landing/finding-hero-cta.svg"
  },
  {
    severity: "high",
    title: "Your headline breaks onto messy lines",
    description:
      "The hero headline wraps awkwardly on tablet widths, making the offer harder to read at a glance.",
    how_to_fix:
      "Shorten the headline so it reads cleanly on smaller screens.",
    section_label: "Hero",
    viewport: "desktop",
    screenshot_url: "/landing/finding-headline.svg"
  },
  {
    severity: "medium",
    title: "No privacy link in the footer",
    description:
      "The footer is missing a privacy policy link next to your terms — a common trust signal before signup.",
    how_to_fix:
      "Add a Privacy link next to your Terms link in the footer.",
    section_label: "Footer",
    viewport: "desktop",
    screenshot_url: "/landing/finding-footer.svg"
  }
];

/** Landing hero inline audit — same issue shape and severity labels as dashboard reports */
export const HERO_AUDIT_DEMO_DURATION_MS = 12000;
export const HERO_AUDIT_HIDDEN_COUNT = 24;

export const HERO_AUDIT_DEMO_SCORE = 41;

export const HERO_AUDIT_VISIBLE_ISSUES = [
  DEMO_ISSUES[0],
  {
    severity: "critical",
    title: "Your headline does not explain what you offer",
    description:
      "First-time visitors cannot tell what you sell or why it matters within a few seconds.",
    how_to_fix:
      "Rewrite the headline so a stranger instantly understands the product and benefit.",
    section_label: "Hero",
    viewport: "desktop",
    screenshot_url: "/landing/finding-headline.svg"
  },
  DEMO_ISSUES[1],
  {
    severity: "high",
    title: "Your navigation labels are too vague",
    description:
      "Menu items like “Solutions” and “Products” do not help visitors choose the right path.",
    how_to_fix:
      "Rename navigation items to match what visitors are trying to accomplish.",
    section_label: "Navigation",
    viewport: "desktop"
  },
  {
    severity: "low",
    title: "Footer legal links are hard to scan",
    description:
      "Privacy and terms links use low-contrast text, making compliance links easy to overlook.",
    how_to_fix:
      "Increase contrast and spacing between footer legal links.",
    section_label: "Footer",
    viewport: "desktop",
    screenshot_url: "/landing/finding-footer.svg"
  }
];

export const HERO_AUDIT_DEMO_SUMMARY = {
  totalIssues: HERO_AUDIT_VISIBLE_ISSUES.length + HERO_AUDIT_HIDDEN_COUNT,
  critical: 2,
  high: 9,
  medium: 12,
  low: 6,
  sectionsAnalyzed: DEMO_SITE.sections.length
};

export const HERO_AUDIT_DEMO_ABOVE_FOLD = {
  score: HERO_AUDIT_DEMO_SCORE,
  vp_clear: false,
  cta_visible: false,
  top_risk: DEMO_ABOVE_FOLD.top_risk
};

export const HERO_AUDIT_BLURRED_PLACEHOLDERS = [
  {
    severity: "high",
    title: "Your pricing table lacks a clear recommended plan",
    description:
      "Upgrade paths are not differentiated clearly between plans.",
    how_to_fix:
      "Highlight the recommended plan with stronger visual emphasis.",
    section_label: "Pricing",
    viewport: "desktop"
  },
  {
    severity: "critical",
    title: "Your signup form hides validation errors",
    description:
      "Users only discover input errors after submitting the form.",
    how_to_fix:
      "Show inline error messages as soon as a field fails validation.",
    section_label: "Signup",
    viewport: "mobile"
  }
];

export function buildHeroAuditDemoJob(url) {
  const now = new Date().toISOString();
  return {
    ...DEMO_JOB,
    url,
    completed_at: now,
    created_at: now
  };
}

/** Shared screenshot de-dupe used by landing report previews and hero audit results */
export function mapIssuesForPreview(issues) {
  const shownScreens = new Set();

  return (issues || []).map((issue, index) => {
    const screenKey = `${issue.section_label}-${issue.viewport || "desktop"}`;
    const showScreenshot = issue.screenshot_url && !shownScreens.has(screenKey);
    if (showScreenshot) shownScreens.add(screenKey);

    return {
      issue,
      index,
      screenshotUrl: showScreenshot ? issue.screenshot_url : null,
      key: `${issue.title}-${index}`
    };
  });
}
