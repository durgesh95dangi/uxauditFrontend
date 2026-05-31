import { expect, test } from "@playwright/test";
import {
  HERO_AUDIT_DEMO_DURATION_MS,
  HERO_AUDIT_DEMO_SCORE,
  HERO_AUDIT_HIDDEN_COUNT,
  HERO_AUDIT_VISIBLE_ISSUES
} from "../lib/landing/demoReport.js";

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
    await expect(page.locator(".hero-audit-hints-row")).toContainText("Free instant report");
    await expect(page.locator(".hero-audit-hints-row")).toContainText("Results in 1–2 min");
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

    const scanPhase = page.getByTestId("hero-audit-phase-scan");
    await expect(scanPhase).toBeVisible();
    await expect(page.locator(".nav-bar--disabled")).toBeVisible();
    await expect(scanPhase.getByText("Your audit is underway")).toBeVisible();
    await expect(page.locator("#how-it-works")).toHaveCount(0);
    await expect(page.getByTestId("hero-audit-phase-hero")).toHaveCount(0);
    await expect(page).toHaveURL(/\/$/);
  });

  test("runs hero → scan → results without leaving the page", async ({ page }) => {
    await page.clock.install();

    await page.getByRole("textbox", { name: "Website URL to audit" }).fill("example.com");
    await page.getByRole("button", { name: "Audit my site" }).click();

    const scanPhase = page.getByTestId("hero-audit-phase-scan");
    await expect(scanPhase).toBeVisible();
    await expect(page.locator(".nav-bar--disabled")).toBeVisible();
    await expect(scanPhase.getByText("Your audit is underway")).toBeVisible();
    await expect(page.locator("#how-it-works")).toHaveCount(0);
    await expect(scanPhase.locator(".progress-preview-card")).toBeVisible();
    await expect(scanPhase.locator(".progress-card--steps")).toBeVisible();

    await page.clock.fastForward(HERO_AUDIT_DEMO_DURATION_MS + 1500);

    const resultsPhase = page.getByTestId("hero-audit-phase-results");
    await expect(resultsPhase).toBeVisible();
    await expect(page.locator(".nav-bar--disabled")).toHaveCount(0);
    await expect(page.getByTestId("hero-audit-phase-scan")).toHaveCount(0);
    await expect(page.getByTestId("hero-audit-phase-hero")).toHaveCount(0);
    await expect(page).toHaveURL(/\/$/);

    await expect(resultsPhase.getByRole("heading", { name: "Website Audit" })).toBeVisible();
    await expect(resultsPhase.getByText(`First impression ${HERO_AUDIT_DEMO_SCORE}/100`)).toBeVisible();
    await expect(resultsPhase.locator(".report-cover-detail--url dd")).toHaveText(
      "https://example.com/"
    );

    const visibleIssues = resultsPhase.locator(".issue-list--minimal > .issue-row");
    await expect(visibleIssues).toHaveCount(HERO_AUDIT_VISIBLE_ISSUES.length);

    for (const issue of HERO_AUDIT_VISIBLE_ISSUES) {
      await expect(resultsPhase.getByRole("heading", { name: issue.title })).toBeVisible();
    }

    await expect(resultsPhase.locator(".hero-audit-issue-row--blurred")).toHaveCount(2);
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
    await expect(signupLink).toHaveAttribute("href", /^\/signup/);
  });

  test("shows expected severity mix on visible issue cards", async ({ page }) => {
    await page.clock.install();

    await page.getByRole("textbox", { name: "Website URL to audit" }).fill("example.com");
    await page.getByRole("button", { name: "Audit my site" }).click();
    await page.clock.fastForward(HERO_AUDIT_DEMO_DURATION_MS + 1500);

    const resultsPhase = page.getByTestId("hero-audit-phase-results");
    await expect(resultsPhase).toBeVisible();
    await expect(page.locator(".nav-bar--disabled")).toHaveCount(0);

    await expect(resultsPhase.locator(".issue-list--minimal > .issue-row .issue-row-sev--critical")).toHaveCount(2);
    await expect(resultsPhase.locator(".issue-list--minimal > .issue-row .issue-row-sev--high")).toHaveCount(2);
    await expect(resultsPhase.locator(".issue-list--minimal > .issue-row .issue-row-sev--low")).toHaveCount(1);
  });
});
