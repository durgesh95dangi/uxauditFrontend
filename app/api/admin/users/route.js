import { requireSuperadminApi } from "../../../../lib/auth/requireSuperadmin.js";
import { createAdminUser } from "../../../../lib/admin/mutations.js";
import { listAdminUsers } from "../../../../lib/admin/queries.js";

export const dynamic = "force-dynamic";

function mapCreatedUser(user, auditCount = 0) {
  return {
    id: user.id,
    email: user.email || "—",
    fullName: user.user_metadata?.full_name || user.user_metadata?.name || null,
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at,
    emailVerified: Boolean(user.email_confirmed_at),
    provider: user.app_metadata?.provider || "email",
    auditCount,
    auditsDone: 0,
    auditsFailed: 0
  };
}

export async function GET() {
  const gate = await requireSuperadminApi();
  if (!gate.ok) return gate.response;

  try {
    const users = await listAdminUsers();
    return Response.json({ users });
  } catch (error) {
    return Response.json(
      { error: error?.message || "Could not load users" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const gate = await requireSuperadminApi();
  if (!gate.ok) return gate.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const user = await createAdminUser({
      email: body?.email,
      password: body?.password,
      fullName: body?.fullName
    });
    return Response.json({ user: mapCreatedUser(user) }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error?.message || "Could not create user" },
      { status: 400 }
    );
  }
}
