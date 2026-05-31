import { expect, test } from "@playwright/test";
import {
  HERO_AUDIT_DEMO_SCORE,
  HERO_AUDIT_HIDDEN_COUNT,
  HERO_AUDIT_SCAN_DURATION_MS,
  HERO_AUDIT_VISIBLE_ISSUES
} from "../lib/landing/heroAuditDemo.js";

const TEST_URL = "https://example.com";
const TEST_URL_DISPLAY = "example.com";

test.describe("Landing hero audit flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("hero-audit-phase-hero")).toBeVisible();
  });

  test("shows URL input, hint, and headline on load", async ({ page }) => {
    await expect(
      page.getByRole("heading", {
        name: "Turn website visitors into paying customers."
      })
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Website URL to audit" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Audit my site" })
    ).toBeVisible();
    await expect(
      page.getByText("Free instant report · Results in 1–2 min")
    ).toBeVisible();
  });

  test("shows validation error for empty URL", async ({ page }) => {
    await page.getByRole("button", { name: "Audit my site" }).click();

    await expect(page.locator(".hero-audit-error")).toHaveText("Please enter a valid URL");
    await expect(page.getByTestId("hero-audit-phase-hero")).toBeVisible();
    await expect(page).toHaveURL(/\/$/);
  });

  test("submits with Enter key and stays on homepage until signup", async ({
    page
  }) => {
    const urlInput = page.getByRole("textbox", { name: "Website URL to audit" });
    await urlInput.fill("example.com");
    await urlInput.press("Enter");

    await expect(page.getByTestId("hero-audit-phase-scan")).toBeVisible();
    await expect(page.getByTestId("hero-audit-phase-hero")).toHaveCount(0);
    await expect(page).toHaveURL(/\/$/);
  });

  test("runs hero → scan → results without leaving the page", async ({ page }) => {
    await page.clock.install();

    await page.getByRole("textbox", { name: "Website URL to audit" }).fill("example.com");
    await page.getByRole("button", { name: "Audit my site" }).click();

    await expect(page.getByTestId("hero-audit-phase-scan")).toBeVisible();
    await expect(page.getByRole("progressbar", { name: "Audit progress" })).toBeVisible();
    await expect(page.getByText(TEST_URL_DISPLAY)).toBeVisible();

    await page.clock.fastForward(HERO_AUDIT_SCAN_DURATION_MS + 500);

    await expect(page.getByTestId("hero-audit-phase-results")).toBeVisible();
    await expect(page.getByTestId("hero-audit-phase-scan")).toHaveCount(0);
    await expect(page.getByTestId("hero-audit-phase-hero")).toHaveCount(0);
    await expect(page).toHaveURL(/\/$/);

    await expect(
      page.getByText(`Score: ${HERO_AUDIT_DEMO_SCORE} / 100`)
    ).toBeVisible();
    await expect(page.getByText(TEST_URL_DISPLAY)).toBeVisible();

    const visibleIssues = page.locator(".hero-audit-issue:not(.hero-audit-issue--blurred)");
    await expect(visibleIssues).toHaveCount(HERO_AUDIT_VISIBLE_ISSUES.length);

    for (const issue of HERO_AUDIT_VISIBLE_ISSUES) {
      await expect(page.getByRole("heading", { name: issue.title })).toBeVisible();
    }

    await expect(page.locator(".hero-audit-issue--blurred")).toHaveCount(2);
    await expect(
      page.getByText(`${HERO_AUDIT_HIDDEN_COUNT} more issues found`)
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "See the full audit report" })).toBeVisible();
    await expect(
      page.getByText("Free forever · No credit card needed")
    ).toBeVisible();

    const signupLink = page.getByRole("link", {
      name: "Create free account to unlock"
    });
    await expect(signupLink).toHaveAttribute("href", "/signup");
  });

  test("shows expected severity mix on visible issue cards", async ({ page }) => {
    await page.clock.install();

    await page.getByRole("textbox", { name: "Website URL to audit" }).fill("example.com");
    await page.getByRole("button", { name: "Audit my site" }).click();
    await page.clock.fastForward(HERO_AUDIT_SCAN_DURATION_MS + 500);

    await expect(page.getByTestId("hero-audit-phase-results")).toBeVisible();

    const visibleIssues = page.locator(".hero-audit-issue:not(.hero-audit-issue--blurred)");
    await expect(page.locator(".hero-audit-issue--critical:not(.hero-audit-issue--blurred)")).toHaveCount(2);
    await expect(page.locator(".hero-audit-issue--moderate:not(.hero-audit-issue--blurred)")).toHaveCount(2);
    await expect(page.locator(".hero-audit-issue--low:not(.hero-audit-issue--blurred)")).toHaveCount(1);
    await expect(visibleIssues).toHaveCount(HERO_AUDIT_VISIBLE_ISSUES.length);
  });
});
