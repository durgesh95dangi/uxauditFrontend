// pageReady.js - wait until client-rendered pages have meaningful, stable content

import {
  AUDIT_CONTENT_TIMEOUT_MS,
  AUDIT_FAST_CAPTURE,
  AUDIT_IMAGE_TIMEOUT_MS,
  AUDIT_SETTLE_MS
} from "../config.js";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForImagesInViewport(page, timeoutMs) {
  await page
    .evaluate(async (maxWait) => {
      const deadline = Date.now() + maxWait;
      const pending = () => {
        const viewportBottom = window.innerHeight * 2.5;
        return Array.from(document.images).filter((img) => {
          if (img.complete) return false;
          const rect = img.getBoundingClientRect();
          return rect.bottom > 0 && rect.top < viewportBottom;
        });
      };

      while (Date.now() < deadline) {
        const imgs = pending();
        if (imgs.length === 0) return;

        await Promise.race([
          Promise.all(
            imgs.map(
              (img) =>
                new Promise((resolve) => {
                  img.addEventListener("load", resolve, { once: true });
                  img.addEventListener("error", resolve, { once: true });
                })
            )
          ),
          new Promise((resolve) => setTimeout(resolve, 800))
        ]);
      }
    }, timeoutMs)
    .catch(() => {});
}

async function waitForLoadersToClear(page, timeoutMs) {
  await page
    .waitForFunction(
      (maxWait) => {
        const start = window.__uxauditxLoaderCheckStart || Date.now();
        window.__uxauditxLoaderCheckStart = start;
        if (Date.now() - start > maxWait) return true;

        const loaderSelectors = [
          "[class*='loading' i]",
          "[class*='spinner' i]",
          "[class*='skeleton' i]",
          "[aria-busy='true']",
          "[role='progressbar']"
        ];

        for (const selector of loaderSelectors) {
          const nodes = document.querySelectorAll(selector);
          for (const node of nodes) {
            const rect = node.getBoundingClientRect();
            const style = window.getComputedStyle(node);
            if (
              rect.width > 40 &&
              rect.height > 20 &&
              rect.top < window.innerHeight &&
              style.display !== "none" &&
              style.visibility !== "hidden" &&
              style.opacity !== "0"
            ) {
              return false;
            }
          }
        }
        return true;
      },
      timeoutMs,
      { timeout: timeoutMs + 500 }
    )
    .catch(() => {});
}

export async function waitForRenderableContent(page, options = {}) {
  const timeout = options.timeout ?? AUDIT_CONTENT_TIMEOUT_MS;
  const minSections = options.minSections ?? 1;

  await page
    .waitForFunction(
      (minCount) => {
        const sections = document.querySelectorAll(
          "section, main, [role='main'], header, footer"
        );
        const textLen = document.body?.innerText?.trim().length ?? 0;
        return sections.length >= minCount || textLen > 300;
      },
      minSections,
      { timeout }
    )
    .catch(() => {});

  await page.evaluate(() => document.fonts?.ready).catch(() => {});
  await sleep(Math.min(AUDIT_SETTLE_MS, 800));
}

export async function waitForPageStable(page, options = {}) {
  const fast = options.fast ?? AUDIT_FAST_CAPTURE;
  const contentTimeout = options.timeout ?? AUDIT_CONTENT_TIMEOUT_MS;
  const skipImages = options.skipImages === true;
  const imageTimeout = skipImages
    ? 0
    : (options.imageTimeout ?? AUDIT_IMAGE_TIMEOUT_MS);

  await waitForRenderableContent(page, { timeout: contentTimeout });
  await waitForLoadersToClear(
    page,
    Math.min(contentTimeout, fast ? 6000 : 10000)
  );

  if (imageTimeout > 0) {
    await waitForImagesInViewport(page, imageTimeout);
  }

  await sleep(fast && skipImages ? 200 : fast ? 300 : 400);
}

/** Wait for images inside a section clip band before screenshot. */
export async function waitForSectionImages(page, y, height, timeoutMs) {
  await page
    .evaluate(
      async ({ clipY, clipH, maxWait }) => {
        const deadline = Date.now() + maxWait;

        const inBand = (rect) =>
          rect.bottom > clipY - 40 && rect.top < clipY + clipH + 40;

        while (Date.now() < deadline) {
          const pending = Array.from(document.images).filter((img) => {
            if (img.complete) return false;
            return inBand(img.getBoundingClientRect());
          });

          if (pending.length === 0) return;

          await Promise.race([
            Promise.all(
              pending.map(
                (img) =>
                  new Promise((resolve) => {
                    img.addEventListener("load", resolve, { once: true });
                    img.addEventListener("error", resolve, { once: true });
                  })
              )
            ),
            new Promise((resolve) => setTimeout(resolve, 400))
          ]);
        }
      },
      { clipY: y, clipH: height, maxWait: timeoutMs }
    )
    .catch(() => {});
}
