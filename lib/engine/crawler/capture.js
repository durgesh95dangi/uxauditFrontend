// capture.js - captures full page, section, and element screenshots as PNG buffers (no disk writes)

import sharp from "sharp";
import { AUDIT_SECTION_IMAGE_TIMEOUT_MS } from "../config.js";
import { waitForSectionImages } from "./pageReady.js";
import { hidePersistentOverlays } from "./blockers.js";

const CLIP_PADDING_PX = 16;
const MIN_CAPTURE_WIDTH = 100;
const MIN_CAPTURE_HEIGHT = 50;
const MAX_CLIP_HEIGHT_RATIO = 2.5;

function safeLabel(label) {
  return String(label || "section")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_");
}

async function isMostlyBlankBuffer(buffer) {
  if (!buffer?.length) return true;

  try {
    const stats = await sharp(buffer).stats();
    const avgStdev =
      stats.channels.reduce((sum, channel) => sum + channel.stdev, 0) /
      stats.channels.length;
    return avgStdev < 4;
  } catch {
    return false;
  }
}

async function measureDocumentBox(page, elementHandle) {
  return elementHandle.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return null;

    return {
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY,
      width: rect.width,
      height: rect.height
    };
  });
}

async function scrollElementToCenter(page, elementHandle) {
  await elementHandle.evaluate((el) => {
    el.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" });
  });
  await page.waitForTimeout(350);

  await page.evaluate(() => document.fonts?.ready).catch(() => {});
}

async function resolveSectionElement(page, section) {
  if (!section.selector) return null;

  const handles = await page.$$(section.selector);
  if (handles.length === 0) return null;
  if (handles.length === 1) return handles[0];

  let best = null;
  let bestDistance = Infinity;
  const targetY = section.y ?? 0;

  for (const handle of handles) {
    const box = await measureDocumentBox(page, handle);
    if (!box) continue;

    const distance = Math.abs(box.y - targetY);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = handle;
    }
  }

  return best;
}

function buildClipFromBox(box, pageWidth, pageHeight) {
  const pad = CLIP_PADDING_PX;
  let x = Math.max(0, box.x - pad);
  let y = Math.max(0, box.y - pad);
  let width = Math.min(box.width + pad * 2, pageWidth - x);
  let height = box.height + pad * 2;

  const maxHeight = Math.max(
    MIN_CAPTURE_HEIGHT,
    Math.floor(pageHeight * MAX_CLIP_HEIGHT_RATIO)
  );
  if (height > maxHeight) {
    const trim = height - maxHeight;
    y += trim / 2;
    height = maxHeight;
  }

  height = Math.min(height, pageHeight - y);

  if (width < MIN_CAPTURE_WIDTH || height < MIN_CAPTURE_HEIGHT) {
    return null;
  }

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(width),
    height: Math.round(height)
  };
}

async function captureViaElementScreenshot(page, elementHandle) {
  await scrollElementToCenter(page, elementHandle);

  const box = await measureDocumentBox(page, elementHandle);
  if (!box) return null;

  await waitForSectionImages(
    page,
    box.y,
    box.height,
    AUDIT_SECTION_IMAGE_TIMEOUT_MS
  );

  const buffer = await elementHandle.screenshot({
    type: "png",
    animations: "disabled"
  });

  if (await isMostlyBlankBuffer(buffer)) {
    return null;
  }

  return { buffer, clip: box };
}

async function captureViaCenteredClip(page, box, pageWidth, pageHeight) {
  const centerY = box.y + box.height / 2;
  await page.evaluate((targetCenterY) => {
    const viewportHeight = window.innerHeight;
    window.scrollTo(0, Math.max(0, targetCenterY - viewportHeight / 2));
  }, centerY);
  await page.waitForTimeout(350);

  const freshBox = await page.evaluate(
    ({ expectedX, expectedY, expectedW, expectedH }) => {
      const pad = 16;
      return {
        x: Math.max(0, expectedX - pad),
        y: Math.max(0, expectedY - pad),
        width: expectedW + pad * 2,
        height: expectedH + pad * 2
      };
    },
    {
      expectedX: box.x,
      expectedY: box.y,
      expectedW: box.width,
      expectedH: box.height
    }
  );

  const clip = buildClipFromBox(freshBox, pageWidth, pageHeight);
  if (!clip) return null;

  await waitForSectionImages(
    page,
    clip.y,
    clip.height,
    AUDIT_SECTION_IMAGE_TIMEOUT_MS
  );

  const buffer = await page.screenshot({
    clip,
    type: "png",
    animations: "disabled"
  });

  if (await isMostlyBlankBuffer(buffer)) {
    return null;
  }

  return { buffer, clip };
}

async function captureSectionFrame(page, section, pageWidth, pageHeight) {
  const elementHandle = await resolveSectionElement(page, section);

  if (elementHandle) {
    try {
      const viaElement = await captureViaElementScreenshot(page, elementHandle);
      if (viaElement) return viaElement;
    } catch {
      // Fall through to clip capture.
    }

    try {
      await scrollElementToCenter(page, elementHandle);
      const box = await measureDocumentBox(page, elementHandle);
      if (box) {
        const viaClip = await captureViaCenteredClip(
          page,
          box,
          pageWidth,
          pageHeight
        );
        if (viaClip) return viaClip;
      }
    } catch {
      // Fall through to stale-coords clip.
    }
  }

  const fallbackBox = {
    x: Math.max(0, section.x),
    y: Math.max(0, section.y),
    width: section.width,
    height: section.height
  };

  return captureViaCenteredClip(page, fallbackBox, pageWidth, pageHeight);
}

/** One viewport-tall clip from the top of the page — for progress UI hero preview only. */
export async function captureHeroPreviewClip(page, viewportWidth, viewportHeight) {
  await page.evaluate(() => window.scrollTo(0, 0)).catch(() => {});
  await page.waitForTimeout(250);
  await hidePersistentOverlays(page).catch(() => {});

  const dims = await page.evaluate(() => ({
    pageWidth: document.documentElement.scrollWidth,
    pageHeight: document.documentElement.scrollHeight
  }));

  const clip = {
    x: 0,
    y: 0,
    width: Math.min(viewportWidth, dims.pageWidth),
    height: Math.min(viewportHeight, dims.pageHeight)
  };

  if (clip.width < MIN_CAPTURE_WIDTH || clip.height < MIN_CAPTURE_HEIGHT) {
    return null;
  }

  const buffer = await page.screenshot({
    clip,
    type: "png",
    animations: "disabled"
  });

  if (await isMostlyBlankBuffer(buffer)) {
    return null;
  }

  return { buffer, clip };
}

export async function captureFullPage(page, viewportName) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);

  await hidePersistentOverlays(page);

  const buffer = await page.screenshot({ fullPage: true, type: "png" });

  return {
    buffer,
    filename: `${viewportName}_full.png`,
    type: "full",
    viewport: viewportName
  };
}

export async function captureSections(page, sections, viewportName, pageWidth, pageHeight) {
  const results = [];

  await hidePersistentOverlays(page).catch(() => {});

  const livePageHeight = await page
    .evaluate(async () => {
      if (document.fonts?.ready) {
        try {
          await document.fonts.ready;
        } catch (_) {}
      }
      return document.documentElement.scrollHeight;
    })
    .catch(() => pageHeight);

  const effectivePageHeight = Math.max(pageHeight, livePageHeight);

  for (const section of sections) {
    if (section.height < MIN_CAPTURE_HEIGHT) {
      continue;
    }

    let failed = false;
    let failReason = null;
    let buffer = null;
    let clip = null;

    try {
      const captured = await captureSectionFrame(
        page,
        section,
        pageWidth,
        effectivePageHeight
      );

      if (captured?.buffer) {
        buffer = captured.buffer;
        clip = captured.clip;
      } else {
        failReason = "Section capture produced empty or blank image";
      }
    } catch (error) {
      failReason = error?.message || "Screenshot failed";
    }

    if (!buffer) {
      failed = true;
    }

    const filename = `${viewportName}_${safeLabel(section.label)}_${section.index}.png`;

    results.push({
      buffer,
      filename,
      type: "section",
      viewport: viewportName,
      label: section.label,
      selector: section.selector,
      confidence: section.confidence,
      yStart: section.y,
      yEnd: section.y + section.height,
      clip: clip || {
        x: section.x,
        y: section.y,
        width: section.width,
        height: section.height
      },
      failed,
      failReason
    });
  }

  return results;
}

export async function captureElement(page, cssSelector, label, viewportName) {
  let element = null;

  try {
    element = await page.$(cssSelector);
  } catch {
    element = null;
  }

  if (!element) {
    try {
      const fallbackSelector = `[class*='${String(label || "").toLowerCase()}']`;
      element = await page.$(fallbackSelector);
    } catch {
      element = null;
    }
  }

  if (!element) return null;

  try {
    await scrollElementToCenter(page, element);
  } catch {
    // Continue even if scroll fails.
  }

  const boundingBox = await element.boundingBox();
  if (!boundingBox || boundingBox.width === 0 || boundingBox.height === 0) {
    return null;
  }

  const buffer = await element.screenshot({ type: "png", animations: "disabled" });

  return {
    buffer,
    filename: `${viewportName}_${safeLabel(label)}_element.png`,
    type: "element",
    viewport: viewportName,
    label,
    selector: cssSelector,
    boundingBox
  };
}
