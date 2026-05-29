// prompts.js - centralizes all Claude prompts used across the audit analysis pipeline

import {
  AUDIT_ANALYSIS_MAX_ISSUES,
  AUDIT_ANALYSIS_MAX_TOKENS
} from "../config.js";
import {
  PROFILE_AREAS,
  classifySectionProfile
} from "./sectionTypes.js";

// ─── CHECKLIST BLOCKS (by area) ───────────────────────────────────────────

const CHECKLIST_BLOCKS = {
  clarity: `
AREA: clarity — MESSAGING & CLARITY
C1. Can a stranger understand WHAT this product does within 5 seconds?
C2. Can they understand WHO it is for within 5 seconds?
C3. Is the headline outcome-focused ("Save 10hrs/week") or feature-focused ("Has automation")? Outcome = better.
C4. Does the subheadline ADD new information or just repeat the headline in different words?
C5. Is copy free of buzzwords and jargon? (flag: "synergistic", "leverage", "holistic", "seamless", "robust")
C6. Does this section have one clear message or is it trying to say too many things at once?
C7. Does copy address the user's pain point or only talk about the product's features?
C8. Are numbers and proof points specific? ("10,000 users" beats "thousands of users")
C9. Is there a mismatch between what the headline promises and what the section content delivers?
C10. Is the reading level appropriate? Flag if copy is too complex or too vague for the context.`,

  conversion: `
AREA: conversion — CTA & CONVERSION
V1. Is there a primary CTA visible in this section?
V2. Is the CTA copy specific and action-driven? ("Start free trial" > "Get started" > "Submit" > "Click here")
V3. Is the CTA visually dominant — does it clearly stand out from surrounding elements?
V4. Are there too many CTAs creating decision paralysis? (Hick's Law)
V5. Is the commitment level of the ask proportional to where this section sits on the page?
V6. Is there unnecessary friction before or around the CTA? (too many form fields, required info, etc.)
V7. Does a secondary CTA compete with or distract from the primary CTA?
V8. On this viewport, is the primary CTA visible without scrolling?
V9. If urgency or scarcity is used — is it believable or does it feel manipulative?
V10. Does the CTA label clearly communicate what happens after clicking?`,

  trust: `
AREA: trust — TRUST & CREDIBILITY
T1. If testimonials are present — are they specific? (name + photo + company + measurable result = good)
T2. If logos are present — do they look real and recognizable, or generic and unverifiable?
T3. Is there a risk reducer near any CTA? ("No credit card required", "Cancel anytime", "Free for 14 days")
T4. Does the visual quality of this section — imagery, spacing, typography — signal professionalism?
T5. Are there any claims that feel unsubstantiated or too good to be true?
T6. Are there trust badges, certifications, awards, or press mentions where they would be relevant?
T7. Is anything in this section likely to accidentally reduce credibility?
T8. If this section shows team/founders — do they feel real and relatable or overly polished/stock-like?`,

  hierarchy: `
AREA: hierarchy — VISUAL HIERARCHY & SCANNABILITY
H1. Is there a clear visual reading path? Headline → subheadline → supporting content → CTA.
H2. Do size and contrast guide the eye correctly in that order?
H3. Is the primary CTA the most visually prominent interactive element in this section?
H4. Is whitespace used to reduce cognitive load, or is the section visually cluttered?
H5. Are related elements visually grouped and unrelated elements separated?
H6. Can the key message of this section be understood in under 3 seconds without reading every word?
H7. Are visual elements (icons, images, illustrations) adding meaning or just decorating?
H8. Is there one dominant visual anchor, or is attention split between multiple competing elements?`,

  mobile: `
AREA: mobile — MOBILE EXPERIENCE (mobile viewport only)
M1. Is the primary CTA visible without scrolling on this viewport?
M2. Is body text readable without pinching or zooming? (flag anything visibly below ~16px)
M3. Are tap targets large enough and spaced apart? (flag buttons shorter than 44px or too close together)
M4. Is the most important content prioritized at the top, or buried below less important content?
M5. Is there any visible horizontal overflow or content being clipped at the edges?
M6. Do multi-column desktop layouts collapse sensibly to single column on mobile?
M7. Does the section feel designed for mobile or like a shrunk desktop layout?`,

  accessibility: `
AREA: accessibility — ACCESSIBILITY (visual inference only)
A1. Does any text appear to have low contrast against its background?
A2. Is any body text visibly smaller than 16px?
A3. Do any CTA buttons appear shorter than 44px in height?
A4. Is color used as the ONLY indicator of meaning anywhere?
A5. If form fields are visible — are they labeled above the field, or relying on placeholder text alone?
A6. Are links visually distinguishable from body text by more than just color?`,

  copy: `
AREA: copy — MICROCOPY & TONE
P1. Is button/CTA copy in first person where it makes sense? ("Start my trial" beats "Start your trial")
P2. Are form placeholders helpful, or do they disappear and leave users guessing?
P3. Is there anxiety-reducing microcopy near CTAs? ("No spam", "Unsubscribe anytime", "Takes 2 minutes")
P4. Is the tone consistent throughout this section — no jarring shifts between formal and casual?
P5. Are there unnecessary filler words adding length without meaning?
P6. Does any copy feel like it was written for the company rather than for the customer?`,

  performance: `
AREA: performance — PERFORMANCE SIGNALS (visual inference)
F1. Are there large hero images or background videos visible that could hurt load time?
F2. Is there heavy use of custom fonts that may cause layout shift on load?
F3. Are there animations or parallax effects visible that could hurt performance on mobile?
F4. Are there any visible signs of layout instability — elements that look out of place?
F5. Are there blank spaces or placeholders suggesting content that loaded late or failed?`
};

function getAreasForSection(sectionLabel, viewport, sectionIndex = 0, yStart = 0) {
  const profile = classifySectionProfile(sectionLabel, sectionIndex, yStart);
  const areas = [...(PROFILE_AREAS[profile] || PROFILE_AREAS.default)];

  if (viewport === "mobile" && !areas.includes("mobile")) {
    areas.push("mobile");
  }

  return { profile, areas };
}

function buildChecklistForAreas(areas) {
  return areas
    .map((area) => CHECKLIST_BLOCKS[area])
    .filter(Boolean)
    .join("\n");
}

const ABOVE_FOLD_JSON_BLOCK = `
ALSO include an "above_fold" object (this section is the page hero — evaluate what a cold visitor sees in the first 5 seconds without scrolling):
"above_fold": {
  "score": <number 0-100>,
  "vp_clear": <true|false>,
  "vp_reason": "<one sentence>",
  "cta_visible": <true|false>,
  "cta_copy": "<exact CTA text visible, or null>",
  "top_risk": "<single most damaging conversion issue visible above the fold>"
}`;

export function buildSectionAuditText(sectionLabel, viewport, options = {}) {
  const sectionIndex = options.sectionIndex ?? 0;
  const yStart = options.yStart ?? 0;
  const includeAboveFold = options.includeAboveFold === true;
  const { profile, areas } = getAreasForSection(
    sectionLabel,
    viewport,
    sectionIndex,
    yStart
  );

  const checklist = buildChecklistForAreas(areas);

  return `
You are a senior CRO and UX specialist auditing a landing page.
You are looking at the "${sectionLabel}" section (${profile} profile), ${viewport} viewport.

Audit this section against every applicable point below.
Be specific — reference exactly what you see in the screenshot.
Skip points that are not visible or not applicable to this section.
Flag every real issue. Do not invent issues that aren't visible.

${checklist}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SCORING:
Score this section 0–100.
Start at 100. Deduct: critical=20, high=10, medium=3, low=1 per issue.
Minimum score is 0.

ISSUES:
Return at most ${AUDIT_ANALYSIS_MAX_ISSUES} issues — prioritize critical and high severity first.
Keep each text field concise (max 2 sentences): description, why, business_impact, how_to_fix.

POSITIVES:
List 1–3 things this section does genuinely well. Be specific.
If nothing stands out, return an empty array.
${includeAboveFold ? ABOVE_FOLD_JSON_BLOCK : ""}

Return ONLY this JSON. No prose, no markdown, no explanation outside the JSON:
{
  "section_score": <number 0-100>,
  "issues": [
    {
      "point_id": "<e.g. C3, V1, T5, H2, M1, A1, P4, F1>",
      "area": "<clarity|conversion|trust|hierarchy|mobile|accessibility|copy|performance>",
      "severity": "<critical|high|medium|low>",
      "title": "<5-8 word label>",
      "description": "<what the issue is and why it matters>",
      "why": "<conversion or UX impact>",
      "business_impact": "<effect on conversion, trust, or revenue>",
      "how_to_fix": "<one concrete actionable fix>",
      "effort": "<low|medium|high>"
    }
  ],
  "positives": ["<specific positive observation>"]${includeAboveFold ? ',\n  "above_fold": { "score": 0, "vp_clear": false, "vp_reason": "", "cta_visible": false, "cta_copy": null, "top_risk": "" }' : ""}
}
`;
}

export function buildSectionPrompt(sectionLabel, viewport, siteType, options = {}) {
  const system =
    "You are a senior CRO and UX specialist with 15 years experience.\n" +
    "You analyze website screenshots and find REAL, SPECIFIC issues.\n" +
    "Only report issues you can actually see in the screenshot.\n" +
    "Do not invent issues. Do not give generic advice.\n" +
    "This is a visual UX/CRO audit — do not use external search.\n\n" +
    `Return ONLY valid JSON as specified. Max ${AUDIT_ANALYSIS_MAX_ISSUES} issues. No markdown. No explanation.`;

  const siteLine =
    siteType && siteType !== "unknown"
      ? `Site type: ${siteType}\n\n`
      : "";

  const user =
    siteLine + buildSectionAuditText(sectionLabel, viewport, options);

  return { system, user, maxTokens: AUDIT_ANALYSIS_MAX_TOKENS };
}

export function buildSiteTypePrompt(url, pageTitle) {
  const system = "You detect website types from URLs and page content. Return only one word.";

  const user =
    `Given this URL and page title, what type is this website?\n` +
    `URL: ${url}\n` +
    `Title: ${pageTitle}\n\n` +
    `Return exactly one of: saas | ecommerce | landing-page | blog | portfolio | unknown`;

  return { system, user };
}

/** @deprecated Above-fold is merged into desktop hero section analysis. */
export const ABOVE_FOLD_PROMPT = "";
