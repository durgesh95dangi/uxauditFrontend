-- 50+ point CRO audit: scoring, above-fold check, extended issue fields
-- ADDITIVE ONLY — run in Supabase SQL editor

ALTER TABLE issues
  ADD COLUMN IF NOT EXISTS point_id text,
  ADD COLUMN IF NOT EXISTS area text;

ALTER TABLE audit_jobs
  ADD COLUMN IF NOT EXISTS overall_score integer,
  ADD COLUMN IF NOT EXISTS above_fold_score integer,
  ADD COLUMN IF NOT EXISTS above_fold_vp_clear boolean,
  ADD COLUMN IF NOT EXISTS above_fold_cta_visible boolean,
  ADD COLUMN IF NOT EXISTS above_fold_cta_copy text,
  ADD COLUMN IF NOT EXISTS above_fold_top_risk text;

ALTER TABLE screenshots
  ADD COLUMN IF NOT EXISTS section_score integer,
  ADD COLUMN IF NOT EXISTS positives jsonb;
