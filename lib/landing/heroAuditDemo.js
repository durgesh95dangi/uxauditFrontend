export const HERO_AUDIT_DEMO_SCORE = 41;
export const HERO_AUDIT_HIDDEN_COUNT = 24;

export const HERO_AUDIT_VISIBLE_ISSUES = [
  {
    severity: "critical",
    label: "Critical",
    title: "Primary CTA is low contrast on mobile",
    description:
      "The main action button blends into the hero background on phone screens, so visitors may miss where to tap next."
  },
  {
    severity: "critical",
    label: "Critical",
    title: "Headline value proposition is unclear above the fold",
    description:
      "First-time visitors cannot tell what you sell or why it matters within the first three seconds."
  },
  {
    severity: "moderate",
    label: "Moderate",
    title: "Navigation labels are generic and repetitive",
    description:
      "Menu items like “Solutions” and “Products” do not help users choose the right path quickly."
  },
  {
    severity: "moderate",
    label: "Moderate",
    title: "Social proof is buried below the fold",
    description:
      "Trust logos and testimonials appear too far down the page to reassure buyers before they scroll."
  },
  {
    severity: "low",
    label: "Low",
    title: "Footer legal links are hard to scan",
    description:
      "Privacy and terms links use low-contrast text, making compliance links easy to overlook."
  }
];

export const HERO_AUDIT_BLURRED_PLACEHOLDERS = [
  {
    severity: "moderate",
    label: "Moderate",
    title: "Pricing comparison table lacks visual hierarchy",
    description: "Upgrade paths are not differentiated clearly between plans."
  },
  {
    severity: "critical",
    label: "Critical",
    title: "Form fields missing inline validation feedback",
    description: "Users only discover input errors after submitting the form."
  }
];

export const HERO_AUDIT_SCAN_STEPS = [
  "Opening your page…",
  "Capturing desktop sections…",
  "Capturing mobile layout…",
  "Analyzing UX patterns…",
  "Prioritizing issues…"
];

export const HERO_AUDIT_SCAN_DURATION_MS = 9000;
