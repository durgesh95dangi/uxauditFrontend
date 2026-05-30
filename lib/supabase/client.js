"use client";

import { createBrowserClient } from "@supabase/ssr";

let browserClient = null;
let initPromise = null;

const BUILD_PLACEHOLDER_URL = "https://build-placeholder.supabase.co";
const BUILD_PLACEHOLDER_KEY = "build-placeholder-anon-key";

function readBuildTimeCredentials() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return { supabaseUrl, supabaseAnonKey };
}

async function resolveCredentials() {
  const buildTime = readBuildTimeCredentials();
  if (buildTime) return buildTime;

  const response = await fetch("/api/config/public", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment"
    );
  }

  const data = await response.json();
  if (!data?.supabaseUrl || !data?.supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment"
    );
  }

  return {
    supabaseUrl: data.supabaseUrl,
    supabaseAnonKey: data.supabaseAnonKey
  };
}

export async function getSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  if (typeof window === "undefined") {
    const buildTime = readBuildTimeCredentials();
    if (buildTime) {
      browserClient = createBrowserClient(
        buildTime.supabaseUrl,
        buildTime.supabaseAnonKey
      );
      return browserClient;
    }

    return createBrowserClient(BUILD_PLACEHOLDER_URL, BUILD_PLACEHOLDER_KEY);
  }

  if (!initPromise) {
    initPromise = resolveCredentials().then(
      ({ supabaseUrl, supabaseAnonKey }) => {
        browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
        return browserClient;
      }
    );
  }

  return initPromise;
}
