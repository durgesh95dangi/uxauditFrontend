/**
 * Installs Playwright Chromium after npm install (production Linux hosts).
 * Skip locally with SKIP_PLAYWRIGHT_INSTALL=1 or on Vercel (no Playwright support).
 */

import { execSync } from "node:child_process";

if (process.env.SKIP_PLAYWRIGHT_INSTALL === "1") {
  console.log("[playwright] SKIP_PLAYWRIGHT_INSTALL=1 — skipping browser download");
  process.exit(0);
}

if (process.env.VERCEL === "1") {
  console.warn(
    "[playwright] Vercel serverless cannot run Playwright audits. Use a Node VM/Docker host instead."
  );
  process.exit(0);
}

if (process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD === "1") {
  console.log(
    "[playwright] PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 — using preinstalled browsers (Docker image)"
  );
  process.exit(0);
}

const withDeps =
  process.env.PLAYWRIGHT_INSTALL_DEPS === "1" ||
  process.env.CI === "true" ||
  process.platform === "linux";

const cmd = withDeps
  ? "npx playwright install --with-deps chromium"
  : "npx playwright install chromium";

console.log(`[playwright] ${cmd}`);
execSync(cmd, { stdio: "inherit" });
