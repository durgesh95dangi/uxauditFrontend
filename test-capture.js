// test-capture.js - end-to-end Playwright capture smoke test

import fs from "fs";
import { setupBrowser } from "./lib/engine/crawler/setup.js";
import { triggerFullScroll } from "./lib/engine/crawler/scroll.js";
import { detectSections } from "./lib/engine/crawler/sections.js";
import { captureFullPage, captureSections } from "./lib/engine/crawler/capture.js";

const url = "https://stripe.com";
const viewport = { name: "desktop", width: 1440, height: 900 };

const { browser, page } = await setupBrowser(url, viewport);
const { pageHeight, pageWidth } = await triggerFullScroll(page);

console.log("Page size:", pageWidth, "x", pageHeight);

const sections = await detectSections(page);
console.log("Sections detected:", sections.length);
console.table(
  sections.map((s) => ({
    index: s.index,
    label: s.label,
    confidence: s.confidence,
    y: Math.round(s.y),
    height: Math.round(s.height),
    width: Math.round(s.width)
  }))
);

const full = await captureFullPage(page, "desktop");
fs.writeFileSync("test_full.png", full.buffer);
console.log("Full page saved:", full.buffer.length, "bytes");

const captured = await captureSections(page, sections, "desktop", pageWidth, pageHeight);

console.log("Capture results:", captured.length);
console.table(
  captured.map((s) => ({
    label: s.label,
    failed: s.failed,
    bufferBytes: s.buffer ? s.buffer.length : 0,
    failReason: s.failReason,
    clipX: Math.round(s.clip.x),
    clipY: Math.round(s.clip.y),
    clipW: Math.round(s.clip.width),
    clipH: Math.round(s.clip.height)
  }))
);

captured.forEach((s) => {
  if (s.buffer) {
    const safeName = s.label.toLowerCase().replace(/[^a-z0-9]/g, "_");
    fs.writeFileSync(`test_${safeName}.png`, s.buffer);
    console.log("Saved:", s.label);
  } else {
    console.warn("Skipped (no buffer):", s.label, "-", s.failReason);
  }
});

await browser.close();
