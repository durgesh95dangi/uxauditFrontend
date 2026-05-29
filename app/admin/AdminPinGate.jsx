"use client";

import { useState } from "react";

export default function AdminPinGate({ user }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pin.trim() })
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(body?.error || "Incorrect PIN");
        return;
      }

      window.location.reload();
    } catch {
      setError("Could not verify PIN. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="admin-pin-wrap">
      <div className="dashboard-panel auth-card admin-pin-card">
        <h1 className="dashboard-panel-title">Admin PIN</h1>
        <p className="dashboard-panel-sub admin-pin-sub">
          Signed in as {user?.email}. Enter your PIN to continue.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label">
            PIN code
            <input
              type="password"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN"
              maxLength={12}
              autoFocus
            />
          </label>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting || !pin.trim()}
          >
            {isSubmitting ? "Verifying…" : "Continue"}
          </button>
        </form>

        {error && (
          <p className="auth-result error" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
