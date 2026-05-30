"use client";

import Link from "next/link";
import { useState } from "react";
import { useSupabase } from "../../../lib/supabase/useSupabase.js";
import AuthShell from "../../../components/layout/AuthShell.jsx";

export default function ForgotPasswordPage() {
  const { supabase, configError, ready } = useSupabase();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!supabase) {
      setError("Still loading. Please try again.");
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email address");
      return;
    }

    setIsSubmitting(true);

    const origin =
      typeof window !== "undefined" ? window.location.origin : "";

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      trimmedEmail,
      {
        redirectTo: `${origin}/auth/callback?next=/reset-password`
      }
    );

    if (resetError) {
      setError(resetError.message);
      setIsSubmitting(false);
      return;
    }

    setSuccessMessage(
      "If an account exists for that email, we sent a password reset link. Check your inbox."
    );
    setIsSubmitting(false);
  }

  return (
    <AuthShell>
      <div className="auth-card">
        <div className="auth-logo">
          <Link href="/" className="auth-brand">
            UXAuditX
          </Link>
        </div>

        <h1 className="auth-heading">Reset your password</h1>
        <p className="auth-sub">
          Enter your account email and we&apos;ll send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
            />
          </label>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting || Boolean(successMessage) || !ready}
          >
            {isSubmitting ? "Sending..." : "Send reset link"}
          </button>
        </form>

        {configError && (
          <p className="auth-result error" role="alert">
            {configError}
          </p>
        )}
        {error && (
          <p className="auth-result error" role="alert">
            {error}
          </p>
        )}
        {successMessage && (
          <p className="auth-result success" role="status">
            {successMessage}
          </p>
        )}

        <p className="auth-helper auth-footer">
          <Link href="/login">Back to login</Link>
        </p>
      </div>
    </AuthShell>
  );
}
