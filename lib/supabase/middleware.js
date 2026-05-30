import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { getPublicSupabaseConfig } from "./publicConfig.js";
import { getAuthCookieOptions } from "./cookieOptions.js";

export async function updateSession(request) {
  let response = NextResponse.next({
    request: { headers: request.headers }
  });

  const { supabaseUrl, supabaseAnonKey } = getPublicSupabaseConfig();
  if (!supabaseUrl || !supabaseAnonKey) {
    return { response, user: null };
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookieOptions: getAuthCookieOptions(),
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: { headers: request.headers }
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        }
      }
    });

    const {
      data: { user }
    } = await supabase.auth.getUser();

    return { response, user };
  } catch {
    return { response, user: null };
  }
}
