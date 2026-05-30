"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { initializePaddle } from "@paddle/paddle-js";
import { resolveUserPlan, PLAN_STARTER } from "../../lib/audit/plans.js";
import { isPlanAtLeast } from "../../lib/billing/planRank.js";
import { getSupabaseBrowserClient } from "../../lib/supabase/client.js";

const PADDLE_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
const PADDLE_ENV =
  (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || "sandbox").toLowerCase() ===
  "production"
    ? "production"
    : "sandbox";

export default function PricingPlanCta({
  planId,
  priceId,
  label,
  featured = false,
  checkoutEnabled = false
}) {
  const [loading, setLoading] = useState(false);
  const [paddleReady, setPaddleReady] = useState(false);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const paddleRef = useRef(null);

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
    if (!checkoutEnabled || !PADDLE_TOKEN || !priceId) return undefined;

    let cancelled = false;

    initializePaddle({
      token: PADDLE_TOKEN,
      environment: PADDLE_ENV,
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
        setPaddleReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [checkoutEnabled, priceId]);

  const openCheckout = useCallback(async () => {
    if (!checkoutEnabled || !priceId || !PADDLE_TOKEN) return;

    if (!user) {
      window.location.href = `/signup?redirect=${encodeURIComponent("/pricing")}&plan=${planId}`;
      return;
    }

    setLoading(true);
    try {
      const paddle =
        paddleRef.current ||
        (await initializePaddle({
          token: PADDLE_TOKEN,
          environment: PADDLE_ENV,
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
  }, [checkoutEnabled, planId, priceId, user]);

  const buttonClass = `btn btn-block btn-sm ${featured ? "btn-primary" : "btn-secondary"}`;
  const currentPlan = user ? resolveUserPlan(user) : PLAN_STARTER;
  const isCurrentPlan =
    currentPlan === planId ||
    (planId === "founder" && currentPlan === "pro");
  const hasHigherPlan = !isCurrentPlan && isPlanAtLeast(currentPlan, planId);

  if (!checkoutEnabled || !priceId) {
    return (
      <button type="button" className={buttonClass} disabled>
        Coming soon
      </button>
    );
  }

  if (!authChecked) {
    return (
      <button type="button" className={buttonClass} disabled>
        Loading…
      </button>
    );
  }

  if (!user) {
    return (
      <Link
        href={`/signup?redirect=${encodeURIComponent("/pricing")}&plan=${planId}`}
        className={buttonClass}
      >
        Sign up to subscribe
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
      disabled={loading || !paddleReady}
    >
      {loading ? "Opening checkout…" : label}
    </button>
  );
}
