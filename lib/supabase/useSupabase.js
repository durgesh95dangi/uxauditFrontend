"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "./client.js";

export function useSupabase() {
  const [supabase, setSupabase] = useState(null);
  const [configError, setConfigError] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadClient = useCallback(async () => {
    setLoading(true);
    setConfigError(null);

    try {
      const client = await getSupabaseBrowserClient();
      setSupabase(client);
    } catch (error) {
      setSupabase(null);
      setConfigError(
        error?.message || "Could not connect to authentication service"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClient();
  }, [loadClient]);

  return {
    supabase,
    configError,
    loading,
    ready: Boolean(supabase),
    retry: loadClient
  };
}
