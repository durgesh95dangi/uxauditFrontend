// auditQuality.js - builds a structured audit quality summary for reports

import { AUDIT_COOKIE_STRATEGY } from "./config.js";

function mergeBlockers(initial = {}, postScroll = {}) {
  return {
    cookies: postScroll.cookies?.handled
      ? postScroll.cookies
      : initial.cookies || null,
    modalsDismissed:
      (initial.modalsDismissed || 0) + (postScroll.modalsDismissed || 0),
    overlaysHidden: Math.max(
      initial.overlaysHidden || 0,
      postScroll.overlaysHidden || 0
    ),
    paywall: Boolean(initial.paywall || postScroll.paywall)
  };
}

export function buildViewportQuality({
  viewport,
  prepSummary,
  postScrollBlockers,
  sectionCount,
  scrollMeta
}) {
  const blockers = mergeBlockers(
    prepSummary?.blockers,
    postScrollBlockers || {}
  );

  return {
    viewport,
    navigation: {
      status: prepSummary?.navigation?.status ?? null,
      finalUrl: prepSummary?.navigation?.finalUrl ?? null
    },
    blockers,
    sectionCount: sectionCount ?? 0,
    hasInfiniteScroll: Boolean(scrollMeta?.hasInfiniteScroll)
  };
}

export function buildAuditQuality(viewportResults, options = {}) {
  const desktop =
    viewportResults.find((v) => v.viewport === "desktop") || viewportResults[0];
  const cookieStrategy = options.cookieStrategy || AUDIT_COOKIE_STRATEGY;

  const items = [];
  const warnings = [];

  const cookies = desktop?.blockers?.cookies;
  if (cookies?.handled) {
    items.push({
      id: "cookies",
      status: "ok",
      label: "Cookie consent",
      detail: `${cookieStrategy === "reject" ? "Rejected" : "Accepted"} (${formatMethod(cookies.method)})`
    });
  } else {
    items.push({
      id: "cookies",
      status: "neutral",
      label: "Cookie consent",
      detail: "No banner detected"
    });
  }

  const modals = desktop?.blockers?.modalsDismissed || 0;
  items.push({
    id: "modals",
    status: modals > 0 ? "ok" : "neutral",
    label: "Popups & modals",
    detail: modals > 0 ? `${modals} dismissed` : "None detected"
  });

  const overlays = desktop?.blockers?.overlaysHidden || 0;
  if (overlays > 0) {
    items.push({
      id: "overlays",
      status: "ok",
      label: "Persistent overlays",
      detail: `${overlays} hidden before capture`
    });
  }

  const httpStatus = desktop?.navigation?.status;
  if (httpStatus && httpStatus >= 400) {
    items.push({
      id: "http",
      status: "warn",
      label: "Page load",
      detail: `HTTP ${httpStatus} — audit continued`
    });
    warnings.push(`Page returned HTTP ${httpStatus}. Some content may be missing.`);
  } else {
    items.push({
      id: "http",
      status: "ok",
      label: "Page load",
      detail: httpStatus ? `HTTP ${httpStatus}` : "Loaded successfully"
    });
  }

  const sectionCount = desktop?.sectionCount ?? 0;
  if (sectionCount === 0) {
    items.push({
      id: "sections",
      status: "error",
      label: "Section coverage",
      detail: "No sections captured"
    });
    warnings.push("No page sections were captured for analysis.");
  } else if (sectionCount === 1) {
    items.push({
      id: "sections",
      status: "warn",
      label: "Section coverage",
      detail: "1 section — page may not be fully segmented"
    });
    warnings.push(
      "Only one section was detected. Lower parts of the page may not have been analyzed."
    );
  } else {
    items.push({
      id: "sections",
      status: "ok",
      label: "Section coverage",
      detail: `${sectionCount} sections captured`
    });
  }

  if (desktop?.blockers?.paywall) {
    items.push({
      id: "paywall",
      status: "warn",
      label: "Paywall",
      detail: "Login or subscription wall detected"
    });
    warnings.push(
      "A paywall was detected. Content behind login may not appear in this audit."
    );
  }

  if (desktop?.hasInfiniteScroll) {
    items.push({
      id: "infinite-scroll",
      status: "warn",
      label: "Infinite scroll",
      detail: "Long page — capture may be truncated"
    });
    warnings.push(
      "Infinite scroll was detected. Very long pages may not be fully captured."
    );
  }

  const failedViewports = viewportResults.filter((v) => v.failed);
  if (failedViewports.length > 0) {
    warnings.push(
      `Capture failed on: ${failedViewports.map((v) => v.viewport).join(", ")}.`
    );
  }

  const coverage = resolveCoverage(sectionCount, warnings, desktop?.blockers?.paywall);

  return {
    coverage,
    cookieStrategy,
    viewports: viewportResults,
    items,
    warnings,
    capturedAt: new Date().toISOString()
  };
}

function formatMethod(method) {
  if (!method) return "automatic";
  if (method.startsWith("selector:")) {
    return method.slice("selector:".length);
  }
  if (method.startsWith("text:")) {
    return `"${method.slice("text:".length)}"`;
  }
  return method;
}

function resolveCoverage(sectionCount, warnings, paywall) {
  if (sectionCount === 0) return "partial";
  if (paywall || sectionCount === 1 || warnings.length > 0) return "limited";
  return "good";
}

export function normalizeAuditQuality(raw, fallback = {}) {
  if (raw && typeof raw === "object" && Array.isArray(raw.items)) {
    return raw;
  }

  const sectionCount = fallback.sectionsAnalyzed ?? 0;
  const items = [
    {
      id: "sections",
      status: sectionCount <= 1 ? "warn" : "ok",
      label: "Section coverage",
      detail:
        sectionCount === 0
          ? "No metadata — re-run audit for full quality report"
          : `${sectionCount} sections analyzed`
    }
  ];

  return {
    coverage: sectionCount <= 1 ? "limited" : "good",
    items,
    warnings:
      sectionCount <= 1
        ? ["Re-run this audit to see full capture quality details."]
        : [],
    legacy: true
  };
}
