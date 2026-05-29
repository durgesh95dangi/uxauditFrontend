import { supabase as adminClient } from "../../src/storage/supabase.js";
import { isSuperadminEmail } from "../auth/superadmin.js";

async function deleteAuditJobRecords(jobId) {
  const issuesResult = await adminClient.from("issues").delete().eq("job_id", jobId);
  if (issuesResult.error) throw issuesResult.error;

  const screenshotsResult = await adminClient
    .from("screenshots")
    .delete()
    .eq("job_id", jobId);
  if (screenshotsResult.error) throw screenshotsResult.error;

  const jobResult = await adminClient.from("audit_jobs").delete().eq("id", jobId);
  if (jobResult.error) throw jobResult.error;
}

async function deleteAuditJobFiles(jobId) {
  try {
    const { deleteJobFiles } = await import("../engine/storage/r2.js");
    await deleteJobFiles(jobId);
  } catch (err) {
    console.warn(`[admin] R2 cleanup skipped for ${jobId}:`, err?.message || err);
  }
}

export async function deleteAdminJob(jobId) {
  if (!jobId) throw new Error("Missing jobId");

  const { data: job, error } = await adminClient
    .from("audit_jobs")
    .select("id, user_id")
    .eq("id", jobId)
    .single();

  if (error || !job) {
    throw new Error("Audit not found");
  }

  await deleteAuditJobFiles(jobId);
  await deleteAuditJobRecords(jobId);
  return { id: jobId };
}

export async function deleteAdminJobsForUser(userId) {
  const { data: jobs, error } = await adminClient
    .from("audit_jobs")
    .select("id")
    .eq("user_id", userId);

  if (error) throw error;

  for (const job of jobs || []) {
    await deleteAdminJob(job.id);
  }

  return { deletedCount: (jobs || []).length };
}

export async function createAdminUser({ email, password, fullName }) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail || !password) {
    throw new Error("Email and password are required");
  }
  if (isSuperadminEmail(normalizedEmail)) {
    throw new Error("Cannot create another superadmin account from the panel");
  }
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const { data, error } = await adminClient.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
    user_metadata: fullName ? { full_name: fullName.trim() } : undefined
  });

  if (error) throw error;
  return data.user;
}

export async function updateAdminUser(userId, { fullName, password }) {
  if (!userId) throw new Error("Missing userId");

  const { data: existing, error: fetchError } =
    await adminClient.auth.admin.getUserById(userId);
  if (fetchError || !existing?.user) {
    throw new Error("User not found");
  }
  if (isSuperadminEmail(existing.user.email)) {
    throw new Error("Superadmin account cannot be edited from the panel");
  }

  const payload = {};
  if (fullName !== undefined) {
    payload.user_metadata = {
      ...(existing.user.user_metadata || {}),
      full_name: fullName.trim() || null
    };
  }
  if (password) {
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }
    payload.password = password;
  }

  if (Object.keys(payload).length === 0) {
    throw new Error("Nothing to update");
  }

  const { data, error } = await adminClient.auth.admin.updateUserById(
    userId,
    payload
  );
  if (error) throw error;
  return data.user;
}

export async function deleteAdminUser(userId) {
  if (!userId) throw new Error("Missing userId");

  const { data: existing, error: fetchError } =
    await adminClient.auth.admin.getUserById(userId);
  if (fetchError || !existing?.user) {
    throw new Error("User not found");
  }
  if (isSuperadminEmail(existing.user.email)) {
    throw new Error("Superadmin account cannot be deleted");
  }

  await deleteAdminJobsForUser(userId);

  const { error } = await adminClient.auth.admin.deleteUser(userId);
  if (error) throw error;

  return { id: userId };
}

export async function updateAdminJob(jobId, { status, url }) {
  if (!jobId) throw new Error("Missing jobId");

  const allowedStatuses = ["pending", "running", "done", "failed"];
  const payload = {};

  if (status !== undefined) {
    if (!allowedStatuses.includes(status)) {
      throw new Error("Invalid status");
    }
    payload.status = status;
    if (status === "failed" || status === "done") {
      payload.completed_at = new Date().toISOString();
    }
  }

  if (url !== undefined) {
    const trimmed = String(url).trim();
    if (!trimmed) throw new Error("URL cannot be empty");
    payload.url = trimmed;
  }

  if (Object.keys(payload).length === 0) {
    throw new Error("Nothing to update");
  }

  const { data, error } = await adminClient
    .from("audit_jobs")
    .update(payload)
    .eq("id", jobId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("Audit not found");
  }

  return data;
}
