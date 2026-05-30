# Paddle billing setup (UXAuditX)

Use this guide to connect your **approved Paddle Billing** account to UXAuditX.

## 1. Create products & prices in Paddle

1. Log in to [Paddle Dashboard](https://vendors.paddle.com/) → **Catalog** → **Products**.
2. Create two subscription products:

| Plan | Price | Billing |
|------|-------|---------|
| **Founder** | $19 | Monthly recurring |
| **Agency** | $199 | Monthly recurring |

3. Open each **Price** and copy the **Price ID** (starts with `pri_`).

## 2. Get API credentials

In Paddle → **Developer tools** → **Authentication**:

| Key | Where it goes |
|-----|----------------|
| **Client-side token** | `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` |
| **API key** (server) | `PADDLE_API_KEY` |

Use **Sandbox** keys while testing, **Live** keys for production.

## 3. Create a webhook destination

1. Paddle → **Developer tools** → **Notifications** → **New destination**.
2. **URL:** `https://uxauditx.com/api/billing/paddle/webhook`  
   (local test: use [ngrok](https://ngrok.com/) → `https://YOUR-ID.ngrok.io/api/billing/paddle/webhook`)
3. Subscribe to events:
   - `subscription.activated`
   - `subscription.updated`
   - `subscription.canceled`
   - `subscription.past_due`
   - `subscription.paused`
   - `subscription.resumed`
4. Copy the **Webhook secret key** → `PADDLE_WEBHOOK_SECRET`.

## 4. Add environment variables

Add to `.env` locally and **Railway → Variables** in production:

```env
# sandbox | production
PADDLE_ENVIRONMENT=sandbox
NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox

NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=your_client_token
PADDLE_API_KEY=your_api_key
PADDLE_WEBHOOK_SECRET=your_webhook_secret

NEXT_PUBLIC_PADDLE_PRICE_FOUNDER=pri_xxxxxxxx
NEXT_PUBLIC_PADDLE_PRICE_AGENCY=pri_xxxxxxxx
```

Redeploy after saving variables.

## 5. Test the flow

1. Start the app: `npm run dev`
2. Sign up / log in at `/signup`
3. Open `/pricing` → click **Subscribe** on Founder or Agency
4. Complete checkout in Paddle **sandbox** (test card from Paddle docs)
5. Confirm webhook fired: Paddle → Notifications → delivery log
6. User metadata in Supabase should show `plan: "founder"` or `"agency"`
7. Run an audit — limit should be **5** (Founder) or **50** (Agency)

## How it works in code

```
User clicks Subscribe → Paddle overlay checkout
        ↓
customData.user_id sent with checkout
        ↓
Paddle webhook → /api/billing/paddle/webhook
        ↓
Updates Supabase user_metadata.plan
        ↓
getMonthlyAuditLimitForUser() enforces limits
```

## Custom pricing (50+ audits)

Agency is capped at 50/month in app logic. For higher volume, keep the **Contact us** link on pricing (`hello@uxauditx.com`) and manually set `plan: "agency"` or a custom limit in Supabase until custom tiers are built.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Button says "Coming soon" | Set `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` + price IDs |
| Checkout opens but plan not updated | Check webhook URL, secret, and delivery logs |
| Invalid signature | Use raw webhook body; secret must match destination |
| User still on free after pay | Ensure checkout includes `customData.user_id` (logged-in user) |

## Go live

1. Switch Paddle to **Live** mode
2. Create live products/prices (new `pri_` IDs)
3. Update env vars with **live** tokens, keys, secrets, and price IDs
4. Set `PADDLE_ENVIRONMENT=production` and `NEXT_PUBLIC_PADDLE_ENVIRONMENT=production`
5. Point webhook to `https://uxauditx.com/api/billing/paddle/webhook`
