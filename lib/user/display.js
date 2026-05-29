const NAME_MAX_LENGTH = 10;

export function resolveAvatarUrl(user = {}) {
  const metadata = user.user_metadata || {};
  return (
    user.avatarUrl ||
    metadata.avatar_url ||
    metadata.picture ||
    metadata.avatar ||
    null
  );
}

export function resolveFullName(user = {}) {
  const metadata = user.user_metadata || {};
  const name =
    user.fullName ||
    metadata.full_name ||
    metadata.name ||
    metadata.fullName ||
    "";

  const trimmed = String(name).trim();
  if (trimmed) return trimmed;

  const email = user.email;
  if (email) {
    const local = String(email).split("@")[0];
    if (local) return local;
  }

  return "User";
}

export function resolveFirstName(fullName) {
  const trimmed = String(fullName || "").trim();
  if (!trimmed) return "";
  return trimmed.split(/\s+/)[0];
}

export function truncateName(name, maxLength = NAME_MAX_LENGTH) {
  const trimmed = String(name || "").trim();
  if (!trimmed) return "";
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength)}…`;
}

export function resolveNavName(user = {}) {
  const fullName = resolveFullName(user);
  const firstName = resolveFirstName(fullName);
  return truncateName(firstName || fullName, NAME_MAX_LENGTH);
}

export function resolveInitial(user = {}) {
  const fullName = resolveFullName(user);
  const firstName = resolveFirstName(fullName);
  const letter = (firstName || fullName).charAt(0).toUpperCase();
  return letter || "U";
}
