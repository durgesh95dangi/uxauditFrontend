export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !supabaseAnonKey) {
    return Response.json(
      { error: "Supabase public configuration is not set on the server" },
      { status: 503 }
    );
  }

  return Response.json(
    {
      supabaseUrl,
      supabaseAnonKey
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
