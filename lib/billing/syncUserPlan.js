import { PLAN_STARTER } from "../audit/plans.js";
import { supabase as adminClient } from "../../src/storage/supabase.js";

function resolvePlanSubscribedAt(metadata, plan, billing) {
  const previousPlan = metadata.plan;
  const planChanged = previousPlan && previousPlan !== plan;
  const upgradingToPaid = plan !== PLAN_STARTER;

  if (!upgradingToPaid) {
    return metadata.plan_subscribed_at ?? null;
  }

  if (metadata.plan_subscribed_at && !planChanged) {
    return metadata.plan_subscribed_at;
  }

  return billing.subscribedAt || new Date().toISOString();
}

export async function setUserBillingPlan(userId, plan, billing = {}) {
  if (!userId) {
    throw new Error("Missing userId for plan sync");
  }

  const { data: existing, error: fetchError } =
    await adminClient.auth.admin.getUserById(userId);

  if (fetchError || !existing?.user) {
    throw new Error(fetchError?.message || "User not found");
  }

  const metadata = existing.user.user_metadata || {};
  const planSubscribedAt = resolvePlanSubscribedAt(metadata, plan, billing);

  const { data, error } = await adminClient.auth.admin.updateUserById(userId, {
    user_metadata: {
      ...metadata,
      plan,
      plan_subscribed_at: planSubscribedAt,
      paddle_subscription_id:
        billing.subscriptionId ?? metadata.paddle_subscription_id ?? null,
      paddle_customer_id:
        billing.customerId ?? metadata.paddle_customer_id ?? null,
      paddle_price_id: billing.priceId ?? metadata.paddle_price_id ?? null,
      paddle_status: billing.status ?? metadata.paddle_status ?? null
    }
  });

  if (error) throw error;
  return data.user;
}

export async function downgradeUserToFree(userId, reason = "subscription_ended") {
  return setUserBillingPlan(userId, PLAN_STARTER, {
    subscriptionId: null,
    priceId: null,
    status: reason
  });
}
