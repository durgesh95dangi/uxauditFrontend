/** Keep auth cookies for 1 year unless the user signs out. */
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function getAuthCookieOptions() {
  return {
    maxAge: AUTH_COOKIE_MAX_AGE,
    sameSite: "lax",
    path: "/"
  };
}
