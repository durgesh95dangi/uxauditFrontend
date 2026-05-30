export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const environment =
    (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || "sandbox").toLowerCase() ===
    "production"
      ? "production"
      : "sandbox";

  return Response.json({
    environment,
    clientToken: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || "",
    prices: {
      founder: process.env.NEXT_PUBLIC_PADDLE_PRICE_FOUNDER || "",
      agency: process.env.NEXT_PUBLIC_PADDLE_PRICE_AGENCY || ""
    }
  });
}
