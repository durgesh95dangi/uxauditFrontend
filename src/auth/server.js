import dotenv from "dotenv";
import express from "express";
import {
  getUserFromAccessToken,
  refreshSession,
  requestPasswordReset,
  resetPasswordWithToken,
  signInWithEmail,
  signOutWithAccessToken,
  signUpWithEmail
} from "./supabaseAuth.js";
import {
  createJob,
  getFullReport,
  getJob,
  getRecentJobs
} from "../../lib/engine/storage/db.js";
import { runAudit } from "../../lib/engine/runner.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});

const port = Number(process.env.AUTH_API_PORT || 4000);

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim();
}

function sendError(res, error) {
  const message = error?.message || "Unexpected error";
  return res.status(400).json({ error: message });
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/signup", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  try {
    const data = await signUpWithEmail(email, password);
    return res.json({
      user: data.user,
      session: data.session,
      message: "Signup submitted. Check email if confirmation is enabled."
    });
  } catch (error) {
    return sendError(res, error);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  try {
    const data = await signInWithEmail(email, password);
    return res.json({ user: data.user, session: data.session });
  } catch (error) {
    return sendError(res, error);
  }
});

app.get("/me", async (req, res) => {
  const accessToken = getBearerToken(req);
  if (!accessToken) {
    return res.status(401).json({ error: "Missing Bearer token" });
  }

  try {
    const user = await getUserFromAccessToken(accessToken);
    return res.json({ user });
  } catch (error) {
    return sendError(res, error);
  }
});

app.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) {
    return res.status(400).json({ error: "refreshToken is required" });
  }

  try {
    const data = await refreshSession(refreshToken);
    return res.json({ session: data.session, user: data.user });
  } catch (error) {
    return sendError(res, error);
  }
});

app.post("/forgot-password", async (req, res) => {
  const { email, redirectTo } = req.body || {};
  if (!email) {
    return res.status(400).json({ error: "email is required" });
  }

  try {
    await requestPasswordReset(email, redirectTo);
    return res.json({
      success: true,
      message: "If an account exists for that email, a reset link has been sent."
    });
  } catch (error) {
    return sendError(res, error);
  }
});

app.post("/reset-password", async (req, res) => {
  const { accessToken, newPassword } = req.body || {};
  if (!accessToken || !newPassword) {
    return res.status(400).json({ error: "accessToken and newPassword are required" });
  }

  try {
    await resetPasswordWithToken(accessToken, newPassword);
    return res.json({ success: true });
  } catch (error) {
    return sendError(res, error);
  }
});

app.post("/logout", async (req, res) => {
  const accessToken = getBearerToken(req);
  if (!accessToken) {
    return res.status(401).json({ error: "Missing Bearer token" });
  }

  try {
    await signOutWithAccessToken(accessToken);
    return res.json({ success: true });
  } catch (error) {
    return sendError(res, error);
  }
});

async function requireUser(req, res) {
  const accessToken = getBearerToken(req);
  if (!accessToken) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }

  try {
    const user = await getUserFromAccessToken(accessToken);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return null;
    }
    return user;
  } catch {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
}

function normalizeAndValidateUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { error: "URL is required", status: 400 };
  }

  let normalized = rawUrl.trim();
  if (!normalized) {
    return { error: "URL is required", status: 400 };
  }

  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  try {
    const parsed = new URL(normalized);
    return { url: parsed.toString() };
  } catch {
    return { error: "Invalid URL", status: 400 };
  }
}

app.post("/audit/start", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;

  const { url } = req.body || {};
  const validation = normalizeAndValidateUrl(url);
  if (validation.error) {
    return res.status(validation.status).json({ error: validation.error });
  }

  let job;
  try {
    job = await createJob(user.id, validation.url);
  } catch (error) {
    return res.status(500).json({ error: error?.message || "Failed to create job" });
  }

  runAudit(job.id, validation.url, user.id).catch((err) => {
    console.error("Audit failed for job", job.id, err);
  });

  return res.json({ jobId: job.id, status: "pending" });
});

app.get("/audit/status/:jobId", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;

  const { jobId } = req.params;

  let job;
  try {
    job = await getJob(jobId);
  } catch {
    return res.status(404).json({ error: "Not found" });
  }

  if (!job) {
    return res.status(404).json({ error: "Not found" });
  }

  if (job.user_id !== user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  return res.json({
    jobId,
    status: job.status,
    issueCount: job.issue_count,
    sectionCount: job.section_count,
    error: job.error || null,
    createdAt: job.created_at,
    completedAt: job.completed_at
  });
});

app.get("/audit/report/:jobId", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;

  const { jobId } = req.params;

  let job;
  try {
    job = await getJob(jobId);
  } catch {
    return res.status(404).json({ error: "Not found" });
  }

  if (!job) {
    return res.status(404).json({ error: "Not found" });
  }

  if (job.user_id !== user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (job.status !== "done") {
    return res.status(202).json({
      status: job.status,
      message: "Report not ready yet"
    });
  }

  try {
    const report = await getFullReport(jobId);
    return res.json(report);
  } catch (error) {
    return res.status(500).json({ error: error?.message || "Failed to build report" });
  }
});

app.get("/audit/recent", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;

  const limitRaw = Number(req.query.limit);
  const limit =
    Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 50) : 10;

  try {
    const jobs = await getRecentJobs(user.id, limit);
    return res.json({ jobs });
  } catch (error) {
    return res.status(500).json({ error: error?.message || "Failed to load recent audits" });
  }
});

app.listen(port, () => {
  console.log(`Auth + Audit API running on http://localhost:${port}`);
});
