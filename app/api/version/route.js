export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const APP_VERSION = "2026-05-30-pricing-v2";

export async function GET() {
  return Response.json(
    {
      appVersion: APP_VERSION,
      gitCommit:
        process.env.RAILWAY_GIT_COMMIT_SHA ||
        process.env.VERCEL_GIT_COMMIT_SHA ||
        null,
      gitBranch:
        process.env.RAILWAY_GIT_BRANCH ||
        process.env.VERCEL_GIT_COMMIT_REF ||
        null,
      nodeEnv: process.env.NODE_ENV || null,
      pricing: {
        title: "Free, Founder & Agency Plans",
        plans: ["free", "founder", "agency"],
        paddleConfigRoute: true
      },
      builtAt: new Date().toISOString()
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
