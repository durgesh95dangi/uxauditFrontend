export const CHECKLIST_GROUPS = [
  {
    id: "hero",
    title: "Hero & Above the Fold",
    items: [
      {
        id: "hero-1",
        title: "Headline explains what you offer in five seconds",
        body: "Visitors decide fast — if they can't tell what you sell, they leave."
      },
      {
        id: "hero-2",
        title: "Main button is visible without scrolling",
        body: "Your primary action should appear on the first screen, not buried below."
      },
      {
        id: "hero-3",
        title: "Hero visual supports the message",
        body: "Images or mockups should clarify your offer, not distract from it."
      },
      {
        id: "hero-4",
        title: "Value proposition is specific, not vague",
        body: "Replace jargon like 'unlock potential' with plain words about what you do."
      },
      {
        id: "hero-5",
        title: "One clear primary action on the first screen",
        body: "Too many competing links at the top splits attention and kills conversions."
      }
    ]
  },
  {
    id: "navigation",
    title: "Navigation & Layout",
    items: [
      {
        id: "nav-1",
        title: "Main menu is easy to find and read",
        body: "Confusing navigation makes people feel lost before they see your offer."
      },
      {
        id: "nav-2",
        title: "Logo links back to the homepage",
        body: "It's a small detail visitors expect — missing it feels broken."
      },
      {
        id: "nav-3",
        title: "Page has clear visual hierarchy",
        body: "Headings, spacing, and size should guide the eye in a logical order."
      },
      {
        id: "nav-4",
        title: "Sections use descriptive headings",
        body: "Scanners should understand each block without reading every paragraph."
      },
      {
        id: "nav-5",
        title: "No broken links on key pages",
        body: "Dead links erode trust and stop people mid-journey."
      }
    ]
  },
  {
    id: "ctas",
    title: "CTAs & Conversion",
    items: [
      {
        id: "cta-1",
        title: "Primary button stands out from the background",
        body: "Low contrast CTAs are one of the most common landing page issues we see."
      },
      {
        id: "cta-2",
        title: "Button text says what happens next",
        body: "'Get started' or 'Run free audit' beats vague labels like 'Learn more.'"
      },
      {
        id: "cta-3",
        title: "One main CTA per section",
        body: "Multiple equal-weight buttons make visitors hesitate instead of act."
      },
      {
        id: "cta-4",
        title: "Form fields have clear labels",
        body: "Unclear inputs cause errors, abandonment, and frustration."
      },
      {
        id: "cta-5",
        title: "Confirmation appears after signup or purchase",
        body: "People need to know the action worked — silence feels like failure."
      }
    ]
  },
  {
    id: "mobile",
    title: "Mobile Experience",
    items: [
      {
        id: "mobile-1",
        title: "Text is readable without pinching or zooming",
        body: "Tiny font sizes are a top reason mobile visitors bounce."
      },
      {
        id: "mobile-2",
        title: "Buttons are large enough to tap with a thumb",
        body: "Cramped tap targets cause mis-clicks and abandoned forms."
      },
      {
        id: "mobile-3",
        title: "Text doesn't wrap or overlap awkwardly",
        body: "Broken line breaks make pages look unfinished and untrustworthy."
      },
      {
        id: "mobile-4",
        title: "Images scale properly on small screens",
        body: "Overflowing visuals push content off-screen and slow scrolling."
      },
      {
        id: "mobile-5",
        title: "Key actions aren't buried below long scroll",
        body: "On phones, your main CTA may need to sit higher than on desktop."
      }
    ]
  },
  {
    id: "trust",
    title: "Trust & Credibility",
    items: [
      {
        id: "trust-1",
        title: "Privacy policy link is in the footer",
        body: "Required before signup or payment — missing it raises red flags."
      },
      {
        id: "trust-2",
        title: "Contact or support info is easy to find",
        body: "Real businesses show how to reach them; hiding contact details looks shady."
      },
      {
        id: "trust-3",
        title: "Reviews or testimonials near the offer",
        body: "Social proof at decision points reduces hesitation."
      },
      {
        id: "trust-4",
        title: "Security cues near payment or signup",
        body: "Lock icons, secure checkout badges, and clear billing terms build confidence."
      },
      {
        id: "trust-5",
        title: "Refund or guarantee policy is clear",
        body: "People want to know they can reverse a bad decision before they pay."
      }
    ]
  }
];

export const TOTAL_CHECKLIST_ITEMS = CHECKLIST_GROUPS.reduce(
  (count, group) => count + group.items.length,
  0
);

export const ALL_CHECKLIST_ITEMS = CHECKLIST_GROUPS.flatMap((group) =>
  group.items.map((item) => ({
    ...item,
    group: group.title
  }))
);
