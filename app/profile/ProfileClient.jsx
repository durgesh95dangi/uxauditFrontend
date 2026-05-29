"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowserClient } from "../../lib/supabase/client.js";
import SiteNav from "../../components/layout/SiteNav.jsx";
import PageToolbar from "../../components/layout/PageToolbar.jsx";
import {
  resolveAvatarUrl,
  resolveFullName,
  resolveInitial
} from "../../lib/user/display.js";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function authProviderLabel(provider) {
  if (provider === "google") return "Google";
  return "Email & password";
}

export default function ProfileClient({ user }) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [fullNameInput, setFullNameInput] = useState(
    user.fullName || resolveFullName(user)
  );
  const [isSavingName, setIsSavingName] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  const avatarUrl = resolveAvatarUrl(user);
  const fullName = resolveFullName(user);
  const initial = resolveInitial(user);
  const isEmailAccount = user.authProvider !== "google";

  async function handleSignOut() {
    setIsSigningOut(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function handleSaveName(event) {
    event.preventDefault();
    setSaveError("");
    setSaveMessage("");

    const trimmed = fullNameInput.trim();
    if (!trimmed) {
      setSaveError("Full name is required.");
      return;
    }

    setIsSavingName(true);

    const { error } = await supabase.auth.updateUser({
      data: { full_name: trimmed }
    });

    if (error) {
      setSaveError(error.message);
      setIsSavingName(false);
      return;
    }

    setSaveMessage("Profile updated.");
    setIsSavingName(false);
    router.refresh();
  }

  return (
    <div className="dashboard-shell">
      <SiteNav
        user={user}
        onSignOut={handleSignOut}
        isSigningOut={isSigningOut}
      />

      <main className="dashboard-main">
        <div className="dashboard-container profile-page">
          <PageToolbar backHref="/dashboard" />

          <div className="profile-card">
            <div className="profile-card-head">
              <span className="profile-card-avatar">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="profile-card-avatar-img" />
                ) : (
                  <span className="profile-card-avatar-fallback">{initial}</span>
                )}
              </span>
              <div>
                <h1 className="profile-card-title">{fullName}</h1>
                <p className="profile-card-email">{user.email}</p>
              </div>
            </div>

            <button
              type="button"
              className={`profile-details-toggle${showDetails ? " is-open" : ""}`}
              aria-expanded={showDetails}
              onClick={() => setShowDetails((open) => !open)}
            >
              <span>
                <strong>Profile details</strong>
                <small>Full name, email, and sign-in info from signup</small>
              </span>
              <svg
                className="profile-details-chevron"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {showDetails && (
              <div className="profile-details-panel">
                <form onSubmit={handleSaveName} className="profile-details-form">
                  <label className="profile-field">
                    <span className="profile-field-label">Full name</span>
                    <input
                      type="text"
                      value={fullNameInput}
                      onChange={(event) => setFullNameInput(event.target.value)}
                      placeholder="Jane Doe"
                      autoComplete="name"
                      required
                    />
                  </label>

                  <div className="profile-field profile-field--static">
                    <span className="profile-field-label">Email</span>
                    <p className="profile-field-value">{user.email || "—"}</p>
                  </div>

                  <div className="profile-field profile-field--static">
                    <span className="profile-field-label">Password</span>
                    {isEmailAccount ? (
                      <div className="profile-field-row">
                        <p className="profile-field-value">••••••••</p>
                        <Link href="/forgot-password" className="profile-field-link">
                          Change password
                        </Link>
                      </div>
                    ) : (
                      <p className="profile-field-value profile-field-muted">
                        Managed through Google
                      </p>
                    )}
                  </div>

                  <div className="profile-field profile-field--static">
                    <span className="profile-field-label">Sign-in method</span>
                    <p className="profile-field-value">
                      {authProviderLabel(user.authProvider)}
                    </p>
                  </div>

                  <div className="profile-details-actions">
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      disabled={isSavingName}
                    >
                      {isSavingName ? "Saving..." : "Save changes"}
                    </button>
                  </div>

                  {saveError && (
                    <p className="profile-feedback profile-feedback--error" role="alert">
                      {saveError}
                    </p>
                  )}
                  {saveMessage && (
                    <p className="profile-feedback profile-feedback--success" role="status">
                      {saveMessage}
                    </p>
                  )}
                </form>
              </div>
            )}

            <dl className="profile-card-meta">
              <div>
                <dt>Member since</dt>
                <dd>{formatDate(user.createdAt)}</dd>
              </div>
              <div>
                <dt>Last sign in</dt>
                <dd>{formatDate(user.lastSignInAt)}</dd>
              </div>
              <div>
                <dt>Email verified</dt>
                <dd>{user.emailVerified ? "Yes" : "Pending"}</dd>
              </div>
            </dl>
          </div>
        </div>
      </main>
    </div>
  );
}
