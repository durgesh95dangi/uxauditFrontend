"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { initializePaddle } from "@paddle/paddle-js";
import { resolveUserPlan, PLAN_STARTER } from "../../lib/audit/plans.js";
import { isPlanAtLeast } from "../../lib/billing/planRank.js";
import { getSupabaseBrowserClient } from "../../lib/supabase/client.js";

const FALLBACK_LABEL = "Get started";

export default function PricingPlanCta({
  planId,
  label = FALLBACK_LABEL,
  featured = false
}) {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [billingConfig, setBillingConfig] = useState(null);
  const [configLoaded, setConfigLoaded] = useState(false);
  const paddleRef = useRef(null);

  const priceId = billingConfig?.prices?.[planId] || "";
  const paddleToken = billingConfig?.clientToken || "";
  const paddleEnv = billingConfig?.environment === "production" ? "production" : "sandbox";
  const canCheckout = Boolean(paddleToken && priceId);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getUser();
        if (!cancelled) {
          setUser(data.user ?? null);
        }
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setAuthChecked(true);
      }
    }

    loadUser();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadBillingConfig() {
      try {
        const response = await fetch("/api/billing/config");
        if (!response.ok) throw new Error("config unavailable");
        const data = await response.json();
        if (!cancelled) {
          setBillingConfig(data);
        }
      } catch {
        if (!cancelled) {
          setBillingConfig(null);
        }
      } finally {
        if (!cancelled) {
          setConfigLoaded(true);
        }
      }
    }

    loadBillingConfig();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!canCheckout) return undefined;

    let cancelled = false;

    initializePaddle({
      token: paddleToken,
      environment: paddleEnv,
      checkout: {
        settings: {
          displayMode: "overlay",
          theme: "dark",
          successUrl: `${window.location.origin}/dashboard?upgraded=1`
        }
      }
    }).then((paddle) => {
      if (!cancelled && paddle) {
        paddleRef.current = paddle;
      }
    });

    return () => {
      cancelled = true;
    };
  }, [canCheckout, paddleEnv, paddleToken]);

  const openCheckout = useCallback(async () => {
    if (!user) {
      window.location.href = `/signup?redirect=${encodeURIComponent("/pricing")}&plan=${planId}`;
      return;
    }

    if (!canCheckout) {
      window.location.href = `/signup?redirect=${encodeURIComponent("/pricing")}&plan=${planId}`;
      return;
    }

    setLoading(true);
    try {
      const paddle =
        paddleRef.current ||
        (await initializePaddle({
          token: paddleToken,
          environment: paddleEnv,
          checkout: {
            settings: {
              displayMode: "overlay",
              theme: "dark",
              successUrl: `${window.location.origin}/dashboard?upgraded=1`
            }
          }
        }));

      if (!paddle) {
        throw new Error("Paddle failed to initialize");
      }

      paddleRef.current = paddle;

      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customData: {
          user_id: user.id
        },
        customer: user.email ? { email: user.email } : undefined
      });
    } catch (error) {
      window.alert(error?.message || "Could not open checkout. Try again.");
    } finally {
      setLoading(false);
    }
  }, [canCheckout, paddleEnv, paddleToken, planId, priceId, user]);

  const buttonClass = `btn btn-block btn-sm ${featured ? "btn-primary" : "btn-secondary"}`;
  const signupHref = `/signup?redirect=${encodeURIComponent("/pricing")}&plan=${planId}`;
  const currentPlan = user ? resolveUserPlan(user) : PLAN_STARTER;
  const isCurrentPlan =
    currentPlan === planId ||
    (planId === "founder" && currentPlan === "pro");
  const hasHigherPlan = !isCurrentPlan && isPlanAtLeast(currentPlan, planId);

  if (!authChecked || !configLoaded) {
    return (
      <button type="button" className={buttonClass} disabled>
        Loading…
      </button>
    );
  }

  if (!user) {
    return (
      <Link href={signupHref} className={buttonClass}>
        {label}
      </Link>
    );
  }

  if (isCurrentPlan) {
    return (
      <button type="button" className={buttonClass} disabled>
        Current plan
      </button>
    );
  }

  if (hasHigherPlan) {
    return (
      <button type="button" className={buttonClass} disabled>
        Included in your plan
      </button>
    );
  }

  return (
    <button
      type="button"
      className={buttonClass}
      onClick={openCheckout}
      disabled={loading}
    >
      {loading ? "Opening checkout…" : label}
    </button>
  );
}
