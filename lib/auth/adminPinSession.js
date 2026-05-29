import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "uxa_admin_pin";
const MAX_AGE_SEC = 60 * 60 * 12; // 12 hours

function sessionSecret() {
  const pin = process.env.SUPERADMIN_PIN;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!pin) return null;
  return `${pin}:${key || "uxauditx"}`;
}

function sign(userId, exp) {
  const secret = sessionSecret();
  if (!secret) return null;
  return createHmac("sha256", secret).update(`${userId}.${exp}`).digest("hex");
}

function buildToken(userId) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SEC;
  const signature = sign(userId, exp);
  if (!signature) return null;
  return `${userId}.${exp}.${signature}`;
}

function parseToken(raw) {
  if (!raw || typeof raw !== "string") return null;
  const parts = raw.split(".");
  if (parts.length !== 3) return null;

  const [userId, expRaw, signature] = parts;
  const exp = Number(expRaw);
  if (!userId || !Number.isFinite(exp) || !signature) return null;

  const expected = sign(userId, exp);
  if (!expected) return null;

  try {
    const a = Buffer.from(signature, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  if (exp < Math.floor(Date.now() / 1000)) return null;
  return { userId, exp };
}

export function verifyAdminPin(pin) {
  const expected = process.env.SUPERADMIN_PIN;
  if (!expected || !pin) return false;

  const a = Buffer.from(String(pin).trim());
  const b = Buffer.from(String(expected).trim());
  if (a.length !== b.length) return false;

  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function hasAdminPinSession(userId) {
  if (!userId || !sessionSecret()) return false;

  const cookieStore = await cookies();
  const token = parseToken(cookieStore.get(COOKIE_NAME)?.value);
  return token?.userId === userId;
}

export async function setAdminPinSession(userId) {
  const token = buildToken(userId);
  if (!token) return false;

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SEC,
    path: "/"
  });

  return true;
}

export async function clearAdminPinSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/"
  });
}
