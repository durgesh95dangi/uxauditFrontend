export default function AdminPageHeader({
  title,
  subtitle,
  onRefresh,
  loading = false,
  actions = null
}) {
  return (
    <header className="admin-page-header">
      <div className="admin-page-header-copy">
        <h1 className="dashboard-panel-title">{title}</h1>
        {subtitle ? <p className="admin-page-sub">{subtitle}</p> : null}
      </div>
      {(onRefresh || actions) && (
        <div className="admin-page-header-actions">
          {onRefresh ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onRefresh}
              disabled={loading}
            >
              Refresh
            </button>
          ) : null}
          {actions}
        </div>
      )}
    </header>
  );
}
