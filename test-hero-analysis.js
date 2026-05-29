// test-hero-analysis.js
import "dotenv/config";
import { setupBrowser } from "./lib/engine/crawler/setup.js";
import { triggerFullScroll } from "./lib/engine/crawler/scroll.js";
import { detectSections } from "./lib/engine/crawler/sections.js";
import { captureSections } from "./lib/engine/crawler/capture.js";
import { analyzeSection } from "./lib/engine/analysis/claude.js";

const url = "https://stripe.com";
const viewport = { name: "desktop", width: 1440, height: 900 };

const { browser, page } = await setupBrowser(url, viewport);
await triggerFullScroll(page);

const { pageHeight, pageWidth } = await page.evaluate(() => ({
  pageHeight: document.body.scrollHeight,
  pageWidth: document.body.scrollWidth
}));

const sections = await detectSections(page);

const heroSection =
  sections.find(
    (s) =>
      s.label.toLowerCase().includes("hero") ||
      s.label.toLowerCase().includes("banner")
  ) || sections[0];

console.log("Analyzing section:", heroSection.label);

const captured = await captureSections(
  page,
  [heroSection],
  "desktop",
  pageWidth,
  pageHeight
);

await browser.close();

const heroCapture = captured[0];

if (!heroCapture.buffer) {
  console.error("Hero capture failed:", heroCapture.failReason);
  process.exit(1);
}

console.log("Screenshot captured, sending to Claude...");

const analysis = await analyzeSection(
  heroCapture.buffer,
  heroCapture.label,
  "desktop",
  "saas"
);

console.log("\n=== ANALYSIS RESULT ===\n");
console.log(JSON.stringify(analysis, null, 2));
console.log(`\nTotal issues: ${analysis.issues.length}`);
console.log(`Section score: ${analysis.sectionScore ?? "—"}/100`);
