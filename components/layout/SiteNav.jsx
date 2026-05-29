import Link from "next/link";
import BrandLogo from "./BrandLogo.jsx";
import UserNavMenu from "./UserNavMenu.jsx";
import AdminMenuToggle from "../admin/AdminMenuToggle.jsx";

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

  return (
    <header className="nav-bar">
      <div
        className={`nav-bar-inner${
          hideBrand || showMenuButton ? " nav-bar-inner--no-brand" : ""
        }${showMenuButton ? " nav-bar-inner--with-menu" : ""}${
          fullWidth ? " nav-bar-inner--full-width" : ""
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
          <BrandLogo href={logoHref} className="nav-brand" />
        )}

        <nav className="nav-links" aria-label="Main">
          {!user && !minimal && (
            <>
              <a href="/#features">Features</a>
              <a href="/#how-it-works">How it works</a>
              <a href="/#pricing">Pricing</a>
              <a href="/#faq">FAQ</a>
            </>
          )}
        </nav>

        <div className="nav-actions">
          {user ? (
            <UserNavMenu
              user={user}
              onSignOut={onSignOut}
              isSigningOut={isSigningOut}
            />
          ) : (
            <>
              <Link href="/login" className="btn btn-nav-ghost">
                Log In
              </Link>
              <Link href="/signup" className="btn btn-nav-primary">
                Start Free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
