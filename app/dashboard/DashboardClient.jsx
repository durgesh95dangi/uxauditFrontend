"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PLAN_STARTER, resolveUserPlan, getPlanLabel, getMonthlyAuditLimitForUser } from "../../lib/audit/plans.js";
import { signOutToLogin } from "../../lib/auth/signOut.js";
import { useSupabase } from "../../lib/supabase/useSupabase.js";
import AuditInput from "../../components/audit/AuditInput.jsx";
import AuditProgress from "../../components/audit/AuditProgress.jsx";
import AuditReport from "../../components/audit/AuditReport.jsx";
import RecentAudits from "../../components/audit/RecentAudits.jsx";
import UpgradeSuccessBanner from "../../components/billing/UpgradeSuccessBanner.jsx";
import SiteNav from "../../components/layout/SiteNav.jsx";

export default function DashboardClient({ user: initialUser }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { supabase } = useSupabase();

  const [user, setUser] = useState(initialUser);
  const [view, setView] = useState("input");
  const [jobId, setJobId] = useState(null);
  const [activeReportJobId, setActiveReportJobId] = useState(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [upgradeSyncing, setUpgradeSyncing] = useState(false);
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);

  useEffect(() => {
    if (searchParams.get("upgraded") !== "1") return undefined;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 12;

    setUpgradeSyncing(true);
    setShowUpgradeBanner(true);

    async function syncSubscriptionPlan() {
      if (cancelled || !supabase) return;

      await supabase.auth.refreshSession();
      const { data } = await supabase.auth.getUser();
      const authUser = data.user;

      if (authUser) {
        const plan = resolveUserPlan(authUser);
        const monthlyAuditLimit = getMonthlyAuditLimitForUser(authUser);

        setUser((prev) => ({
          ...prev,
          plan,
          planLabel: getPlanLabel(plan),
          monthlyAuditLimit
        }));

        if (plan !== PLAN_STARTER || attempts >= maxAttempts) {
          setUpgradeSyncing(false);
          router.replace("/dashboard");
          return;
        }
      }

      attempts += 1;
      if (attempts < maxAttempts) {
        window.setTimeout(syncSubscriptionPlan, 2000);
      } else {
        setUpgradeSyncing(false);
        router.replace("/dashboard");
      }
    }

    syncSubscriptionPlan();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams, supabase]);

  function handleJobStart(newJobId) {
    setJobId(newJobId);
    setView("progress");
  }

  function handleComplete(completedJobId) {
    setActiveReportJobId(completedJobId);
    setView("report");
  }

  function handleViewReport(reportJobId) {
    setActiveReportJobId(reportJobId);
    setView("report");
  }

  function handleViewProgress(runningJobId) {
    setJobId(runningJobId);
    setView("progress");
  }

  function handleBackToReports() {
    setView("input");
  }

  async function handleSignOut() {
    if (!supabase) return;
    setIsSigningOut(true);
    await signOutToLogin(supabase, router);
  }

  return (
    <div className="dashboard-shell">
      <SiteNav
        user={user}
        onSignOut={handleSignOut}
        isSigningOut={isSigningOut}
      />

      <main className="dashboard-main">
        <div className="dashboard-container">
          {showUpgradeBanner && view === "input" && (
            <UpgradeSuccessBanner
              planLabel={user.planLabel}
              monthlyLimit={user.monthlyAuditLimit}
              syncing={upgradeSyncing}
              onDismiss={() => setShowUpgradeBanner(false)}
            />
          )}

          {view === "input" && (
            <div className="dashboard-panels">
              <AuditInput
                onJobStart={handleJobStart}
                planLabel={user.planLabel}
                monthlyLimit={user.monthlyAuditLimit}
              />
              <RecentAudits
                userId={user.id}
                onViewReport={handleViewReport}
                onViewProgress={handleViewProgress}
              />
            </div>
          )}

          {view === "progress" && jobId && (
            <AuditProgress
              jobId={jobId}
              onComplete={handleComplete}
              onBackToReports={handleBackToReports}
            />
          )}

          {view === "report" && activeReportJobId && (
            <AuditReport
              jobId={activeReportJobId}
              onBackToReports={handleBackToReports}
            />
          )}
        </div>
      </main>
    </div>
  );
}
