import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function hasSupabaseConfig() {
  return Boolean(url && key);
}

function assertSupabaseConfig() {
  if (!hasSupabaseConfig()) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  }
}

export const supabase = createClient(url || "https://example.supabase.co", key || "missing-key");

function isMissingScreenshotsTableError(error) {
  const msg = error?.message?.toLowerCase?.() || "";
  const details = error?.details?.toLowerCase?.() || "";
  const hint = error?.hint?.toLowerCase?.() || "";
  const combined = `${msg}\n${details}\n${hint}`;

  return (
    (combined.includes("relation") && combined.includes("does not exist")) ||
    (combined.includes("could not find the table") && combined.includes("screenshots")) ||
    (combined.includes("schema cache") && combined.includes("screenshots"))
  );
}

export async function testConnection() {
  assertSupabaseConfig();
  const { error } = await supabase.from("screenshots").select("id").limit(1);

  if (error) {
    if (isMissingScreenshotsTableError(error)) {
      console.log("Table not created yet, run setup-db");
      return;
    }

    throw error;
  }

  console.log("Supabase connected");
}
