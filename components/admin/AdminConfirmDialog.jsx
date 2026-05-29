"use client";

export default function AdminConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  loading = false,
  onConfirm,
  onCancel
}) {
  if (!open) return null;

  return (
    <div className="admin-modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="admin-modal dashboard-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="admin-confirm-title" className="dashboard-panel-title">
          {title}
        </h2>
        <p className="admin-page-sub">{message}</p>
        <div className="admin-modal-actions">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm admin-btn-danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
