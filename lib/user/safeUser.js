import { isSuperadmin } from "../auth/superadmin.js";
import {
  getMonthlyAuditLimitForUser,
  getPlanLabel,
  resolveUserPlan
} from "../audit/plans.js";

export function toSafeUser(user) {
  if (!user) return null;

  const identities = user.identities || [];
  const isGoogle =
    user.app_metadata?.provider === "google" ||
    identities.some((identity) => identity.provider === "google");
  const plan = resolveUserPlan(user);
  const monthlyAuditLimit = getMonthlyAuditLimitForUser(user);

  return {
    id: user.id,
    email: user.email,
    fullName: user.user_metadata?.full_name || user.user_metadata?.name || null,
    avatarUrl:
      user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
    authProvider: isGoogle ? "google" : "email",
    emailVerified: Boolean(user.email_confirmed_at),
    createdAt: user.created_at || null,
    lastSignInAt: user.last_sign_in_at || null,
    isSuperadmin: isSuperadmin(user),
    plan,
    planLabel: getPlanLabel(plan),
    monthlyAuditLimit
  };
}
