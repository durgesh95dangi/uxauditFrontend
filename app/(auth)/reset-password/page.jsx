"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSupabase } from "../../../lib/supabase/useSupabase.js";
import AuthShell from "../../../components/layout/AuthShell.jsx";

function parseHashTokens() {
  if (typeof window === "undefined") return null;

  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;

  if (!hash) return null;

  const params = new URLSearchParams(hash);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  const type = params.get("type");
  const errorDescription = params.get("error_description");

  return { accessToken, refreshToken, type, errorDescription };
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const { supabase, configError } = useSupabase();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("Verifying reset link...");
  const [isReady, setIsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verifyRecoverySession() {
      if (!supabase) return;

      const hashTokens = parseHashTokens();

      if (hashTokens?.errorDescription) {
        if (!cancelled) {
          setError(
            decodeURIComponent(hashTokens.errorDescription.replace(/\+/g, " "))
          );
          setStatusMessage("");
        }
        return;
      }

      if (
        hashTokens?.accessToken &&
        hashTokens?.refreshToken &&
        hashTokens?.type === "recovery"
      ) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: hashTokens.accessToken,
          refresh_token: hashTokens.refreshToken
        });

        window.history.replaceState({}, "", "/reset-password");

        if (sessionError) {
          if (!cancelled) {
            setError(sessionError.message);
            setStatusMessage("");
          }
          return;
        }
      }

      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (!session) {
        setError(
          "This page must be opened from the password reset email link."
        );
        setStatusMessage("");
        return;
      }

      setStatusMessage("Enter a new password to finish resetting your account.");
      setIsReady(true);
    }

    verifyRecoverySession();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!supabase) {
      setError("Still loading. Please try again.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password
    });

    if (updateError) {
      setError(updateError.message);
      setIsSubmitting(false);
      return;
    }

    await supabase.auth.signOut();

    router.push("/login?reset=success");
    router.refresh();
  }

  return (
    <AuthShell>
      <div className="auth-card">
        <div className="auth-logo">
          <Link href="/" className="auth-brand">
            UXAuditX
          </Link>
        </div>

        <h1 className="auth-heading">Set a new password</h1>
        <p className="auth-sub">Choose a new password for your UXAuditX account.</p>

        {statusMessage && !error && (
          <p className="auth-result" role="status">
            {statusMessage}
          </p>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label">
            New password
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
              disabled={!isReady || isSubmitting}
            />
          </label>

          <label className="auth-label">
            Confirm password
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat the password"
              autoComplete="new-password"
              disabled={!isReady || isSubmitting}
            />
          </label>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={!isReady || isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update password"}
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

        <p className="auth-helper auth-footer">
          <Link href="/login">Back to login</Link>
        </p>
      </div>
    </AuthShell>
  );
}
