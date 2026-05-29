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
