-- Mobile overall UX score (weighted from mobile section scores)
ALTER TABLE audit_jobs
  ADD COLUMN IF NOT EXISTS mobile_overall_score integer;
