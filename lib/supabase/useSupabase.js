"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "./client.js";

export function useSupabase() {
  const [supabase, setSupabase] = useState(null);
  const [configError, setConfigError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    getSupabaseBrowserClient()
      .then((client) => {
        if (!cancelled) setSupabase(client);
      })
      .catch((error) => {
        if (!cancelled) {
          setConfigError(
            error?.message || "Could not connect to authentication service"
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    supabase,
    configError,
    ready: Boolean(supabase)
  };
}
