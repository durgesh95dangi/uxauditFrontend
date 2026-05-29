"use client";

const COVERAGE_LABEL = {
  good: "Good coverage",
  limited: "Limited coverage",
  partial: "Partial capture"
};

const STATUS_ICON = {
  ok: "✓",
  warn: "!",
  error: "×",
  neutral: "–"
};

export default function AuditQualityPanel({ quality, collapsible = true }) {
  if (!quality) return null;

  const items = quality.items || [];
  const warnings = quality.warnings || [];
  const coverageKey = COVERAGE_LABEL[quality.coverage] ? quality.coverage : "limited";

  const body = (
    <>
      <ul className="audit-quality-list">
        {items.map((item) => (
          <li
            key={item.id}
            className={`audit-quality-item audit-quality-item-${item.status}`}
          >
            <span className="audit-quality-icon" aria-hidden="true">
              {STATUS_ICON[item.status] || STATUS_ICON.neutral}
            </span>
            <span className="audit-quality-label">{item.label}</span>
            <span className="audit-quality-detail">{item.detail}</span>
          </li>
        ))}
      </ul>

      {warnings.length > 0 && (
        <div className="audit-quality-warnings">
          {warnings.map((warning) => (
            <p key={warning} className="audit-quality-warning">
              {warning}
            </p>
          ))}
        </div>
      )}
    </>
  );

  if (collapsible) {
    return (
      <details className="report-fold audit-quality-fold">
        <summary className="report-fold-summary">
          <span>Audit quality</span>
          <span className={`audit-quality-badge audit-quality-badge-${coverageKey}`}>
            {COVERAGE_LABEL[coverageKey]}
          </span>
        </summary>
        <div className="report-fold-body">{body}</div>
      </details>
    );
  }

  return (
    <section className="audit-quality" aria-label="Audit quality">
      <header className="audit-quality-head">
        <div>
          <h3 className="audit-quality-title">Audit quality</h3>
          <p className="audit-quality-sub">
            How the page was prepared before analysis
            {quality.legacy ? " (limited data — re-run for full details)" : ""}
          </p>
        </div>
        <span className={`audit-quality-badge audit-quality-badge-${coverageKey}`}>
          {COVERAGE_LABEL[coverageKey]}
        </span>
      </header>
      {body}
    </section>
  );
}
