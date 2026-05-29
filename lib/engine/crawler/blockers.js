// blockers.js - dismiss cookie banners, modals, and persistent overlays before capture

import { AUDIT_COOKIE_STRATEGY } from "../config.js";
import {
  ensureDomReady,
  isNavigationError,
  safePageAction,
  waitForNavigationSettle
} from "./pageStable.js";

const COOKIE_ACCEPT_SELECTORS = [
  "#onetrust-accept-btn-handler",
  "#accept-recommended-btn-handler",
  "#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll",
  "#CybotCookiebotDialogBodyButtonAccept",
  ".cc-accept-all",
  ".cc-allow",
  ".cm-btn-success",
  ".osano-cm-accept-all",
  ".qc-cmp2-summary-buttons button[mode='primary']",
  "#truste-consent-button",
  "#cookie_action_close_header_accept",
  "#cookie-accept",
  "#cookies-accept",
  '[data-testid="cookie-accept"]',
  '[data-testid="accept-cookies"]',
  'button[id*="accept-cookie"]',
  'button[class*="accept-cookie"]',
  'button[class*="cookie-accept"]',
  '[class*="cookie"] button[class*="accept"]',
  '[class*="consent"] button[class*="accept"]',
  '[class*="gdpr"] button[class*="accept"]',
  '[id*="cookie"] button[class*="accept"]',
  '[aria-label*="accept all" i]',
  '[aria-label*="accept cookies" i]',
  '[aria-label*="agree" i]'
];

const COOKIE_REJECT_SELECTORS = [
  "#onetrust-reject-all-handler",
  "#CybotCookiebotDialogBodyButtonDecline",
  ".cc-deny",
  ".cc-reject",
  ".osano-cm-denyAll",
  'button[class*="reject"]',
  'button[class*="decline"]',
  '[aria-label*="reject" i]',
  '[aria-label*="decline" i]'
];

const COOKIE_CONTAINER_SELECTORS = [
  '[id*="cookie" i]',
  '[class*="cookie" i]',
  '[class*="consent" i]',
  '[class*="gdpr" i]',
  '[class*="onetrust" i]',
  '[class*="cookiebot" i]',
  '[role="dialog"][aria-label*="cookie" i]',
  '[role="dialog"][aria-label*="consent" i]'
];

const MODAL_ROOT_SELECTORS = [
  '[role="dialog"]',
  '[aria-modal="true"]',
  '[class*="modal" i]',
  '[class*="popup" i]',
  '[class*="overlay" i][class*="open" i]',
  '[class*="lightbox" i]'
];

const MODAL_CLOSE_SELECTORS = [
  'button[aria-label*="close" i]',
  'button[title*="close" i]',
  '[class*="close" i]',
  '[data-dismiss="modal"]',
  'button[class*="dismiss" i]'
];

const NEWSLETTER_SELECTORS = [
  '[class*="newsletter" i]',
  '[class*="subscribe" i]',
  '[class*="email-popup" i]',
  '[class*="lead-capture" i]'
];

const PAYWALL_SELECTORS = [
  '[class*="paywall" i]',
  '[class*="login-wall" i]',
  '[class*="subscription-wall" i]'
];

const OVERLAY_HIDE_SELECTORS = [
  '[class*="cookie" i]',
  '[class*="consent" i]',
  '[class*="gdpr" i]',
  '[class*="onetrust" i]',
  '[class*="chat-widget" i]',
  '[class*="intercom" i]',
  '[class*="crisp" i]',
  '[id*="launcher" i]',
  '[class*="drift" i]',
  '[class*="hubspot" i][class*="widget" i]',
  '[class*="tidio" i]',
  '[class*="zendesk" i]'
];

// Longer phrases only — avoid global "ok" / "continue" which click random CTAs.
const ACCEPT_TEXT = [
  "accept all",
  "accept cookies",
  "allow all",
  "allow cookies",
  "agree and continue",
  "got it",
  "i understand",
  "i agree"
];

const ACCEPT_TEXT_IN_BANNER = [...ACCEPT_TEXT, "agree", "ok", "continue"];

const REJECT_TEXT = [
  "reject all",
  "decline all",
  "decline",
  "reject",
  "only necessary",
  "essential only",
  "deny"
];

const DISMISS_TEXT = ["no thanks", "not now", "maybe later", "skip", "close"];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function afterInteraction(page) {
  await waitForNavigationSettle(page);
}

async function isVisibleHandle(handle) {
  if (!handle) return false;
  return handle.isVisible().catch(() => false);
}

async function clickFirstVisible(page, selectors, timeout = 1500) {
  for (const selector of selectors) {
    try {
      const handle = await page.$(selector);
      if (!(await isVisibleHandle(handle))) continue;
      await handle.click({ timeout });
      await afterInteraction(page);
      return selector;
    } catch (error) {
      if (isNavigationError(error)) {
        await waitForNavigationSettle(page);
        continue;
      }
    }
  }
  return null;
}

async function clickButtonByText(page, texts, containerSelector = null) {
  const clicked = await safePageAction(page, () =>
    page.evaluate(
      ({ textList, containerSel }) => {
        const normalize = (value) =>
          String(value || "")
            .replace(/\s+/g, " ")
            .trim()
            .toLowerCase();

        const roots = containerSel
          ? Array.from(document.querySelectorAll(containerSel)).filter(Boolean)
          : document.body
            ? [document.body]
            : [];

        if (roots.length === 0) return null;

        const candidates = [];
        for (const root of roots) {
          if (!root?.querySelectorAll) continue;
          candidates.push(
            ...root.querySelectorAll(
              "button, [role='button'], input[type='button'], input[type='submit'], a"
            )
          );
        }

        for (const text of textList) {
          const target = normalize(text);
          const shortWord = target.length <= 3;

          for (const el of candidates) {
            const label = normalize(
              el.textContent || el.getAttribute("aria-label")
            );
            if (!label) continue;

            const matches = shortWord
              ? label === target
              : label === target || label.includes(target);

            if (!matches) continue;

            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);
            if (
              rect.width > 0 &&
              rect.height > 0 &&
              style.display !== "none" &&
              style.visibility !== "hidden"
            ) {
              el.click();
              return text;
            }
          }
        }
        return null;
      },
      { textList: texts, containerSel: containerSelector }
    )
  );

  if (clicked) {
    await afterInteraction(page);
  }

  return clicked;
}

export async function dismissCookieConsent(page, strategy = AUDIT_COOKIE_STRATEGY) {
  await ensureDomReady(page);

  const selectors =
    strategy === "reject" ? COOKIE_REJECT_SELECTORS : COOKIE_ACCEPT_SELECTORS;
  const texts = strategy === "reject" ? REJECT_TEXT : ACCEPT_TEXT;

  let method = await clickFirstVisible(page, selectors);
  if (method) {
    return { handled: true, method: `selector:${method}`, strategy };
  }

  for (const container of COOKIE_CONTAINER_SELECTORS) {
    method = await clickButtonByText(
      page,
      strategy === "reject" ? REJECT_TEXT : ACCEPT_TEXT_IN_BANNER,
      container
    );
    if (method) {
      return { handled: true, method: `text:${method}`, strategy };
    }
  }

  method = await clickButtonByText(page, texts);
  if (method) {
    return { handled: true, method: `text:${method}`, strategy };
  }

  return { handled: false, method: null, strategy };
}

export async function dismissModalsAndPopups(page) {
  await ensureDomReady(page);
  let dismissed = 0;

  for (let pass = 0; pass < 3; pass += 1) {
    let passDismissed = 0;

    await page.keyboard.press("Escape").catch(() => {});
    await sleep(300);

    for (const rootSelector of MODAL_ROOT_SELECTORS) {
      const roots = await safePageAction(page, () => page.$$(rootSelector));
      if (!roots) continue;

      for (const root of roots) {
        if (!(await isVisibleHandle(root))) continue;

        let closed = false;
        for (const closeSelector of MODAL_CLOSE_SELECTORS) {
          try {
            const closeBtn = await root.$(closeSelector);
            if (!(await isVisibleHandle(closeBtn))) continue;
            await closeBtn.click({ timeout: 1200 });
            await afterInteraction(page);
            closed = true;
            passDismissed += 1;
            break;
          } catch (error) {
            if (isNavigationError(error)) {
              await waitForNavigationSettle(page);
            }
          }
        }

        if (!closed) {
          const noThanks = await clickButtonByText(page, DISMISS_TEXT);
          if (noThanks) passDismissed += 1;
        }
      }
    }

    for (const selector of NEWSLETTER_SELECTORS) {
      const popup = await safePageAction(page, () => page.$(selector));
      if (!(await isVisibleHandle(popup))) continue;

      const closed = await clickButtonByText(page, DISMISS_TEXT);
      if (closed) passDismissed += 1;
    }

    dismissed += passDismissed;
    if (passDismissed === 0) break;
    await sleep(500);
  }

  return dismissed;
}

export async function detectPaywall(page) {
  for (const selector of PAYWALL_SELECTORS) {
    try {
      const handle = await safePageAction(page, () => page.$(selector));
      if (await isVisibleHandle(handle)) return true;
    } catch {
      // Continue scanning.
    }
  }
  return false;
}

export async function hidePersistentOverlays(page) {
  return (
    (await safePageAction(page, () =>
      page.evaluate((selectors) => {
        if (!document.body) return 0;
        let hidden = 0;
        for (const selector of selectors) {
          document.querySelectorAll(selector).forEach((el) => {
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);
            const fixed =
              style.position === "fixed" ||
              style.position === "sticky" ||
              rect.bottom > window.innerHeight * 0.55;

            if (rect.height > 0 && (fixed || selector.includes("cookie"))) {
              el.style.setProperty("visibility", "hidden", "important");
              el.style.setProperty("pointer-events", "none", "important");
              hidden += 1;
            }
          });
        }
        return hidden;
      }, OVERLAY_HIDE_SELECTORS)
    )) ?? 0
  );
}

export async function clearPageBlockers(page, options = {}) {
  const passes = options.passes ?? 3;
  const summary = {
    cookies: null,
    modalsDismissed: 0,
    overlaysHidden: 0,
    paywall: false
  };

  for (let i = 0; i < passes; i += 1) {
    await ensureDomReady(page);

    try {
      const cookieResult = await dismissCookieConsent(
        page,
        options.cookieStrategy
      );
      if (cookieResult.handled) {
        summary.cookies = cookieResult;
      }

      summary.modalsDismissed += await dismissModalsAndPopups(page);
    } catch (error) {
      if (isNavigationError(error)) {
        await waitForNavigationSettle(page);
      } else {
        console.warn("[blockers] Pass failed:", error?.message || error);
      }
    }

    await sleep(i === 0 ? 400 : 600);
  }

  summary.overlaysHidden = await hidePersistentOverlays(page);
  summary.paywall = await detectPaywall(page);

  return summary;
}
