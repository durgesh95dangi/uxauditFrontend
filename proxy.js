import { NextResponse } from "next/server";
import { isSuperadmin } from "./lib/auth/superadmin.js";
import { updateSession } from "./lib/supabase/middleware.js";

const MARKETING_PATHS = [
  "/how-it-works",
  "/landing-page-audit",
  "/free-website-audit-tool",
  "/website-usability-checklist",
  "/why-is-my-website-not-converting",
  "/what-is-a-ux-audit"
];

function getAuthedHomePath(user) {
  return isSuperadmin(user) ? "/admin" : "/dashboard";
}

function isMarketingPath(pathname) {
  return MARKETING_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export async function proxy(request) {
  const { response, user } = await updateSession(request);

  const { pathname } = request.nextUrl;
  const isGuestAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password";
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/admin");

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isSuperadmin(user)) {
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/profile")) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  if (isGuestAuthPage && user) {
    const url = request.nextUrl.clone();
    const next = request.nextUrl.searchParams.get("next");
    const redirect = request.nextUrl.searchParams.get("redirect");
    const plan = request.nextUrl.searchParams.get("plan");

    if (next && next.startsWith("/") && !next.startsWith("//")) {
      url.pathname = next;
      url.search = "";
    } else if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
      url.pathname = redirect;
      url.search = plan ? `?plan=${encodeURIComponent(plan)}` : "";
    } else if (plan === "founder" || plan === "agency") {
      url.pathname = "/pricing";
      url.search = `?plan=${encodeURIComponent(plan)}`;
    } else {
      url.pathname = getAuthedHomePath(user);
      url.search = "";
    }

    return NextResponse.redirect(url);
  }

  if (user && (pathname === "/" || isMarketingPath(pathname))) {
    const url = request.nextUrl.clone();
    url.pathname = getAuthedHomePath(user);
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/pricing",
    "/how-it-works",
    "/landing-page-audit",
    "/free-website-audit-tool",
    "/website-usability-checklist",
    "/why-is-my-website-not-converting",
    "/what-is-a-ux-audit",
    "/dashboard/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/auth/callback"
  ]
};
