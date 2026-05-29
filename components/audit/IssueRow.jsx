const SEVERITY_LABEL = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low"
};

export default function IssueRow({
  issue,
  index,
  screenshotUrl,
  onZoom,
  interactive = true
}) {
  const sev =
    ["critical", "high", "medium", "low"].includes(issue.severity)
      ? issue.severity
      : "low";
  const viewport =
    issue.viewport === "mobile"
      ? "Mobile"
      : issue.viewport
        ? "Desktop"
        : null;

  return (
    <article className="issue-finding-card issue-row">
      <span className="issue-row-index" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="issue-row-body">
        <header className="issue-row-head">
          <span className={`issue-row-sev issue-row-sev--${sev}`}>
            {SEVERITY_LABEL[sev] || "Low"}
          </span>
          <span className="issue-row-section">{issue.section_label || "Section"}</span>
          {viewport && <span className="issue-row-vp">{viewport}</span>}
          {issue.point_id && (
            <span className="point-id-badge">{issue.point_id}</span>
          )}
          {issue.area && (
            <span className={`area-badge area-badge--${issue.area}`}>
              {issue.area}
            </span>
          )}
        </header>

        {screenshotUrl &&
          (interactive && onZoom ? (
            <button
              type="button"
              className="issue-row-shot-button"
              onClick={() => onZoom(screenshotUrl)}
              aria-label={`Open screenshot for ${issue.title || "issue"}`}
            >
              <img
                src={screenshotUrl}
                alt=""
                className="issue-row-shot"
                loading="lazy"
              />
            </button>
          ) : (
            <div className="issue-row-shot-button issue-row-shot-button--static">
              <img
                src={screenshotUrl}
                alt=""
                className="issue-row-shot"
                loading="lazy"
              />
            </div>
          ))}

        <h3 className="issue-row-title">{issue.title}</h3>

        {issue.description && (
          <p className="issue-row-desc">{issue.description}</p>
        )}

        {issue.how_to_fix && (
          <div className="issue-row-fix">
            <span className="issue-row-fix-label">Recommended fix</span>
            <p className="issue-row-fix-text">{issue.how_to_fix}</p>
          </div>
        )}
      </div>
    </article>
  );
}
