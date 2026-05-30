"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getAuthCookieOptions } from "./cookieOptions.js";

let browserClient = null;
let initPromise = null;

const BUILD_PLACEHOLDER_URL = "https://build-placeholder.supabase.co";
const BUILD_PLACEHOLDER_KEY = "build-placeholder-anon-key";

function readRuntimeInjectedCredentials() {
  if (typeof window === "undefined") return null;

  const config = window.__UXAUDITX_PUBLIC_CONFIG__;
  if (!config?.supabaseUrl || !config?.supabaseAnonKey) {
    return null;
  }

  return {
    supabaseUrl: config.supabaseUrl,
    supabaseAnonKey: config.supabaseAnonKey
  };
}

function readBuildTimeCredentials() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return { supabaseUrl, supabaseAnonKey };
}

async function fetchPublicConfig() {
  const response = await fetch("/api/config/public", {
    cache: "no-store",
    credentials: "same-origin"
  });

  if (!response.ok) {
    throw new Error(
      "Authentication is unavailable. Please refresh the page and try again."
    );
  }

  const data = await response.json();
  if (!data?.supabaseUrl || !data?.supabaseAnonKey) {
    throw new Error(
      "Authentication is unavailable. Please refresh the page and try again."
    );
  }

  return {
    supabaseUrl: data.supabaseUrl,
    supabaseAnonKey: data.supabaseAnonKey
  };
}

async function resolveCredentials() {
  const injected = readRuntimeInjectedCredentials();
  if (injected) return injected;

  const buildTime = readBuildTimeCredentials();
  if (buildTime) return buildTime;

  return fetchPublicConfig();
}

function createClient(supabaseUrl, supabaseAnonKey) {
  browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: getAuthCookieOptions()
  });
  return browserClient;
}

export async function getSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  if (typeof window === "undefined") {
    const buildTime = readBuildTimeCredentials();
    if (buildTime) {
      return createClient(buildTime.supabaseUrl, buildTime.supabaseAnonKey);
    }

    return createBrowserClient(BUILD_PLACEHOLDER_URL, BUILD_PLACEHOLDER_KEY, {
      cookieOptions: getAuthCookieOptions()
    });
  }

  if (!initPromise) {
    initPromise = resolveCredentials()
      .then(({ supabaseUrl, supabaseAnonKey }) =>
        createClient(supabaseUrl, supabaseAnonKey)
      )
      .catch((error) => {
        initPromise = null;
        throw error;
      });
  }

  return initPromise;
}
