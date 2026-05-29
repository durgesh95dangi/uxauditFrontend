import { DEMO_ISSUES, DEMO_SUMMARY } from "./demoReport.js";

const PRIORITY_BY_SEVERITY = {
  critical: 93,
  high: 88,
  medium: 84,
  low: 76
};

const SECTION_ICON = {
  Hero: { label: "He", tone: "indigo" },
  Navigation: { label: "Na", tone: "blue" },
  Features: { label: "Fe", tone: "violet" },
  Pricing: { label: "Pr", tone: "amber" },
  Footer: { label: "Fo", tone: "slate" },
  Contact: { label: "Co", tone: "rose" }
};

const EXTRA_ISSUES = [
  {
    severity: "high",
    title: "CTA buried below the fold",
    description:
      "The main signup button only appears after scrolling on mobile.",
    section_label: "Hero",
    viewport: "mobile"
  },
  {
    severity: "medium",
    title: "Low contrast body text",
    description:
      "Gray paragraph text fails contrast on the features section background.",
    section_label: "Features",
    viewport: "desktop"
  },
  {
    severity: "medium",
    title: "Pricing table hard to scan",
    description:
      "Plan differences are not obvious at a glance for first-time visitors.",
    section_label: "Pricing",
    viewport: "desktop"
  },
  {
    severity: "high",
    title: "Navigation hides on scroll",
    description:
      "Key links disappear when users scroll, making it harder to convert.",
    section_label: "Navigation",
    viewport: "mobile"
  },
  {
    severity: "low",
    title: "Form labels unclear",
    description:
      "Placeholder-only fields make it unclear what information is required.",
    section_label: "Contact",
    viewport: "desktop"
  }
];

function toFeedCard(issue) {
  const icon = SECTION_ICON[issue.section_label] || {
    label: issue.section_label.slice(0, 2),
    tone: "slate"
  };

  return {
    id: `${issue.section_label}-${issue.title}`,
    title: issue.title,
    snippet: issue.description,
    score: PRIORITY_BY_SEVERITY[issue.severity] ?? 80,
    tone: issue.severity,
    iconLabel: icon.label,
    iconTone: icon.tone
  };
}

export const HERO_FEED_ISSUES = [...DEMO_ISSUES, ...EXTRA_ISSUES].map(toFeedCard);

export const HERO_FEED_ISSUE_COUNT = DEMO_SUMMARY.totalIssues;
