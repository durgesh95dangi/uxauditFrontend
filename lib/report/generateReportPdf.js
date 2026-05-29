// generateReportPdf.js - render report HTML to PDF via Playwright (matches on-screen layout)

/**
 * @param {string} html
 * @returns {Promise<Buffer>}
 */
export async function generateReportPdf(html) {
  const { chromium } = await import("playwright");

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(html, {
      waitUntil: "networkidle",
      timeout: 120_000
    });

    await page.evaluate(async () => {
      if (document.fonts?.ready) {
        try {
          await document.fonts.ready;
        } catch (_) {}
      }
      const imgs = Array.from(document.images);
      await Promise.all(
        imgs.map(
          (img) =>
            img.complete
              ? Promise.resolve()
              : new Promise((resolve) => {
                  img.addEventListener("load", resolve, { once: true });
                  img.addEventListener("error", resolve, { once: true });
                })
        )
      );
    });

    await page.emulateMedia({ media: "print" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0"
      },
      displayHeaderFooter: false
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
