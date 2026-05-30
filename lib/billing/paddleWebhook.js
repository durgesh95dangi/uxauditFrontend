import { Environment, Paddle } from "@paddle/paddle-node-sdk";
import { resolvePlanFromPriceId } from "./paddleConfig.js";
import {
  downgradeUserToFree,
  setUserBillingPlan
} from "./syncUserPlan.js";
import { PLAN_STARTER } from "../audit/plans.js";

function getPaddleClient() {
  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing PADDLE_API_KEY");
  }

  const environment =
    (process.env.PADDLE_ENVIRONMENT || "sandbox").toLowerCase() === "production"
      ? Environment.production
      : Environment.sandbox;

  return new Paddle(apiKey, { environment });
}

function readCustomUserId(entity) {
  const custom = entity?.customData || entity?.custom_data || {};
  return custom.user_id || custom.userId || null;
}

function readPrimaryPriceId(subscription) {
  const items = subscription?.items || [];
  const first = items[0];
  return first?.price?.id || first?.price_id || null;
}

function readCustomerId(subscription) {
  return subscription?.customerId || subscription?.customer_id || null;
}

async function syncSubscription(subscription, fallbackPlan = null) {
  const userId = readCustomUserId(subscription);
  if (!userId) {
    console.warn("[paddleWebhook] subscription missing customData.user_id");
    return;
  }

  const priceId = readPrimaryPriceId(subscription);
  const plan = resolvePlanFromPriceId(priceId) || fallbackPlan;
  const status = subscription?.status || null;

  if (!plan || plan === PLAN_STARTER || status === "canceled") {
    await downgradeUserToFree(userId, status || "canceled");
    console.log(`[paddleWebhook] ${userId} downgraded to free (${status})`);
    return;
  }

  await setUserBillingPlan(userId, plan, {
    subscriptionId: subscription.id,
    customerId: readCustomerId(subscription),
    priceId,
    status
  });

  console.log(`[paddleWebhook] ${userId} synced to ${plan} (${status})`);
}

export async function handlePaddleWebhook(rawBody, signatureHeader) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("Missing PADDLE_WEBHOOK_SECRET");
  }

  const paddle = getPaddleClient();
  const event = await paddle.webhooks.unmarshal(rawBody, secret, signatureHeader);

  switch (event.eventType) {
    case "subscription.activated":
    case "subscription.updated":
    case "subscription.resumed":
      await syncSubscription(event.data);
      break;
    case "subscription.canceled":
    case "subscription.past_due":
    case "subscription.paused":
      await syncSubscription(event.data, PLAN_STARTER);
      break;
    default:
      console.log(`[paddleWebhook] Ignored event ${event.eventType}`);
  }

  return event.eventType;
}
