"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BrandLogo from "./BrandLogo.jsx";
import UserNavMenu from "./UserNavMenu.jsx";
import UserAvatar from "./UserAvatar.jsx";
import AdminMenuToggle from "../admin/AdminMenuToggle.jsx";
import {
  resolveAvatarUrl,
  resolveFullName,
  resolveInitial
} from "../../lib/user/display.js";

const TABLET_MOBILE_QUERY = "(max-width: 1024px)";

const PUBLIC_NAV_LINKS = [
  { href: "/#why", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" }
];

export default function SiteNav({
  user = null,
  onSignOut,
  isSigningOut = false,
  minimal = false,
  brandHref = null,
  hideBrand = false,
  showMenuButton = false,
  menuOpen = false,
  onMenuToggle,
  fullWidth = false,
  interactionDisabled = false
}) {
  const logoHref = brandHref || (user ? "/dashboard" : "/");
  const [isCompactNav, setIsCompactNav] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const showSiteNavMenu = !showMenuButton;
  const drawerLinks = user ? [] : PUBLIC_NAV_LINKS;
  const showDesktopLinks = !user && !minimal;
  const desktopLinks = PUBLIC_NAV_LINKS;
  const showHeaderUserMenu = user && !(showSiteNavMenu && isCompactNav);
  const avatarUrl = user ? resolveAvatarUrl(user) : null;
  const profileName = user ? resolveFullName(user) : "";
  const profileInitial = user ? resolveInitial(user) : "";

  useEffect(() => {
    if (interactionDisabled) {
      setMobileMenuOpen(false);
    }
  }, [interactionDisabled]);

  useEffect(() => {
    const media = window.matchMedia(TABLET_MOBILE_QUERY);
    const sync = () => {
      setIsCompactNav(media.matches);
      if (!media.matches) {
        setMobileMenuOpen(false);
      }
    };

    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  function toggleMobileMenu() {
    if (interactionDisabled) return;
    setMobileMenuOpen((open) => !open);
  }

  function handleMobileSignOut() {
    closeMobileMenu();
    onSignOut?.();
  }

  return (
    <>
      <header
        className={`nav-bar${mobileMenuOpen ? " nav-bar--menu-open" : ""}${
          interactionDisabled ? " nav-bar--disabled" : ""
        }`}
        aria-busy={interactionDisabled || undefined}
      >
        <div
          className={`nav-bar-inner${
            hideBrand || showMenuButton ? " nav-bar-inner--no-brand" : ""
          }${showMenuButton ? " nav-bar-inner--with-menu" : ""}${
            fullWidth ? " nav-bar-inner--full-width" : ""
          }${showSiteNavMenu ? " nav-bar-inner--site" : ""}${
            user && showSiteNavMenu ? " nav-bar-inner--authed" : ""
          }`}
        >
          {showMenuButton && (
            <button
              type="button"
              className="admin-menu-toggle btn btn-ghost btn-sm"
              onClick={onMenuToggle}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              <AdminMenuToggle open={menuOpen} />
            </button>
          )}

          {!hideBrand && !showMenuButton && (
            <BrandLogo
              href={logoHref}
              className="nav-brand"
              disabled={interactionDisabled}
            />
          )}

          <nav className="nav-links" aria-label="Main" aria-hidden={interactionDisabled || undefined}>
            {showDesktopLinks &&
              desktopLinks.map((link) =>
                link.href.startsWith("/#") ? (
                  <a
                    key={link.href}
                    href={link.href}
                    tabIndex={interactionDisabled ? -1 : undefined}
                    aria-disabled={interactionDisabled || undefined}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    tabIndex={interactionDisabled ? -1 : undefined}
                    aria-disabled={interactionDisabled || undefined}
                  >
                    {link.label}
                  </Link>
                )
              )}
          </nav>

          <div className="nav-actions">
            {showHeaderUserMenu ? (
              <UserNavMenu
                user={user}
                onSignOut={onSignOut}
                isSigningOut={isSigningOut}
              />
            ) : !user ? (
              <div className="nav-actions-guest">
                <Link
                  href="/login"
                  className="btn btn-nav-ghost"
                  tabIndex={interactionDisabled ? -1 : undefined}
                  aria-disabled={interactionDisabled || undefined}
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="btn btn-nav-primary"
                  tabIndex={interactionDisabled ? -1 : undefined}
                  aria-disabled={interactionDisabled || undefined}
                >
                  Start Free
                </Link>
              </div>
            ) : null}
          </div>

          {showSiteNavMenu && (
            <button
              type="button"
              className="nav-mobile-toggle btn btn-ghost btn-sm"
              onClick={toggleMobileMenu}
              disabled={interactionDisabled}
              aria-expanded={mobileMenuOpen}
              aria-controls="site-mobile-nav"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <AdminMenuToggle open={mobileMenuOpen} />
            </button>
          )}
        </div>
      </header>

      {showSiteNavMenu && isCompactNav && mobileMenuOpen && !interactionDisabled && (
        <>
          <button
            type="button"
            className="nav-mobile-backdrop"
            aria-label="Close menu"
            onClick={closeMobileMenu}
          />
          <div
            id="site-mobile-nav"
            className="nav-mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
          >
            {user && (
              <div className="nav-mobile-drawer-profile">
                <span className="nav-mobile-drawer-profile-avatar">
                  {avatarUrl ? (
                    <UserAvatar
                      src={avatarUrl}
                      size={40}
                      className="nav-mobile-drawer-profile-avatar-img"
                    />
                  ) : (
                    <span className="nav-mobile-drawer-profile-avatar-fallback">
                      {profileInitial}
                    </span>
                  )}
                </span>
                <div className="nav-mobile-drawer-profile-meta">
                  <strong>{profileName}</strong>
                  {user.email && <span>{user.email}</span>}
                </div>
              </div>
            )}

            <nav className="nav-mobile-drawer-links" aria-label="Main">
              {drawerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="nav-mobile-drawer-link"
                  onClick={closeMobileMenu}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {!user && (
              <div className="nav-mobile-drawer-actions">
                <Link
                  href="/login"
                  className="btn btn-secondary btn-block"
                  onClick={closeMobileMenu}
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="btn btn-primary btn-block"
                  onClick={closeMobileMenu}
                >
                  Start Free
                </Link>
              </div>
            )}

            {user && onSignOut && (
              <div className="nav-mobile-drawer-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-block nav-mobile-drawer-signout"
                  onClick={handleMobileSignOut}
                  disabled={isSigningOut}
                >
                  {isSigningOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
