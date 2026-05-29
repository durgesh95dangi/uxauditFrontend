"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import {
  resolveAvatarUrl,
  resolveFullName,
  resolveInitial,
  resolveNavName,
  truncateName
} from "../../lib/user/display.js";
import UserAvatar from "./UserAvatar.jsx";

function ChevronIcon() {
  return (
    <svg
      className="nav-user-chevron"
      width="14"
      height="14"
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
  );
}

export default function UserNavMenu({ user, onSignOut, isSigningOut = false }) {
  const menuId = useId();
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);

  const avatarUrl = resolveAvatarUrl(user);
  const displayName = resolveNavName(user);
  const fullName = truncateName(resolveFullName(user), 24);
  const initial = resolveInitial(user);

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function handleToggle() {
    setOpen((prev) => !prev);
  }

  function handleSignOut() {
    setOpen(false);
    onSignOut?.();
  }

  return (
    <div className="nav-user-menu" ref={rootRef}>
      <button
        type="button"
        className={`nav-user-trigger${open ? " is-open" : ""}`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={handleToggle}
      >
        <span className="nav-user-avatar">
          {avatarUrl ? (
            <UserAvatar src={avatarUrl} size={28} className="nav-user-avatar-img" />
          ) : (
            <span className="nav-user-avatar-fallback">{initial}</span>
          )}
        </span>
        <span className="nav-user-name">{displayName}</span>
        <ChevronIcon />
      </button>

      {open && (
        <div className="nav-user-dropdown" id={menuId} role="menu">
          <div className="nav-user-dropdown-head">
            <strong>{fullName}</strong>
            {user?.email && <span>{user.email}</span>}
          </div>
          <div className="nav-user-dropdown-divider" />
          {!user?.isSuperadmin && (
            <Link
              href="/profile"
              className="nav-user-dropdown-item"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              Profile
            </Link>
          )}
          {onSignOut && (
            <button
              type="button"
              className="nav-user-dropdown-item nav-user-dropdown-item--danger"
              role="menuitem"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              {isSigningOut ? "Logging out..." : "Logout"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
