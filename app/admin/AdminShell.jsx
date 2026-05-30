"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOutToLogin } from "../../lib/auth/signOut.js";
import { useSupabase } from "../../lib/supabase/useSupabase.js";
import AdminLayout from "../../components/admin/AdminLayout.jsx";
import SiteNav from "../../components/layout/SiteNav.jsx";
import AdminPinGate from "./AdminPinGate.jsx";

export default function AdminShell({ user, needsPin, children }) {
  const router = useRouter();
  const { supabase } = useSupabase();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    if (!supabase) return;
    setIsSigningOut(true);
    await signOutToLogin(supabase, router, { next: "/admin" });
  }

  if (needsPin) {
    return (
      <div className="dashboard-shell admin-app">
        <SiteNav
          user={user}
          onSignOut={handleSignOut}
          isSigningOut={isSigningOut}
          brandHref="/admin/dashboard"
          hideBrand
          fullWidth
        />
        <main className="dashboard-main">
          <div className="dashboard-container">
            <AdminPinGate user={user} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <AdminLayout
      user={user}
      onSignOut={handleSignOut}
      isSigningOut={isSigningOut}
    >
      {children}
    </AdminLayout>
  );
}
