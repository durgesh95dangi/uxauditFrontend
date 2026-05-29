// pagePrep.js - layered navigation, slow-load tolerance, and blocker clearing

import {
  AUDIT_FAST_CAPTURE,
  AUDIT_LOAD_TIMEOUT_MS,
  AUDIT_NETWORK_IDLE_MS,
  AUDIT_SETTLE_MS,
  AUDIT_NAV_TIMEOUT_MS,
  AUDIT_NAV_RETRIES
} from "../config.js";
import { waitForPageStable } from "./pageReady.js";
import { clearPageBlockers } from "./blockers.js";
import { ensureDomReady, waitForNavigationSettle } from "./pageStable.js";

const NOISY_HOSTS = [
  "google-analytics.com",
  "googletagmanager.com",
  "doubleclick.net",
  "facebook.net",
  "facebook.com/tr",
  "connect.facebook.net",
  "hotjar.com",
  "clarity.ms",
  "intercom.io",
  "intercomcdn.com",
  "segment.io",
  "segment.com",
  "mixpanel.com",
  "fullstory.com",
  "amplitude.com",
  "snowplowanalytics.com",
  "stats.g.doubleclick.net",
  "googleadservices.com",
  "linkedin.com/li/track",
  "px.ads.linkedin.com",
  "bat.bing.com",
  "static.ads-twitter.com"
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function navigateWithRetry(page, url) {
  let lastError = null;
  let response = null;

  for (let attempt = 1; attempt <= AUDIT_NAV_RETRIES; attempt += 1) {
    try {
      response = await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: AUDIT_NAV_TIMEOUT_MS
      });
      lastError = null;
      break;
    } catch (error) {
      lastError = error;
      if (attempt < AUDIT_NAV_RETRIES) {
        await sleep(1500 * attempt);
      }
    }
  }

  if (lastError) {
    throw lastError;
  }

  return {
    status: response?.status?.() ?? null,
    finalUrl: page.url()
  };
}

export async function installRequestFilters(context) {
  await context.route("**/*", (route) => {
    const req = route.request();

    if (req.resourceType() === "media") {
      return route.abort();
    }

    const reqUrl = req.url();
    if (NOISY_HOSTS.some((host) => reqUrl.includes(host))) {
      return route.abort();
    }

    return route.continue();
  });
}

export async function waitForInitialLoad(page) {
  await page
    .waitForLoadState("load", { timeout: AUDIT_LOAD_TIMEOUT_MS })
    .catch(() => {});

  if (!AUDIT_FAST_CAPTURE) {
    await page
      .waitForLoadState("networkidle", { timeout: AUDIT_NETWORK_IDLE_MS })
      .catch(() => {});
  }

  await sleep(AUDIT_SETTLE_MS);
  await ensureDomReady(page);
  await waitForPageStable(page);
}

export async function preparePageForCapture(page, options = {}) {
  const phase = options.phase || "initial";
  const fast = options.fast ?? AUDIT_FAST_CAPTURE;
  const passes =
    options.passes ??
    (phase === "post-scroll" || phase === "pre-capture"
      ? fast
        ? 1
        : 2
      : fast
        ? 2
        : 3);

  await ensureDomReady(page);

  const blockerSummary = await clearPageBlockers(page, {
    cookieStrategy: options.cookieStrategy,
    passes
  });

  if (phase !== "post-scroll") {
    await waitForNavigationSettle(page);
    await waitForPageStable(page, {
      timeout: fast ? 8000 : 12000,
      skipImages: fast && phase === "pre-capture"
    });
  }

  return blockerSummary;
}

export async function bootstrapPage(context, page, url) {
  const navigation = await navigateWithRetry(page, url);
  if (navigation.status && navigation.status >= 400) {
    console.warn(
      `[pagePrep] HTTP ${navigation.status} loading ${url} (continuing audit)`
    );
  }
  await waitForInitialLoad(page);
  const blockers = await preparePageForCapture(page, { phase: "initial" });

  return {
    navigation,
    blockers
  };
}
