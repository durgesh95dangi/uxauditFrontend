"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSupabase } from "../../../lib/supabase/useSupabase.js";
import GoogleSignInButton from "../../../components/auth/GoogleSignInButton.jsx";
import AuthShell from "../../../components/layout/AuthShell.jsx";
import PasswordInput from "../../../components/layout/PasswordInput.jsx";

export default function LoginPage() {
  const router = useRouter();
  const { supabase, configError, ready, retry } = useSupabase();

  const [resetSuccess, setResetSuccess] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setResetSuccess(params.get("reset") === "success");

    const authError = params.get("error");
    if (authError) {
      setError(decodeURIComponent(authError.replace(/\+/g, " ")));
    }
  }, []);

  function getRedirectPath() {
    if (typeof window === "undefined") return "/dashboard";
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    if (next && next.startsWith("/") && !next.startsWith("//")) {
      return next;
    }
    return "/dashboard";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!supabase) {
      setError("Still loading. Please try again.");
      setIsSubmitting(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      setError(signInError.message);
      setIsSubmitting(false);
      return;
    }

    router.push(getRedirectPath());
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

        <h1 className="auth-heading">Welcome back</h1>
        <p className="auth-sub">Sign in to continue</p>

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

          <label className="auth-label">
            Password
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
              required
            />
          </label>

          <p className="auth-forgot-row">
            <Link href="/forgot-password">Forgot password?</Link>
          </p>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting || !ready}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <GoogleSignInButton
          supabase={supabase}
          ready={ready}
          nextPath={getRedirectPath()}
          onError={setError}
        />

        {configError && (
          <p className="auth-result error" role="alert">
            {configError}{" "}
            <button type="button" className="auth-link-button" onClick={retry}>
              Retry
            </button>
          </p>
        )}
        {error && (
          <p className="auth-result error" role="alert">
            {error}
          </p>
        )}
        {resetSuccess && !error && (
          <p className="auth-result success" role="status">
            Password updated. Sign in with your new password.
          </p>
        )}

        <p className="auth-helper auth-footer">
          Don&apos;t have an account?{" "}
          <Link href="/signup">Sign up</Link>
        </p>
      </div>
    </AuthShell>
  );
}
