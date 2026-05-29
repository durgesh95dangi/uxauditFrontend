// scroll.js - performs controlled auto-scroll to trigger lazy loaded content before capture

import { AUDIT_FAST_CAPTURE } from "../config.js";

const INFINITE_SCROLL_LIMIT = 15000;

export async function triggerFullScroll(page, options = {}) {
  const fast = options.fast ?? AUDIT_FAST_CAPTURE;
  const stepPx = fast ? 400 : 300;
  const stepDelayMs = fast ? 40 : 80;
  const midPauseMs = fast ? 800 : 1500;
  const smoothPauseMs = fast ? 1000 : 2000;
  const topPauseMs = fast ? 500 : 1000;

  const scrollResult = await page.evaluate(
    async ({ maxHeight, stepPx, stepDelayMs, midPauseMs, smoothPauseMs, topPauseMs }) => {
      function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }

      let hasInfiniteScroll = false;
      let lastHeight = document.documentElement.scrollHeight;
      let position = 0;

      while (position < document.documentElement.scrollHeight) {
        position += stepPx;
        window.scrollTo(0, position);
        await sleep(stepDelayMs);

        const currentHeight = document.documentElement.scrollHeight;
        if (currentHeight > maxHeight) {
          hasInfiniteScroll = true;
          break;
        }
        lastHeight = currentHeight;
      }

      await sleep(midPauseMs);

      const fullHeight = document.documentElement.scrollHeight;
      window.scrollTo({ top: fullHeight, behavior: "smooth" });
      await sleep(smoothPauseMs);

      window.scrollTo(0, 0);
      await sleep(topPauseMs);

      return {
        pageHeight: document.documentElement.scrollHeight,
        pageWidth: document.documentElement.scrollWidth,
        hasInfiniteScroll,
        lastObservedHeight: lastHeight
      };
    },
    {
      maxHeight: INFINITE_SCROLL_LIMIT,
      stepPx,
      stepDelayMs,
      midPauseMs,
      smoothPauseMs,
      topPauseMs
    }
  );

  return {
    pageHeight: scrollResult.pageHeight,
    pageWidth: scrollResult.pageWidth,
    hasInfiniteScroll: scrollResult.hasInfiniteScroll
  };
}
