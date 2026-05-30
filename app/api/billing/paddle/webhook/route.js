import { handlePaddleWebhook } from "../../../../../lib/billing/paddleWebhook.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  const signature = request.headers.get("paddle-signature");
  if (!signature) {
    return Response.json({ error: "Missing Paddle-Signature header" }, { status: 400 });
  }

  let rawBody;
  try {
    rawBody = await request.text();
  } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  try {
    const eventType = await handlePaddleWebhook(rawBody, signature);
    return Response.json({ received: true, eventType });
  } catch (error) {
    console.error("[paddle/webhook]", error?.message || error);
    return Response.json(
      { error: error?.message || "Webhook processing failed" },
      { status: 400 }
    );
  }
}
