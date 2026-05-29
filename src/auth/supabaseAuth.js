import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "../storage/supabase.js";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

function assertAuthConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env");
  }
}

function getAuthClient() {
  assertAuthConfig();
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

export async function signUpWithEmail(email, password) {
  const client = getAuthClient();
  const { data, error } = await client.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email, password) {
  const client = getAuthClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOutWithAccessToken(accessToken) {
  const { error } = await supabase.auth.admin.signOut(accessToken);
  if (error) throw error;
  return { success: true };
}

export async function getUserFromAccessToken(accessToken) {
  const client = getAuthClient();
  const { data, error } = await client.auth.getUser(accessToken);
  if (error) throw error;
  return data?.user || null;
}

export async function refreshSession(refreshToken) {
  const client = getAuthClient();
  const { data, error } = await client.auth.refreshSession({ refresh_token: refreshToken });
  if (error) throw error;
  return data;
}

export async function requestPasswordReset(email, redirectTo) {
  const client = getAuthClient();
  const options = redirectTo ? { redirectTo } : undefined;
  const { error } = await client.auth.resetPasswordForEmail(email, options);
  if (error) throw error;
  return { success: true };
}

export async function resetPasswordWithToken(accessToken, newPassword) {
  if (!accessToken) throw new Error("Missing access token");
  if (!newPassword || newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const client = getAuthClient();
  const { data: userData, error: userErr } = await client.auth.getUser(accessToken);
  if (userErr) throw userErr;

  const userId = userData?.user?.id;
  if (!userId) throw new Error("Invalid or expired recovery token");

  const { error: updateErr } = await supabase.auth.admin.updateUserById(userId, {
    password: newPassword
  });
  if (updateErr) throw updateErr;

  return { success: true };
}
