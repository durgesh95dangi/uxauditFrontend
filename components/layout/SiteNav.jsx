"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BrandLogo from "./BrandLogo.jsx";
import UserNavMenu from "./UserNavMenu.jsx";
import AdminMenuToggle from "../admin/AdminMenuToggle.jsx";

const MOBILE_QUERY = "(max-width: 960px)";

const PUBLIC_NAV_LINKS = [
  { href: "/#why", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" }
];

const AUTHED_NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/pricing", label: "Pricing" },
  { href: "/profile", label: "Profile" }
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
  fullWidth = false
}) {
  const logoHref = brandHref || (user ? "/dashboard" : "/");
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const showSiteMobileMenu = isMobile && !showMenuButton;
  const drawerLinks = user
    ? user.isSuperadmin
      ? AUTHED_NAV_LINKS.filter((link) => link.href !== "/profile")
      : AUTHED_NAV_LINKS
    : PUBLIC_NAV_LINKS;
  const showDesktopLinks = !user && !minimal;

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const sync = () => {
      setIsMobile(media.matches);
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
    setMobileMenuOpen((open) => !open);
  }

  function handleMobileSignOut() {
    closeMobileMenu();
    onSignOut?.();
  }

  return (
    <>
      <header
        className={`nav-bar${mobileMenuOpen ? " nav-bar--menu-open" : ""}`}
      >
        <div
          className={`nav-bar-inner${
            hideBrand || showMenuButton ? " nav-bar-inner--no-brand" : ""
          }${showMenuButton ? " nav-bar-inner--with-menu" : ""}${
            fullWidth ? " nav-bar-inner--full-width" : ""
          }${showSiteMobileMenu ? " nav-bar-inner--mobile" : ""}`}
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

          {showSiteMobileMenu && (
            <button
              type="button"
              className="nav-mobile-toggle btn btn-ghost btn-sm"
              onClick={toggleMobileMenu}
              aria-expanded={mobileMenuOpen}
              aria-controls="site-mobile-nav"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <AdminMenuToggle open={mobileMenuOpen} />
            </button>
          )}

          {!hideBrand && !showMenuButton && (
            <BrandLogo href={logoHref} className="nav-brand" />
          )}

          <nav className="nav-links" aria-label="Main">
            {showDesktopLinks &&
              PUBLIC_NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href}>
                  {link.label}
                </a>
              ))}
          </nav>

          <div className="nav-actions">
            {user ? (
              <UserNavMenu
                user={user}
                onSignOut={onSignOut}
                isSigningOut={isSigningOut}
              />
            ) : (
              <div className="nav-actions-guest">
                <Link href="/login" className="btn btn-nav-ghost">
                  Log In
                </Link>
                <Link href="/signup" className="btn btn-nav-primary">
                  Start Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {showSiteMobileMenu && mobileMenuOpen && (
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
