"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import SiteNav from "../layout/SiteNav.jsx";
import BrandLogo from "../layout/BrandLogo.jsx";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/reports", label: "Reports" }
];

const MOBILE_QUERY = "(max-width: 900px)";

function navActive(pathname, href) {
  if (href === "/admin/dashboard") {
    return pathname === "/admin" || pathname === "/admin/dashboard";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminLayout({
  user,
  onSignOut,
  isSigningOut = false,
  children
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const sync = () => {
      const mobile = media.matches;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  function toggleSidebar() {
    setSidebarOpen((open) => !open);
  }

  function closeSidebar() {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }

  return (
    <div
      className={`dashboard-shell admin-app${
        sidebarOpen ? " admin-app--sidebar-open" : " admin-app--sidebar-closed"
      }`}
    >
      {isMobile && sidebarOpen && (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          aria-label="Close menu"
          onClick={closeSidebar}
        />
      )}

      <aside className="admin-sidebar" aria-label="Admin navigation">
        <div className="admin-sidebar-brand">
          <BrandLogo href="/admin/dashboard" className="admin-sidebar-logo" />
        </div>

        <nav className="admin-sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-sidebar-link${
                navActive(pathname, item.href) ? " is-active" : ""
              }`}
              onClick={closeSidebar}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="admin-body">
        <SiteNav
          user={user}
          onSignOut={onSignOut}
          isSigningOut={isSigningOut}
          brandHref="/admin/dashboard"
          hideBrand
          showMenuButton
          menuOpen={sidebarOpen}
          onMenuToggle={toggleSidebar}
          fullWidth
        />

        <main className="dashboard-main admin-main">
          <div className="dashboard-container">{children}</div>
        </main>
      </div>
    </div>
  );
}
