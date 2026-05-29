function parseAllowList(raw) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

const allowedEmails = parseAllowList(process.env.SUPERADMIN_EMAILS);
const allowedUserIds = parseAllowList(process.env.SUPERADMIN_USER_IDS);

export function getSuperadminEmails() {
  return allowedEmails;
}

export function isSuperadminEmail(email) {
  if (!email) return false;
  return allowedEmails.includes(email.toLowerCase());
}

export function isSuperadmin(user) {
  if (!user?.id) return false;

  if (allowedUserIds.length > 0 && allowedUserIds.includes(user.id.toLowerCase())) {
    return true;
  }

  if (allowedEmails.length > 0 && user.email) {
    return allowedEmails.includes(user.email.toLowerCase());
  }

  return false;
}

export function superadminConfigured() {
  return allowedEmails.length > 0 || allowedUserIds.length > 0;
}
