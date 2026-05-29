// pipeline.js - pipelined section analysis during capture (buffer-first, token-paced)

import { analyzeSection } from "./claude.js";
import { createAnalysisLimiter } from "./analysisLimiter.js";
import {
  classifySectionProfile,
  findDesktopHeroScreenshotId
} from "./sectionTypes.js";
import {
  heartbeat,
  updateJobFields,
  updateScreenshotAnalysis
} from "../storage/db.js";

async function saveAboveFoldFromAnalysis(jobId, aboveFold) {
  if (!aboveFold) return;

  await updateJobFields(jobId, {
    above_fold_score: aboveFold.score ?? null,
    above_fold_vp_clear: aboveFold.vp_clear ?? null,
    above_fold_cta_visible: aboveFold.cta_visible ?? null,
    above_fold_cta_copy: aboveFold.cta_copy ?? null,
    above_fold_top_risk: aboveFold.top_risk ?? null
  });
  console.log(
    `[AboveFold] Score: ${aboveFold.score ?? "—"}/100 (from hero section)`
  );
}

/**
 * @param {string} jobId
 * @param {() => string} getSiteType
 */
export function createAnalysisPipeline(jobId, getSiteType) {
  const limiter = createAnalysisLimiter();
  /** @type {Promise<void>[]} */
  const tasks = [];
  /** @type {object[]} */
  const issues = [];
  /** @type {Array<{ id: string, label?: string, y_start?: number, yStart?: number }>} */
  const desktopSections = [];
  let aboveFoldSaved = false;
  let aboveFoldClaimed = false;
  let completed = 0;

  function shouldIncludeAboveFold(viewport, label, sectionIndex, yStart) {
    if (viewport !== "desktop" || aboveFoldSaved || aboveFoldClaimed) {
      return false;
    }
    const profile = classifySectionProfile(label, sectionIndex, yStart);
    if (profile === "nav" || profile === "footer") {
      return false;
    }
    if (profile === "hero") {
      aboveFoldClaimed = true;
      return true;
    }
    if (yStart >= 60 && yStart < 500) {
      aboveFoldClaimed = true;
      return true;
    }
    return false;
  }

  function trackDesktopSection(meta) {
    desktopSections.push({
      id: meta.screenshotId,
      label: meta.label,
      y_start: meta.yStart,
      yStart: meta.yStart
    });
    return findDesktopHeroScreenshotId(desktopSections);
  }

  /**
   * Start analysis for a captured section (buffer-first; upload runs in parallel).
   * @param {object} item
   */
  function enqueue(item) {
    const {
      buffer,
      uploadTask,
      label,
      viewport,
      sectionIndex,
      yStart
    } = item;

    if (!buffer || !uploadTask) return;

    const includeAboveFold = shouldIncludeAboveFold(
      viewport,
      label,
      sectionIndex,
      yStart
    );

    const task = limiter.run(async (estimatedTokens) => {
      const analysisPromise = analyzeSection(
        buffer,
        label,
        viewport,
        getSiteType(),
        {
          includeAboveFold,
          sectionIndex,
          yStart
        }
      );

      const savedRow = await uploadTask.catch(() => null);

      if (savedRow?.id && viewport === "desktop") {
        trackDesktopSection({
          screenshotId: savedRow.id,
          label,
          yStart
        });
      }

      const analysis = await analysisPromise;

      if (!savedRow?.id) {
        console.warn(
          `[Pipeline] Upload failed for ${label} (${viewport}) — skipping DB analysis update`
        );
        return;
      }

      limiter.recordActualUsage(
        estimatedTokens,
        analysis.usage?.input_tokens
      );

      await updateScreenshotAnalysis(savedRow.id, {
        sectionScore: analysis.sectionScore,
        positives: analysis.positives
      });

      if (analysis.aboveFold && includeAboveFold && !aboveFoldSaved) {
        aboveFoldSaved = true;
        await saveAboveFoldFromAnalysis(jobId, analysis.aboveFold);
      }

      const publicUrl = savedRow.public_url ?? null;
      for (const issue of analysis.issues) {
        issues.push({
          ...issue,
          screenshotId: savedRow.id,
          sectionLabel: label,
          viewport,
          screenshotUrl: publicUrl
        });
      }

      completed += 1;
      await heartbeat(jobId, `analyzing_${completed}`);
    });

    tasks.push(task);
  }

  async function finish() {
    await Promise.all(tasks);
    return issues;
  }

  return { enqueue, finish, getIssueCount: () => issues.length };
}
