// browser.js - shared Chromium launch for audits and PDF generation

import { chromium } from "playwright";

export const CHROMIUM_LAUNCH_ARGS = [
  "--disable-blink-features=AutomationControlled",
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-web-security",
  "--disable-features=IsolateOrigins,site-per-process"
];

/**
 * @param {import('playwright').LaunchOptions} [options]
 * @returns {Promise<import('playwright').Browser>}
 */
export async function launchChromium(options = {}) {
  try {
    return await chromium.launch({
      headless: true,
      args: CHROMIUM_LAUNCH_ARGS,
      executablePath:
        process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
      ...options
    });
  } catch (error) {
    const message = String(error?.message || error);
    if (
      message.includes("Executable doesn't exist") ||
      message.includes("browserType.launch")
    ) {
      throw new Error(
        "Playwright Chromium is not installed on this server. " +
          "On the host run: npx playwright install chromium " +
          "(Linux with apt: npx playwright install --with-deps chromium). " +
          "Or deploy with the included Dockerfile. " +
          `Details: ${message}`
      );
    }
    throw error;
  }
}
