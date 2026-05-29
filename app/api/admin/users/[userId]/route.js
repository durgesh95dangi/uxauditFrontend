import { requireSuperadminApi } from "../../../../../lib/auth/requireSuperadmin.js";
import {
  deleteAdminUser,
  updateAdminUser
} from "../../../../../lib/admin/mutations.js";
import { getAdminUser } from "../../../../../lib/admin/queries.js";

export const dynamic = "force-dynamic";

export async function GET(_request, context) {
  const gate = await requireSuperadminApi();
  if (!gate.ok) return gate.response;

  const params = await context.params;
  const userId = params?.userId;

  if (!userId) {
    return Response.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    const user = await getAdminUser(userId);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    return Response.json({ user });
  } catch (err) {
    return Response.json(
      { error: err?.message || "Could not load user" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, context) {
  const gate = await requireSuperadminApi();
  if (!gate.ok) return gate.response;

  const params = await context.params;
  const userId = params?.userId;

  if (!userId) {
    return Response.json({ error: "Missing userId" }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    await updateAdminUser(userId, {
      fullName: body?.fullName,
      password: body?.password
    });
    const user = await getAdminUser(userId);
    return Response.json({ user });
  } catch (err) {
    return Response.json(
      { error: err?.message || "Could not update user" },
      { status: 400 }
    );
  }
}

export async function DELETE(_request, context) {
  const gate = await requireSuperadminApi();
  if (!gate.ok) return gate.response;

  const params = await context.params;
  const userId = params?.userId;

  if (!userId) {
    return Response.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    const result = await deleteAdminUser(userId);
    return Response.json({ ok: true, ...result });
  } catch (err) {
    return Response.json(
      { error: err?.message || "Could not delete user" },
      { status: 400 }
    );
  }
}
