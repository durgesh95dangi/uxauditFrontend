"use client";

import Link from "next/link";

export default function UpgradeSuccessBanner({
  planLabel,
  monthlyLimit,
  syncing = false,
  onDismiss
}) {
  return (
    <div className="dashboard-upgrade-banner" role="status">
      <div className="dashboard-upgrade-banner-body">
        {syncing ? (
          <p>Confirming your subscription…</p>
        ) : (
          <p>
            You&apos;re on the <strong>{planLabel}</strong> plan
            {monthlyLimit != null ? (
              <>
                {" "}
                — <strong>{monthlyLimit}</strong> audits per month
              </>
            ) : null}
            .
          </p>
        )}
        {!syncing && (
          <p className="dashboard-upgrade-banner-sub">
            Your limit is active now. Run an audit below or{" "}
            <Link href="/profile">view your profile</Link>.
          </p>
        )}
      </div>
      {!syncing && onDismiss && (
        <button
          type="button"
          className="btn btn-ghost btn-sm dashboard-upgrade-banner-dismiss"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
