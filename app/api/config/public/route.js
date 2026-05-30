import {
  getPublicAppConfig,
  hasPublicSupabaseConfig
} from "../../../../lib/supabase/publicConfig.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const config = getPublicAppConfig();

  if (!hasPublicSupabaseConfig(config)) {
    return Response.json(
      { error: "Supabase public configuration is not set on the server" },
      { status: 503 }
    );
  }

  return Response.json(
    {
      supabaseUrl: config.supabaseUrl,
      supabaseAnonKey: config.supabaseAnonKey,
      siteUrl: config.siteUrl
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
