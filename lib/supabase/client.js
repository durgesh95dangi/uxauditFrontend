"use client";

import { createBrowserClient } from "@supabase/ssr";

let browserClient = null;

const BUILD_PLACEHOLDER_URL = "https://build-placeholder.supabase.co";
const BUILD_PLACEHOLDER_KEY = "build-placeholder-anon-key";

export function getSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === "undefined") {
      // Allow `next build` to prerender client pages when Railway env
      // isn't injected into the Docker build layer yet.
      return createBrowserClient(BUILD_PLACEHOLDER_URL, BUILD_PLACEHOLDER_KEY);
    }

    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment"
    );
  }

  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }

  return browserClient;
}
