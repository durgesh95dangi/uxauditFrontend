"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowserClient } from "../../lib/supabase/client.js";
import AdminLayout from "../../components/admin/AdminLayout.jsx";
import SiteNav from "../../components/layout/SiteNav.jsx";
import AdminPinGate from "./AdminPinGate.jsx";

export default function AdminShell({ user, needsPin, children }) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    await supabase.auth.signOut();
    router.push("/login?next=/admin");
    router.refresh();
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
