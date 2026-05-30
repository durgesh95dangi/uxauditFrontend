"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import SiteNav from "../../components/layout/SiteNav.jsx";
import SiteFooter from "../../components/layout/SiteFooter.jsx";
import PricingSection from "../../components/landing/PricingSection.jsx";
import { signOutToLogin } from "../../lib/auth/signOut.js";
import { useSupabase } from "../../lib/supabase/useSupabase.js";

export default function PricingPageClient({ user }) {
  const router = useRouter();
  const { supabase } = useSupabase();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    if (!supabase) return;
    setIsSigningOut(true);
    await signOutToLogin(supabase, router);
  }

  return (
    <div className={`page-shell${user ? " dashboard-shell" : ""}`}>
      <SiteNav
        user={user}
        onSignOut={user ? handleSignOut : undefined}
        isSigningOut={isSigningOut}
        minimal={!user}
      />
      <main className={user ? "dashboard-main" : undefined}>
        <div className={user ? "dashboard-container" : undefined}>
          <PricingSection withAnchor={false} user={user} />
        </div>
      </main>
      {!user && <SiteFooter />}
    </div>
  );
}
