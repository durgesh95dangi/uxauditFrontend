// setup.js - launches Playwright browser, configures viewport, and prepares the page for capture

import { launchChromium } from "./browser.js";
import { bootstrapPage, installRequestFilters } from "./pagePrep.js";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export async function setupBrowser(url, viewportConfig) {
  const browser = await launchChromium();

  const context = await browser.newContext({
    userAgent: USER_AGENT,
    viewport: { width: viewportConfig.width, height: viewportConfig.height },
    deviceScaleFactor: 2
  });

  await installRequestFilters(context);

  const page = await context.newPage();
  const prep = await bootstrapPage(context, page, url);

  return {
    browser,
    page,
    hasWall: prep.blockers.paywall,
    prepSummary: {
      navigation: prep.navigation,
      blockers: prep.blockers
    }
  };
}
