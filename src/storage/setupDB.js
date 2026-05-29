const setupSql = `-- Run this in Supabase SQL Editor

-- 1. audit_jobs: one row per audit run
CREATE TABLE IF NOT EXISTS audit_jobs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL,
  url                 TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'pending', -- pending | running | done | failed
  error               TEXT,
  section_count       INTEGER DEFAULT 0,
  issue_count         INTEGER DEFAULT 0,
  current_step        TEXT,            -- engine-reported phase, e.g. capturing_desktop
  last_heartbeat_at   TIMESTAMPTZ DEFAULT NOW(),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  completed_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_audit_jobs_user_created ON audit_jobs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_jobs_status ON audit_jobs(status);
CREATE INDEX IF NOT EXISTS idx_audit_jobs_running_heartbeat
  ON audit_jobs(status, last_heartbeat_at)
  WHERE status = 'running';
ALTER TABLE audit_jobs ENABLE ROW LEVEL SECURITY;

-- 2. screenshots: every screenshot captured by Playwright (full page + sections)
CREATE TABLE IF NOT EXISTS screenshots (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id        UUID NOT NULL,
  url           TEXT,
  type          TEXT NOT NULL,        -- full | section | element
  viewport      TEXT,                 -- desktop | tablet | mobile
  label         TEXT,
  selector      TEXT,
  r2_key        TEXT,
  public_url    TEXT,
  y_start       INTEGER,
  y_end         INTEGER,
  clip          JSONB,
  bounding_box  JSONB,
  confidence    TEXT,                 -- high | medium | low
  failed        BOOLEAN DEFAULT FALSE,
  fail_reason   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_screenshots_job ON screenshots(job_id);
CREATE INDEX IF NOT EXISTS idx_screenshots_job_viewport ON screenshots(job_id, viewport, type);
CREATE INDEX IF NOT EXISTS idx_screenshots_job_y ON screenshots(job_id, y_start, y_end);
ALTER TABLE screenshots ENABLE ROW LEVEL SECURITY;

-- 3. issues: UX findings returned by Claude, one row per finding
CREATE TABLE IF NOT EXISTS issues (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id           UUID NOT NULL,
  screenshot_id    UUID,
  section_label    TEXT,
  viewport         TEXT,
  title            TEXT NOT NULL,
  severity         TEXT NOT NULL,         -- critical | high | medium | low
  description      TEXT,
  why              TEXT,
  business_impact  TEXT,
  how_to_fix       TEXT,
  effort           TEXT,                  -- low | medium | high
  category         TEXT,                  -- visual | copy | trust | cta | layout
  screenshot_url   TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_issues_job ON issues(job_id);
CREATE INDEX IF NOT EXISTS idx_issues_job_section ON issues(job_id, section_label);
CREATE INDEX IF NOT EXISTS idx_issues_severity ON issues(job_id, severity);
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;`;

console.log(setupSql);
console.log("");
console.log("1. Go to https://supabase.com/dashboard");
console.log("2. Open your project -> SQL Editor");
console.log("3. Paste and run the SQL above (creates audit_jobs, screenshots, issues)");
console.log("4. In Cloudflare R2, create bucket named: screenshot-engine");
console.log("5. Configure public/custom domain for the bucket");
console.log("6. Add R2 env vars and run: npm run verify");
console.log("7. Start servers: npm run auth-api  (and)  npm start");
