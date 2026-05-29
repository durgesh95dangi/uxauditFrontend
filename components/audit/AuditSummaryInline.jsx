"use client";

export default function AuditSummaryInline({
  issues,
  high,
  sections,
  className = "",
  variant = "inline"
}) {
  if (issues == null && sections == null) return null;

  const isCards = variant === "cards";
  const rootClass = isCards
    ? `audit-summary-cards${className ? ` ${className}` : ""}`
    : `audit-summary-inline${className ? ` ${className}` : ""}`;
  const itemClass = isCards
    ? "audit-summary-card"
    : "audit-summary-inline-stat";

  return (
    <dl className={rootClass}>
      {issues != null && (
        <div className={itemClass}>
          <dt>Issues</dt>
          <dd>{issues}</dd>
        </div>
      )}
      {high != null && (
        <div className={itemClass}>
          <dt>High</dt>
          <dd>{high}</dd>
        </div>
      )}
      {sections != null && (
        <div className={itemClass}>
          <dt>Sections</dt>
          <dd>{sections}</dd>
        </div>
      )}
    </dl>
  );
}
