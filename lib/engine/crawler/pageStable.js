// pageStable.js - wait for DOM/navigation to settle before crawler actions

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isNavigationError(error) {
  const message = String(error?.message || error || "").toLowerCase();
  return (
    message.includes("execution context was destroyed") ||
    message.includes("navigation") ||
    message.includes("target closed") ||
    message.includes("frame was detached")
  );
}

export async function ensureDomReady(page, timeoutMs = 15000) {
  await page
    .waitForFunction(
      () =>
        Boolean(document.body) &&
        (document.body.innerText?.trim().length ?? 0) > 0,
      null,
      { timeout: timeoutMs }
    )
    .catch(() => {});
}

export async function waitForNavigationSettle(page) {
  await page
    .waitForLoadState("domcontentloaded", { timeout: 15000 })
    .catch(() => {});
  await page.waitForLoadState("load", { timeout: 10000 }).catch(() => {});
  await sleep(600);
  await ensureDomReady(page, 10000);
}

export async function safePageAction(page, action, { recover = true } = {}) {
  try {
    return await action();
  } catch (error) {
    if (!recover || !isNavigationError(error)) {
      throw error;
    }
    await waitForNavigationSettle(page);
    return null;
  }
}
