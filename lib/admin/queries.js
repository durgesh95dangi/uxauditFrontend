import { supabase as adminClient } from "../../src/storage/supabase.js";
import { getSuperadminEmails, isSuperadminEmail } from "../auth/superadmin.js";

function buildUserEmailMap(users) {
  const map = new Map();
  for (const user of users) {
    map.set(user.id, user.email || "—");
  }
  return map;
}

function isExcludedAdminUser(user) {
  return isSuperadminEmail(user.email);
}

function aggregateJobCounts(jobs) {
  const byUser = {};
  const byStatus = {
    pending: 0,
    running: 0,
    done: 0,
    failed: 0
  };

  for (const job of jobs || []) {
    const status = job.status || "pending";
    if (byStatus[status] !== undefined) {
      byStatus[status] += 1;
    }

    if (!byUser[job.user_id]) {
      byUser[job.user_id] = { total: 0, done: 0, running: 0, failed: 0, pending: 0 };
    }
    byUser[job.user_id].total += 1;
    if (byUser[job.user_id][status] !== undefined) {
      byUser[job.user_id][status] += 1;
    }
  }

  return { byUser, byStatus, totalJobs: (jobs || []).length };
}

function mapJobRow(job, emailByUserId) {
  return {
    id: job.id,
    userId: job.user_id,
    userEmail: emailByUserId.get(job.user_id) || "—",
    url: job.url,
    status: job.status,
    issueCount: job.issue_count ?? 0,
    sectionCount: job.section_count ?? 0,
    overallScore: job.overall_score ?? null,
    highCount: job.audit_metadata?.high_count ?? null,
    createdAt: job.created_at,
    completedAt: job.completed_at,
    error: job.error || null
  };
}

async function listAllAuthUsers() {
  const users = [];
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const batch = data?.users || [];
    users.push(...batch);

    if (batch.length < perPage) break;
    page += 1;
    if (page > 50) break;
  }

  return users;
}

function aggregateSeverityCounts(issues) {
  const counts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  };

  for (const issue of issues || []) {
    const key = (issue.severity || "low").toLowerCase();
    if (counts[key] !== undefined) {
      counts[key] += 1;
    }
  }

  return counts;
}

export async function getAdminStats() {
  const [users, jobsResult, issuesResult] = await Promise.all([
    listAllAuthUsers(),
    adminClient.from("audit_jobs").select("user_id, status"),
    adminClient.from("issues").select("severity")
  ]);

  if (jobsResult.error) throw jobsResult.error;
  if (issuesResult.error) throw issuesResult.error;

  const { byStatus, totalJobs } = aggregateJobCounts(jobsResult.data);
  const regularUsers = users.filter((user) => !isExcludedAdminUser(user));

  return {
    totalUsers: regularUsers.length,
    totalRun: totalJobs,
    passed: byStatus.done ?? 0,
    failed: byStatus.failed ?? 0,
    running: byStatus.running ?? 0,
    pending: byStatus.pending ?? 0,
    jobsByStatus: byStatus,
    bugsBySeverity: aggregateSeverityCounts(issuesResult.data),
    totalBugs: (issuesResult.data || []).length
  };
}

export async function listAdminUsers() {
  const [authUsers, jobsResult] = await Promise.all([
    listAllAuthUsers(),
    adminClient.from("audit_jobs").select("user_id, status")
  ]);

  if (jobsResult.error) throw jobsResult.error;

  const { byUser } = aggregateJobCounts(jobsResult.data);

  return authUsers
    .filter((user) => !isExcludedAdminUser(user))
    .map((user) => ({
      id: user.id,
      email: user.email || "—",
      fullName:
        user.user_metadata?.full_name || user.user_metadata?.name || null,
      createdAt: user.created_at,
      lastSignInAt: user.last_sign_in_at,
      emailVerified: Boolean(user.email_confirmed_at),
      provider: user.app_metadata?.provider || "email",
      auditCount: byUser[user.id]?.total ?? 0,
      auditsDone: byUser[user.id]?.done ?? 0,
      auditsFailed: byUser[user.id]?.failed ?? 0
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getAdminUser(userId) {
  const [authUsers, jobsResult] = await Promise.all([
    listAllAuthUsers(),
    adminClient
      .from("audit_jobs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
  ]);

  if (jobsResult.error) throw jobsResult.error;

  const authUser = authUsers.find((user) => user.id === userId);
  if (!authUser || isExcludedAdminUser(authUser)) {
    return null;
  }

  const emailByUserId = buildUserEmailMap(authUsers);
  const jobs = (jobsResult.data || []).map((job) => mapJobRow(job, emailByUserId));

  return {
    id: authUser.id,
    email: authUser.email || "—",
    fullName:
      authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
    createdAt: authUser.created_at,
    lastSignInAt: authUser.last_sign_in_at,
    emailVerified: Boolean(authUser.email_confirmed_at),
    provider: authUser.app_metadata?.provider || "email",
    auditCount: jobs.length,
    auditsDone: jobs.filter((job) => job.status === "done").length,
    auditsFailed: jobs.filter((job) => job.status === "failed").length,
    jobs
  };
}

export async function listAdminJobs({ limit = 200, userId = null } = {}) {
  let query = adminClient
    .from("audit_jobs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data: jobs, error } = await query;
  if (error) throw error;

  const authUsers = await listAllAuthUsers();
  const emailByUserId = buildUserEmailMap(authUsers);

  return (jobs || []).map((job) => mapJobRow(job, emailByUserId));
}

export function getConfiguredSuperadminEmails() {
  return getSuperadminEmails();
}
