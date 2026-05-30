"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { starterPlanMetadata } from "../../../lib/audit/plans.js";
import { getSupabaseBrowserClient } from "../../../lib/supabase/client";
import AuthShell from "../../../components/layout/AuthShell.jsx";
import PasswordInput from "../../../components/layout/PasswordInput.jsx";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = getSupabaseBrowserClient();

  const [step, setStep] = useState("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  async function finishSignup(sessionUser) {
    if (sessionUser && !sessionUser.user_metadata?.plan) {
      await supabase.auth.updateUser({
        data: starterPlanMetadata(sessionUser.user_metadata || {})
      });
    }

    const redirectPath = searchParams.get("redirect");
    const plan = searchParams.get("plan");
    const nextPath =
      redirectPath === "/pricing" || plan === "founder" || plan === "agency"
        ? "/pricing"
        : "/dashboard";

    router.push(nextPath);
    router.refresh();
  }

  async function handleCredentialsSubmit(event) {
    event.preventDefault();
    setError("");
    setInfoMessage("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email address");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsSubmitting(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          plan: "starter",
          signup_source: "landing"
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsSubmitting(false);
      return;
    }

    setEmail(trimmedEmail);

    if (data.session) {
      await finishSignup(data.user);
      setIsSubmitting(false);
      return;
    }

    setStep("verify");
    setInfoMessage(`We sent a verification code to ${trimmedEmail}. Enter it below.`);
    setIsSubmitting(false);
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();
    setError("");
    setInfoMessage("");

    const trimmedEmail = email.trim();
    const token = otp.replace(/\s/g, "");

    if (!token) {
      setError("Enter the verification code from your email");
      return;
    }

    setIsVerifying(true);

    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email: trimmedEmail,
      token,
      type: "signup"
    });

    if (verifyError) {
      setError(verifyError.message);
      setIsVerifying(false);
      return;
    }

    await finishSignup(data.user);
    setIsVerifying(false);
  }

  async function handleResendCode() {
    setError("");
    setInfoMessage("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Email is missing. Go back and try again.");
      return;
    }

    setIsResending(true);

    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: trimmedEmail
    });

    if (resendError) {
      setError(resendError.message);
      setIsResending(false);
      return;
    }

    setInfoMessage(`A new code was sent to ${trimmedEmail}.`);
    setIsResending(false);
  }

  function handleBackToCredentials() {
    setStep("credentials");
    setOtp("");
    setError("");
    setInfoMessage("");
  }

  async function handleGoogleSignUp() {
    setError("");
    setIsGoogleLoading(true);

    const origin =
      typeof window !== "undefined" ? window.location.origin : "";

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=/dashboard`
      }
    });

    if (oauthError) {
      setError(oauthError.message);
      setIsGoogleLoading(false);
    }
  }

  return (
    <AuthShell>
      <div className="auth-card">
        <div className="auth-logo">
          <Link href="/" className="auth-brand">
            UXAuditX
          </Link>
        </div>

        {step === "credentials" ? (
          <>
            <h1 className="auth-heading">Create your account</h1>
            <p className="auth-sub">Start running UX audits in seconds.</p>

            <form onSubmit={handleCredentialsSubmit} className="auth-form">
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
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </label>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending code..." : "Create Account"}
              </button>
            </form>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignUp}
              className="btn btn-ghost btn-block btn-google"
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? "Redirecting..." : "Continue with Google"}
            </button>
          </>
        ) : (
          <>
            <h1 className="auth-heading">Verify your email</h1>
            <p className="auth-sub">
              Enter the code we sent to <strong>{email}</strong>
            </p>

            <form onSubmit={handleVerifyOtp} className="auth-form">
              <label className="auth-label">
                Verification code
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="auth-otp-input"
                  maxLength={8}
                  required
                />
              </label>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={isVerifying}
              >
                {isVerifying ? "Verifying..." : "Verify and continue"}
              </button>
            </form>

            <p className="auth-helper auth-otp-actions">
              <button
                type="button"
                className="auth-link-button"
                onClick={handleResendCode}
                disabled={isResending}
              >
                {isResending ? "Sending..." : "Resend code"}
              </button>
              <span aria-hidden="true"> · </span>
              <button
                type="button"
                className="auth-link-button"
                onClick={handleBackToCredentials}
              >
                Change email
              </button>
            </p>
          </>
        )}

        {error && (
          <p className="auth-result error" role="alert">
            {error}
          </p>
        )}
        {infoMessage && !error && (
          <p className="auth-result success" role="status">
            {infoMessage}
          </p>
        )}

        <p className="auth-helper auth-footer">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </AuthShell>
  );
}
