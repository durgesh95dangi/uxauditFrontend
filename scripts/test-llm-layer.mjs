/**
 * Step-by-step smoke tests for the configurable LLM audit layer.
 * Run: node scripts/test-llm-layer.mjs
 */
import "dotenv/config";
import { getLlmConfig, getLlmProvider, DEFAULT_LLM_PROVIDER } from "../lib/engine/llm/index.js";
import {
  parseSectionAuditJson,
  normalizeSectionResult,
  toAnthropicImageSource,
  toOpenAiImageUrl
} from "../lib/engine/llm/shared.js";
import { buildSectionPrompt, buildSiteTypePrompt } from "../lib/engine/analysis/prompts.js";
import { analyzeSection, detectSiteType } from "../lib/engine/analysis/analyze.js";

const steps = [];
let failed = 0;

function pass(name, detail = "") {
  steps.push({ name, ok: true, detail });
  console.log(`✓ ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, error) {
  failed += 1;
  steps.push({ name, ok: false, detail: String(error?.message || error) });
  console.error(`✗ ${name} — ${error?.message || error}`);
}

console.log("=== LLM layer smoke tests ===\n");

// Step 1: Config
try {
  const config = getLlmConfig();
  if (!config.provider) throw new Error("missing provider");
  if (!config.models.primary || !config.models.fast) {
    throw new Error("missing model names");
  }
  pass(
    "Config loads",
    `provider=${config.provider}, primary=${config.models.primary}, fast=${config.models.fast}, default=${DEFAULT_LLM_PROVIDER}`
  );
} catch (error) {
  fail("Config loads", error);
}

// Step 2: Prompts (provider-agnostic)
try {
  const section = buildSectionPrompt("Hero", "desktop", "saas", {
    includeAboveFold: true,
    sectionIndex: 0,
    yStart: 0
  });
  if (!section.system?.includes("JSON")) throw new Error("section system prompt invalid");
  if (!section.user?.includes("Hero")) throw new Error("section user prompt invalid");

  const siteType = buildSiteTypePrompt("https://example.com", "Example");
  if (!siteType.user?.includes("example.com")) throw new Error("site type prompt invalid");

  pass("Prompts build (provider-agnostic)");
} catch (error) {
  fail("Prompts build", error);
}

// Step 3: JSON parse + normalize
try {
  const sample = JSON.stringify({
    section_score: 78,
    issues: [
      {
        point_id: "C1",
        area: "clarity",
        severity: "high",
        title: "Headline unclear",
        description: "Test",
        why: "Test",
        business_impact: "Test",
        how_to_fix: "Test",
        effort: "low"
      }
    ],
    positives: ["Clear layout"]
  });
  const parsed = parseSectionAuditJson(sample);
  const normalized = normalizeSectionResult(parsed, "hero");
  if (normalized.issues.length !== 1) throw new Error("expected 1 issue");
  if (normalized.sectionScore !== 78) throw new Error("expected score 78");
  pass("JSON parse + normalize");
} catch (error) {
  fail("JSON parse + normalize", error);
}

// Step 4: Image adapter helpers
try {
  const image = { kind: "base64", mediaType: "image/jpeg", data: "abc123" };
  const anthropic = toAnthropicImageSource(image);
  const openai = toOpenAiImageUrl(image);
  if (anthropic.type !== "base64") throw new Error("anthropic adapter failed");
  if (!openai.startsWith("data:image/jpeg;base64,")) {
    throw new Error("openai adapter failed");
  }
  pass("Image format adapters");
} catch (error) {
  fail("Image format adapters", error);
}

// Step 5: Provider factory (requires API key for active provider)
try {
  const config = getLlmConfig();
  if (!config.apiKey) {
    pass(
      "Provider factory",
      `skipped live init — no API key for ${config.provider}`
    );
  } else {
    const provider = getLlmProvider();
    if (!provider.completeVision || !provider.completeText) {
      throw new Error("provider missing methods");
    }
    pass("Provider factory", `${provider.name} ready`);
  }
} catch (error) {
  fail("Provider factory", error);
}

// Step 6: Site type heuristic (no LLM)
try {
  const fromUrl = await detectSiteType("https://shop.example.com/products", "Shop");
  if (fromUrl !== "ecommerce") {
    throw new Error(`expected ecommerce, got ${fromUrl}`);
  }
  pass("Site type heuristic", fromUrl);
} catch (error) {
  fail("Site type heuristic", error);
}

// Step 7: Live vision call (optional — only if key + RUN_LLM_LIVE_TEST=1)
if (process.env.RUN_LLM_LIVE_TEST === "1" && getLlmConfig().apiKey) {
  try {
    const tinyPng = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64"
    );
    const result = await analyzeSection(
      tinyPng,
      "Hero",
      "desktop",
      "landing-page",
      { sectionIndex: 0, yStart: 0 }
    );
    if (result.llmError) {
      fail("Live vision analyzeSection", new Error(result.llmError));
    } else if (!result || !Array.isArray(result.issues)) {
      throw new Error("analyzeSection returned invalid shape");
    } else {
      pass(
        "Live vision analyzeSection",
        `issues=${result.issues.length}, score=${result.sectionScore ?? "—"}`
      );
    }
  } catch (error) {
    fail("Live vision analyzeSection", error);
  }
} else {
  pass("Live vision analyzeSection", "skipped (set RUN_LLM_LIVE_TEST=1 to enable)");
}

console.log(`\n=== Done: ${steps.length - failed}/${steps.length} passed ===`);
if (failed > 0) process.exit(1);
