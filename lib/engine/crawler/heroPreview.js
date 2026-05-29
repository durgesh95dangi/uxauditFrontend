// heroPreview.js - fast above-the-fold hero crop for the progress UI

import { VIEWPORTS } from "../config.js";
import { setupBrowser } from "./setup.js";
import { captureHeroPreviewClip } from "./capture.js";
import { preparePageForCapture } from "./pagePrep.js";
import { waitForPageStable } from "./pageReady.js";
import { uploadScreenshot } from "../storage/r2.js";
import { getScreenshots, saveScreenshot } from "../storage/db.js";

const HERO_PREVIEW_FILENAME = "desktop_hero_preview.png";

export async function captureHeroPreview(jobId, url) {
  const desktop = VIEWPORTS.find((v) => v.name === "desktop") || VIEWPORTS[0];
  if (!desktop) return null;

  const existing = await getScreenshots(jobId, {
    viewport: "desktop",
    type: "section",
    label: "hero",
    failed: false
  });
  const previewExisting = existing.find((s) =>
    (s.r2_key || "").includes("hero_preview")
  );
  if (previewExisting?.public_url) {
    return previewExisting.public_url;
  }

  let browser;
  try {
    const setup = await setupBrowser(url, desktop);
    browser = setup.browser;
    const { page } = setup;

    await preparePageForCapture(page, {
      phase: "pre-capture",
      fast: true,
      passes: 1
    });

    await waitForPageStable(page, { timeout: 5000, skipImages: true });

    const captured = await captureHeroPreviewClip(
      page,
      desktop.width,
      desktop.height
    );

    if (!captured?.buffer) {
      console.warn("[heroPreview] Viewport hero clip failed");
      return null;
    }

    const { r2Key, publicUrl } = await uploadScreenshot(
      captured.buffer,
      jobId,
      HERO_PREVIEW_FILENAME
    );

    await saveScreenshot(jobId, {
      type: "section",
      viewport: "desktop",
      label: "Hero",
      selector: null,
      r2Key,
      publicUrl,
      yStart: 0,
      yEnd: captured.clip.height,
      clip: captured.clip,
      confidence: "high",
      failed: false
    });

    console.log(`[heroPreview] Saved viewport hero preview for ${jobId}`);
    return publicUrl;
  } catch (error) {
    console.warn("[heroPreview] Failed:", error?.message || error);
    return null;
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}
