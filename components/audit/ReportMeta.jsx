"use client";

export default function ReportMeta({ aboveFold }) {
  const insightParts = [
    aboveFold?.score != null && `First impression ${aboveFold.score}/100`,
    aboveFold?.vp_clear != null &&
      `Value prop ${aboveFold.vp_clear ? "clear" : "unclear"}`,
    aboveFold?.cta_visible != null &&
      `CTA ${aboveFold.cta_visible ? "visible" : "missing"}`,
    aboveFold?.top_risk || null
  ].filter(Boolean);

  if (!insightParts.length) return null;

  return (
    <div className="report-meta">
      <p className="report-meta-insight">{insightParts.join(" · ")}</p>
    </div>
  );
}
