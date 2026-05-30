// runner.js - orchestrates the full audit pipeline: crawl, capture, upload, analyze, store

import { getLlmConfig } from "./llm/config.js";
import { VIEWPORTS, AUDIT_COOKIE_STRATEGY, AUDIT_FAST_CAPTURE, AUDIT_PARALLEL_VIEWPORTS, AUDIT_PARALLEL_ANALYSIS, AUDIT_PIPELINE_ANALYSIS, AUDIT_SKIP_MOBILE_FULL_PAGE } from "./config.js";
import { setupBrowser } from "./crawler/setup.js";
import { triggerFullScroll } from "./crawler/scroll.js";
import { waitForPageStable } from "./crawler/pageReady.js";
import { preparePageForCapture } from "./crawler/pagePrep.js";
import { detectSections, buildFallbackSections } from "./crawler/sections.js";
import { captureFullPage, captureSections } from "./crawler/capture.js";
import { captureHeroPreview } from "./crawler/heroPreview.js";
import { analyzeSection, detectSiteType } from "./analysis/claude.js";
import { createAnalysisLimiter } from "./analysis/analysisLimiter.js";
import { createAnalysisPipeline } from "./analysis/pipeline.js";
import { detectSiteTypeFromUrl, isKnownSiteType } from "./analysis/siteTypeHeuristic.js";
import { REPORT_TIER_FULL } from "../audit/reportTier.js";
import { findDesktopHeroScreenshotId } from "./analysis/sectionTypes.js";
import { buildAuditQuality, buildViewportQuality } from "./auditQuality.js";
import { uploadScreenshot } from "./storage/r2.js";
import {
  getSectionScores,
  getScreenshots,
  heartbeat,
  saveIssues,
  saveScreenshot,
  updateJobFields,
  updateJobStatus,
  updateScreenshotAnalysis
} from "./storage/db.js";

const SECTION_SCORE_WEIGHTS = {
  hero: 3,
  pricing: 2.5,
  cta: 2,
  "call to action": 2,
  testimonial: 1.5,
  features: 1.5,
  default: 1,
  footer: 0.5
};

function computeWeightedOverallScore(sectionScores) {
  if (!sectionScores || sectionScores.length === 0) return null;

  let weightedSum = 0;
  let weightTotal = 0;

  for (const s of sectionScores) {
    const label = (s.label || "").toLowerCase();
    const weight =
      Object.entries(SECTION_SCORE_WEIGHTS).find(([k]) => label.includes(k))?.[1] ||
      SECTION_SCORE_WEIGHTS.default;
    weightedSum += s.section_score * weight;
    weightTotal += weight;
  }

  return Math.round(weightedSum / weightTotal);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withBrowser(viewport, url, fn) {
  let browser;
  try {
    const setup = await setupBrowser(url, viewport);
    browser = setup.browser;
    return await fn(setup);
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

const TALL_PAGE_HEIGHT = 2800;

function sectionsLookIncomplete(sections, pageHeight) {
  if (!sections?.length) return true;
  if (sections.length === 1 && pageHeight > TALL_PAGE_HEIGHT) return true;
  return false;
}

async function detectSectionsWithRetry(page, viewportName, pageHeight = 0) {
  const fast = AUDIT_FAST_CAPTURE;
  let sections = await detectSections(page);

  if (sections?.length > 0 && !sectionsLookIncomplete(sections, pageHeight)) {
    return sections;
  }

  console.warn(
    `[runAudit] ${sections?.length ? "Incomplete" : "No"} sections on ${viewportName} — waiting and retrying...`
  );

  await waitForPageStable(page, {
    timeout: fast ? 8000 : 10000,
    skipImages: false
  });
  await page.waitForTimeout(fast ? 1000 : 2000);
  await triggerFullScroll(page, { fast });
  await waitForPageStable(page, {
    timeout: fast ? 6000 : 8000,
    skipImages: false
  });

  sections = await detectSections(page);

  if (sections?.length > 0 && !sectionsLookIncomplete(sections, pageHeight)) {
    console.log(
      `[runAudit] Retry found ${sections.length} sections on ${viewportName}`
    );
    return sections;
  }

  console.warn(
    `[runAudit] Using full-page fallback section on ${viewportName}`
  );
  return buildFallbackSections(page);
}

async function runScrollAndDetectPipeline(page, prepSummary) {
  const fast = AUDIT_FAST_CAPTURE;

  await waitForPageStable(page, { skipImages: fast });

  let scrollMeta = await triggerFullScroll(page, { fast });
  let { pageHeight, pageWidth } = scrollMeta;

  await waitForPageStable(page, {
    timeout: fast ? 6000 : 10000,
    skipImages: fast
  });

  const postScrollBlockers = await preparePageForCapture(page, {
    phase: "post-scroll",
    fast
  });

  let sections = await detectSections(page);
  const needsSecondScroll =
    !fast || sectionsLookIncomplete(sections, pageHeight);

  if (needsSecondScroll) {
    if (fast && sections?.length > 0) {
      console.log(
        `[runAudit] Second scroll — section count looks incomplete for page height ${pageHeight}px`
      );
    }
    scrollMeta = await triggerFullScroll(page, { fast });
    ({ pageHeight, pageWidth } = scrollMeta);
    if (!sections?.length) {
      sections = await detectSections(page);
    } else if (sectionsLookIncomplete(sections, pageHeight)) {
      sections = await detectSections(page);
    }
  } else if (sections?.length > 0) {
    console.log(
      `[runAudit] Fast path: ${sections.length} section(s) after first scroll`
    );
  }

  return {
    scrollMeta,
    pageHeight,
    pageWidth,
    postScrollBlockers,
    sections
  };
}

async function processViewport(viewport, url, jobId, hooks = {}) {
  return withBrowser(viewport, url, async ({ page, prepSummary }) => {
    if (typeof hooks.onPageReady === "function") {
      await hooks.onPageReady(page, prepSummary);
    }

    const {
      scrollMeta,
      pageHeight,
      pageWidth,
      postScrollBlockers,
      sections: detectedSections
    } = await runScrollAndDetectPipeline(page, prepSummary);

    if (postScrollBlockers.paywall || prepSummary?.blockers?.paywall) {
      console.warn(`[runAudit] Paywall detected on ${viewport.name} for ${url}`);
    }

    if (postScrollBlockers.cookies?.handled || prepSummary?.blockers?.cookies?.handled) {
      console.log(
        `[runAudit] Cookie consent handled on ${viewport.name} (${postScrollBlockers.cookies?.method || prepSummary?.blockers?.cookies?.method})`
      );
    }

    const skipFullPage =
      viewport.name === "mobile" && AUDIT_SKIP_MOBILE_FULL_PAGE;
    if (!skipFullPage) {
      await captureAndStoreFullPage(page, viewport, jobId);
    } else {
      console.log("[runAudit] Skipping mobile full-page capture");
    }

    await preparePageForCapture(page, { phase: "pre-capture", passes: 1, fast: AUDIT_FAST_CAPTURE });

    let sections = detectedSections;
    if (sectionsLookIncomplete(sections, pageHeight)) {
      sections = await detectSectionsWithRetry(page, viewport.name, pageHeight);
    }

    console.log(`[runAudit] Found ${sections.length} sections on ${viewport.name}`);

    await captureAndStoreSections(
      page,
      sections,
      viewport,
      pageWidth,
      pageHeight,
      jobId,
      hooks.pipeline
    );

    return buildViewportQuality({
      viewport: viewport.name,
      prepSummary,
      postScrollBlockers,
      sectionCount: sections.length,
      scrollMeta
    });
  });
}

async function processViewportWithRetry(viewport, url, jobId, hooks = {}) {
  try {
    return await processViewport(viewport, url, jobId, hooks);
  } catch (firstError) {
    console.warn(
      `[runAudit] Viewport ${viewport.name} failed (${firstError?.message}) — retrying once...`
    );
    return await processViewport(viewport, url, jobId, hooks);
  }
}

async function captureAndStoreFullPage(page, viewport, jobId) {
  const full = await captureFullPage(page, viewport.name);
  try {
    const { r2Key, publicUrl } = await uploadScreenshot(
      full.buffer,
      jobId,
      full.filename
    );
    await saveScreenshot(jobId, {
      type: "full",
      viewport: viewport.name,
      label: "full_page",
      selector: null,
      r2Key,
      publicUrl,
      failed: false
    });

    return publicUrl;
  } catch (uploadError) {
    await saveScreenshot(jobId, {
      type: "full",
      viewport: viewport.name,
      label: "full_page",
      selector: null,
      failed: true,
      failReason: uploadError?.message || "Full page upload failed"
    });
    return null;
  }
}

async function storeOneSection(section, sectionIndex, viewport, jobId, pipeline) {
  if (!section.failed && section.buffer) {
    const uploadTask = (async () => {
      try {
        const { r2Key, publicUrl } = await uploadScreenshot(
          section.buffer,
          jobId,
          section.filename
        );
        return saveScreenshot(jobId, {
          type: "section",
          viewport: viewport.name,
          label: section.label,
          selector: section.selector,
          r2Key,
          publicUrl,
          yStart: section.yStart,
          yEnd: section.yEnd,
          clip: section.clip,
          confidence: section.confidence,
          failed: false
        });
      } catch (uploadError) {
        await saveScreenshot(jobId, {
          type: "section",
          viewport: viewport.name,
          label: section.label,
          selector: section.selector,
          yStart: section.yStart,
          yEnd: section.yEnd,
          clip: section.clip,
          confidence: section.confidence,
          failed: true,
          failReason: uploadError?.message || "Section upload failed"
        });
        return null;
      }
    })();

    if (pipeline) {
      pipeline.enqueue({
        buffer: section.buffer,
        uploadTask,
        label: section.label,
        viewport: viewport.name,
        sectionIndex,
        yStart: section.yStart ?? 0
      });
      return uploadTask;
    }

    return await uploadTask;
  }

  await saveScreenshot(jobId, {
    type: "section",
    viewport: viewport.name,
    label: section.label,
    selector: section.selector,
    yStart: section.yStart,
    yEnd: section.yEnd,
    clip: section.clip,
    confidence: section.confidence,
    failed: true,
    failReason: section.failReason || "Section capture failed"
  });
  return null;
}

async function filterDuplicateHeroSections(jobId, viewport, sections) {
  if (viewport.name !== "desktop" || !sections?.length) return sections;

  const existing = await getScreenshots(jobId, {
    viewport: "desktop",
    type: "section",
    failed: false
  });
  const hasHeroPreview = existing.some((s) => /hero/i.test(s.label || ""));
  if (!hasHeroPreview) return sections;

  return sections.filter((s) => !/hero/i.test(s.label || ""));
}

async function captureAndStoreSections(
  page,
  sections,
  viewport,
  pageWidth,
  pageHeight,
  jobId,
  pipeline = null
) {
  sections = await filterDuplicateHeroSections(jobId, viewport, sections);

  const captured = await captureSections(
    page,
    sections,
    viewport.name,
    pageWidth,
    pageHeight
  );

  await Promise.all(
    captured.map((section, sectionIndex) =>
      storeOneSection(section, sectionIndex, viewport, jobId, pipeline)
    )
  );
}

function buildAnalysisQueue(desktopSections, mobileSections) {
  const desktop = (desktopSections || []).map((s, index) => ({
    publicUrl: s.public_url,
    label: s.label,
    viewport: s.viewport,
    screenshotId: s.id,
    sectionIndex: index,
    yStart: s.y_start ?? 0
  }));

  const mobile = (mobileSections || []).map((s, index) => ({
    publicUrl: s.public_url,
    label: s.label,
    viewport: s.viewport,
    screenshotId: s.id,
    sectionIndex: index,
    yStart: s.y_start ?? 0
  }));

  return [...desktop, ...mobile];
}

async function saveAboveFoldFromAnalysis(jobId, aboveFold) {
  if (!aboveFold) return;

  await updateJobFields(jobId, {
    above_fold_score: aboveFold.score ?? null,
    above_fold_vp_clear: aboveFold.vp_clear ?? null,
    above_fold_cta_visible: aboveFold.cta_visible ?? null,
    above_fold_cta_copy: aboveFold.cta_copy ?? null,
    above_fold_top_risk: aboveFold.top_risk ?? null
  });
  console.log(`[AboveFold] Score: ${aboveFold.score ?? "—"}/100 (from hero section)`);
}

async function analyzeOneSection(item, siteType, jobId, limiter, options = {}) {
  return limiter.run(async (estimatedTokens) => {
    const imageInput = item.buffer || item.publicUrl;
    const analysis = await analyzeSection(
      imageInput,
      item.label,
      item.viewport,
      siteType,
      {
        includeAboveFold: item.screenshotId === options.desktopHeroId,
        sectionIndex: item.sectionIndex,
        yStart: item.yStart
      }
    );

    limiter.recordActualUsage(
      estimatedTokens,
      analysis.usage?.input_tokens
    );

    await updateScreenshotAnalysis(item.screenshotId, {
      sectionScore: analysis.sectionScore,
      positives: analysis.positives
    });

    return {
      issues: analysis.issues.map((issue) => ({
        ...issue,
        screenshotId: item.screenshotId,
        sectionLabel: item.label,
        viewport: item.viewport,
        screenshotUrl: item.publicUrl
      })),
      aboveFold: analysis.aboveFold,
      llmError: analysis.llmError || null
    };
  });
}

async function runAnalysisOnAllSections(
  desktopSections,
  mobileSections,
  siteType,
  jobId
) {
  const queue = buildAnalysisQueue(desktopSections, mobileSections);
  if (queue.length === 0) return { issues: [], llmErrors: [] };

  const desktopHeroId = findDesktopHeroScreenshotId(desktopSections);
  const limiter = createAnalysisLimiter();
  const total = queue.length;
  let completed = 0;

  async function runItem(item) {
    const result = await analyzeOneSection(item, siteType, jobId, limiter, {
      desktopHeroId
    });
    completed += 1;
    await heartbeat(jobId, `analyzing_${completed}_of_${total}`);
    return result;
  }

  let results;
  if (AUDIT_PARALLEL_ANALYSIS) {
    console.log(
      `[runAudit] Analyzing ${total} section(s) in parallel (concurrency-limited)`
    );
    results = await Promise.all(queue.map(runItem));
  } else {
    results = [];
    for (const item of queue) {
      results.push(await runItem(item));
    }
  }

  const allIssues = [];
  const llmErrors = [];
  for (let i = 0; i < results.length; i += 1) {
    const item = queue[i];
    const result = results[i];
    if (result.llmError) llmErrors.push(result.llmError);
    if (result.aboveFold && item.screenshotId === desktopHeroId) {
      await saveAboveFoldFromAnalysis(jobId, result.aboveFold);
    }
    allIssues.push(...result.issues);
  }

  return { issues: allIssues, llmErrors };
}

function summarizeLlmErrors(llmErrors, provider) {
  const unique = [...new Set(llmErrors.filter(Boolean))];
  if (unique.length === 0) return null;
  return `AI analysis failed (${provider}): ${unique.slice(0, 2).join(" | ")}`;
}

function shouldFailForLlmErrors(sectionCount, issueCount, llmErrors) {
  return sectionCount > 0 && issueCount === 0 && llmErrors.length > 0;
}

export async function runAudit(jobId, url, _userId, options = {}) {
  const reportTier = options.reportTier || REPORT_TIER_FULL;
  const adminRun = options.adminRun === true;

  try {
    const llm = getLlmConfig();
    console.log(
      `[runAudit] LLM ${llm.provider} (primary: ${llm.models.primary}, fast: ${llm.models.fast}) · report: ${reportTier}${adminRun ? " (admin)" : ""}`
    );

    // STEP 1 — mark running
    await updateJobStatus(jobId, "running", { current_step: "starting" });

    // STEP 2 — site type from URL heuristics (refined during desktop capture if needed)
    let siteType = detectSiteTypeFromUrl(url);
    if (isKnownSiteType(siteType)) {
      console.log(`[runAudit] Site type (URL): ${siteType}`);
    }

    const captureState = { siteType };
    const pipeline = AUDIT_PIPELINE_ANALYSIS
      ? createAnalysisPipeline(jobId, () => captureState.siteType)
      : null;

    // STEP 2b — fast hero crop for progress preview (before full viewport capture)
    await heartbeat(jobId, "capturing_hero_preview");
    try {
      await captureHeroPreview(jobId, url);
    } catch (heroErr) {
      console.warn("[runAudit] Hero preview skipped:", heroErr?.message);
    }

    // STEP 3 — capture + store all viewports (parallel when enabled)
    const viewportResults = [];

    async function captureOneViewport(viewport) {
      await heartbeat(jobId, `capturing_${viewport.name}`);
      try {
        const result = await processViewportWithRetry(viewport, url, jobId, {
          pipeline,
          onPageReady:
            viewport.name === "desktop"
              ? async (page) => {
                  if (isKnownSiteType(captureState.siteType)) return;
                  try {
                    const pageTitle = await page.title();
                    const refined = detectSiteTypeFromUrl(url, pageTitle);
                    if (isKnownSiteType(refined)) {
                      captureState.siteType = refined;
                      console.log(
                        `[runAudit] Site type (page): ${captureState.siteType}`
                      );
                      return;
                    }
                    captureState.siteType = await detectSiteType(url, pageTitle);
                    console.log(
                      `[runAudit] Site type (API): ${captureState.siteType}`
                    );
                  } catch (siteErr) {
                    console.warn(
                      "[runAudit] Site type detection failed:",
                      siteErr?.message
                    );
                  }
                }
              : undefined
        });
        return { viewport: viewport.name, ok: true, result };
      } catch (vpErr) {
        console.error(
          `[runAudit] Viewport ${viewport.name} failed:`,
          vpErr?.message || vpErr
        );
        return {
          viewport: viewport.name,
          ok: false,
          error: vpErr?.message || "Viewport capture failed"
        };
      }
    }

    if (AUDIT_PARALLEL_VIEWPORTS && VIEWPORTS.length > 1) {
      console.log("[runAudit] Capturing desktop + mobile in parallel");
      await heartbeat(jobId, "capturing_viewports");
      const outcomes = await Promise.all(VIEWPORTS.map(captureOneViewport));
      for (const outcome of outcomes) {
        if (outcome.ok && outcome.result) {
          viewportResults.push(outcome.result);
        } else {
          viewportResults.push({
            viewport: outcome.viewport,
            failed: true,
            error: outcome.error || "Viewport capture failed",
            sectionCount: 0,
            blockers: {},
            navigation: {}
          });
        }
      }
    } else {
      for (const viewport of VIEWPORTS) {
        const outcome = await captureOneViewport(viewport);
        if (outcome.ok && outcome.result) {
          viewportResults.push(outcome.result);
        } else {
          viewportResults.push({
            viewport: outcome.viewport,
            failed: true,
            error: outcome.error || "Viewport capture failed",
            sectionCount: 0,
            blockers: {},
            navigation: {}
          });
        }
      }
    }

    siteType = captureState.siteType;
    if (!isKnownSiteType(siteType)) {
      try {
        siteType = await detectSiteType(url, "");
        console.log(`[runAudit] Site type (fallback): ${siteType}`);
      } catch {
        siteType = "unknown";
      }
    }

    // STEP 4 — verify captured sections
    await heartbeat(jobId, "preparing_analysis");
    let desktopSections = await getScreenshots(jobId, {
      viewport: "desktop",
      type: "section",
      failed: false
    });

    let mobileSections = await getScreenshots(jobId, {
      viewport: "mobile",
      type: "section",
      failed: false
    });

    if (!desktopSections?.length && mobileSections?.length > 0) {
      console.warn(
        `[runAudit] No desktop sections — continuing with ${mobileSections.length} mobile section(s)`
      );
    }

    if (
      (!desktopSections || desktopSections.length === 0) &&
      (!mobileSections || mobileSections.length === 0)
    ) {
      const failedCaptures = await getScreenshots(jobId, {
        type: "section",
        failed: true
      });

      let errorMsg = "Desktop and mobile sections could not be captured";
      const reasons = failedCaptures
        .map((s) => s.fail_reason)
        .filter(Boolean)
        .slice(0, 3);

      if (reasons.length > 0) {
        errorMsg = `Section capture failed: ${reasons.join(" | ")}`;
      } else if (viewportResults.some((v) => v.failed)) {
        const vpErr = viewportResults.find((v) => v.failed)?.error;
        if (vpErr) errorMsg = `Capture failed: ${vpErr}`;
      }

      await updateJobStatus(jobId, "failed", {
        error: errorMsg,
        current_step: "failed"
      });
      return {
        jobId,
        sectionCount: 0,
        issueCount: 0,
        error: errorMsg
      };
    }

    // STEP 5 + 6 — finish pipelined analysis or run batch fallback
    let allIssues = [];
    let llmErrors = [];
    if (pipeline) {
      console.log("[runAudit] Finishing pipelined analysis");
      await heartbeat(jobId, "analyzing");
      const analysisResult = await pipeline.finish();
      allIssues = analysisResult.issues || [];
      llmErrors = analysisResult.llmErrors || [];
    } else {
      await heartbeat(jobId, "analyzing");
      const analysisResult = await runAnalysisOnAllSections(
        desktopSections,
        mobileSections,
        siteType,
        jobId
      );
      allIssues = analysisResult.issues || [];
      llmErrors = analysisResult.llmErrors || [];
    }

    const sectionCount =
      (desktopSections?.length || 0) + (mobileSections?.length || 0);

    if (shouldFailForLlmErrors(sectionCount, allIssues.length, llmErrors)) {
      const errorMsg =
        summarizeLlmErrors(llmErrors, llm.provider) ||
        `AI analysis failed (${llm.provider})`;
      await updateJobStatus(jobId, "failed", {
        error: errorMsg,
        current_step: "failed",
        section_count: sectionCount,
        issue_count: 0
      });
      return {
        jobId,
        sectionCount,
        issueCount: 0,
        error: errorMsg
      };
    }

    // STEP 7 — save issues
    await heartbeat(jobId, "saving_issues");
    if (allIssues.length > 0) {
      await saveIssues(jobId, allIssues);
    }

    // STEP 8 — compute overall scores, then mark done
    try {
      const desktopScores = await getSectionScores(jobId, "desktop");
      const mobileScores = await getSectionScores(jobId, "mobile");
      const scoreUpdates = {};

      const overallScore = computeWeightedOverallScore(desktopScores);
      if (overallScore != null) {
        scoreUpdates.overall_score = overallScore;
        console.log(`[Score] Desktop overall: ${overallScore}/100`);
      }

      const mobileOverallScore = computeWeightedOverallScore(mobileScores);
      if (mobileOverallScore != null) {
        scoreUpdates.mobile_overall_score = mobileOverallScore;
        console.log(`[Score] Mobile overall: ${mobileOverallScore}/100`);
      }

      if (Object.keys(scoreUpdates).length > 0) {
        await updateJobFields(jobId, scoreUpdates);
      }
    } catch (err) {
      console.warn("[Score] Could not compute overall scores:", err.message);
    }

    const issueCount = allIssues.length;
    const highCount = allIssues.filter((i) => i.severity === "high").length;
    const auditQuality = buildAuditQuality(viewportResults, {
      cookieStrategy: AUDIT_COOKIE_STRATEGY
    });

    const donePayload = {
      section_count: sectionCount,
      issue_count: issueCount,
      current_step: "done",
      completed_at: new Date().toISOString(),
      audit_metadata: {
        ...auditQuality,
        site_type: siteType,
        high_count: highCount,
        report_tier: reportTier,
        admin_run: adminRun
      }
    };

    try {
      await updateJobStatus(jobId, "done", donePayload);
    } catch (saveErr) {
      console.warn(
        "[runAudit] Could not save audit_metadata — run DB migration. Retrying without metadata.",
        saveErr?.message
      );
      const { audit_metadata: _omit, ...fallbackPayload } = donePayload;
      await updateJobStatus(jobId, "done", fallbackPayload);
    }

    return { jobId, sectionCount, issueCount };
  } catch (error) {
    await updateJobStatus(jobId, "failed", {
      error: error?.message || "Unknown audit error",
      current_step: "failed"
    }).catch(() => {});

    throw error;
  }
}

export default runAudit;
