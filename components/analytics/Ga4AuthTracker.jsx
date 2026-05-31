"use client";

import { useEffect } from "react";
import { setGa4UserId } from "../../lib/analytics/ga4.js";
import { useSupabase } from "../../lib/supabase/useSupabase.js";

/**
 * Syncs Supabase auth UUID to GA4 user_id on login/logout/session refresh.
 * Only the opaque user.id is sent — never email or other PII.
 */
export default function Ga4AuthTracker() {
  const { supabase } = useSupabase();

  useEffect(() => {
    if (!supabase) return undefined;

    supabase.auth.getUser().then(({ data }) => {
      setGa4UserId(data.user?.id ?? null);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setGa4UserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return null;
}
