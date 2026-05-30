"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useSupabase } from "../../lib/supabase/useSupabase.js";
import SiteNav from "../../components/layout/SiteNav.jsx";
import PageToolbar from "../../components/layout/PageToolbar.jsx";
import {
  resolveAvatarUrl,
  resolveFullName,
  resolveInitial
} from "../../lib/user/display.js";
import UserAvatar from "../../components/layout/UserAvatar.jsx";

function formatJoinDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function IconPencil() {
  return (
    <svg
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
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg
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
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export default function ProfileClient({ user }) {
  const router = useRouter();
  const { supabase } = useSupabase();
  const nameInputRef = useRef(null);

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [fullNameInput, setFullNameInput] = useState(
    user.fullName || resolveFullName(user)
  );
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  const avatarUrl = resolveAvatarUrl(user);
  const initial = resolveInitial(user);
  const savedName = user.fullName || resolveFullName(user);

  async function handleSignOut() {
    if (!supabase) return;
    setIsSigningOut(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function startEditingName() {
    setSaveError("");
    setSaveMessage("");
    setIsEditingName(true);
    requestAnimationFrame(() => {
      const input = nameInputRef.current;
      if (!input) return;
      input.focus();
      input.select();
    });
  }

  function cancelEditingName() {
    setFullNameInput(savedName);
    setIsEditingName(false);
    setSaveError("");
  }

  async function saveName() {
    setSaveError("");
    setSaveMessage("");

    const trimmed = fullNameInput.trim();
    if (!trimmed) {
      setSaveError("Full name is required.");
      return;
    }

    if (trimmed === savedName) {
      setIsEditingName(false);
      return;
    }

    if (!supabase) {
      setSaveError("Still loading. Please try again.");
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
    setIsEditingName(false);
    setIsSavingName(false);
    router.refresh();
  }

  async function handleNameSubmit(event) {
    event.preventDefault();
    if (isEditingName) {
      await saveName();
    }
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
          <h1 className="profile-page-title">Profile</h1>

          <section className="profile-sheet" aria-label="Account details">
            <div className="profile-hero">
              <span className="profile-avatar">
                {avatarUrl ? (
                  <UserAvatar
                    src={avatarUrl}
                    size={72}
                    className="profile-avatar-img"
                  />
                ) : (
                  <span className="profile-avatar-fallback">{initial}</span>
                )}
              </span>
            </div>

            <div className="profile-rows">
              <form onSubmit={handleNameSubmit} className="profile-row">
                <span className="profile-row-label">Full name</span>
                <div className="profile-row-value">
                  {!isEditingName ? (
                    <div className="profile-name-display">
                      <span className="profile-name-text">
                        {fullNameInput.trim() || savedName || "—"}
                      </span>
                      <button
                        type="button"
                        className="profile-icon-btn"
                        onClick={startEditingName}
                        aria-label="Edit full name"
                      >
                        <IconPencil />
                      </button>
                    </div>
                  ) : (
                    <div className="profile-name-row is-editing">
                      <input
                        ref={nameInputRef}
                        type="text"
                        id="profile-full-name"
                        value={fullNameInput}
                        onChange={(event) =>
                          setFullNameInput(event.target.value)
                        }
                        placeholder="Jane Doe"
                        autoComplete="name"
                        required
                      />
                      <div className="profile-name-actions">
                        <button
                          type="submit"
                          className="profile-icon-btn profile-icon-btn--primary"
                          disabled={isSavingName}
                          aria-label="Save full name"
                        >
                          <IconCheck />
                        </button>
                        <button
                          type="button"
                          className="profile-icon-btn"
                          onClick={cancelEditingName}
                          disabled={isSavingName}
                          aria-label="Cancel editing"
                        >
                          <IconClose />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </form>

              <div className="profile-row">
                <span className="profile-row-label">Email</span>
                <span className="profile-row-value">{user.email || "—"}</span>
              </div>

              <div className="profile-row">
                <span className="profile-row-label">Plan</span>
                <span className="profile-row-value profile-plan-value">
                  <span>{user.planLabel || "Free"}</span>
                  {user.monthlyAuditLimit != null ? (
                    <span className="profile-plan-detail">
                      {user.monthlyAuditLimit}{" "}
                      {user.monthlyAuditLimit === 1 ? "audit" : "audits"} per month
                    </span>
                  ) : (
                    <span className="profile-plan-detail">Unlimited audits</span>
                  )}
                  {user.planLabel !== "Agency" && !user.isSuperadmin && (
                    <Link href="/pricing" className="profile-plan-link">
                      {user.planLabel === "Free" ? "Upgrade plan" : "Change plan"}
                    </Link>
                  )}
                </span>
              </div>

              <div className="profile-row">
                <span className="profile-row-label">Joined</span>
                <span className="profile-row-value">
                  {formatJoinDate(user.createdAt)}
                </span>
              </div>
            </div>

            {(saveError || saveMessage) && (
              <div className="profile-feedback-wrap">
                {saveError && (
                  <p className="profile-feedback profile-feedback--error" role="alert">
                    {saveError}
                  </p>
                )}
                {saveMessage && !saveError && (
                  <p
                    className="profile-feedback profile-feedback--success"
                    role="status"
                  >
                    {saveMessage}
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
