"use client";

import { useEffect, useState } from "react";

export default function AdminUserModal({
  open,
  mode = "create",
  initialUser = null,
  loading = false,
  error = null,
  onClose,
  onSubmit
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initialUser) {
      setEmail(initialUser.email || "");
      setFullName(initialUser.fullName || "");
      setPassword("");
    } else {
      setEmail("");
      setFullName("");
      setPassword("");
    }
  }, [open, mode, initialUser]);

  if (!open) return null;

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      email: email.trim(),
      password: password.trim(),
      fullName: fullName.trim()
    });
  }

  return (
    <div className="admin-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="admin-modal dashboard-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-user-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="admin-user-modal-title" className="dashboard-panel-title">
          {mode === "edit" ? "Edit user" : "Add user"}
        </h2>
        <p className="admin-page-sub">
          {mode === "edit"
            ? "Update profile details or set a new password."
            : "Create a new UXAuditX account."}
        </p>

        <form onSubmit={handleSubmit} className="admin-form">
          {mode === "create" && (
            <label className="auth-label">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="user@company.com"
                autoComplete="off"
              />
            </label>
          )}

          <label className="auth-label">
            Full name
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Optional"
              autoComplete="name"
            />
          </label>

          <label className="auth-label">
            {mode === "edit" ? "New password" : "Password"}
            <input
              type="password"
              required={mode === "create"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={mode === "edit" ? "Leave blank to keep current" : "Min. 8 characters"}
              autoComplete="new-password"
            />
          </label>

          {error && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}

          <div className="admin-modal-actions">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
              {loading ? "Saving…" : mode === "edit" ? "Save changes" : "Create user"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
