import { NextResponse } from "next/server";
import { isSuperadmin } from "./lib/auth/superadmin.js";
import { updateSession } from "./lib/supabase/middleware.js";

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
    url.searchParams.set("redirectedFrom", pathname);
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
    url.pathname = isSuperadmin(user) ? "/admin" : "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (pathname === "/" && user) {
    const url = request.nextUrl.clone();
    url.pathname = isSuperadmin(user) ? "/admin" : "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password"
  ]
};
