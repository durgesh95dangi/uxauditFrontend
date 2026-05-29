-- Stores capture quality details (cookies handled, modals dismissed, coverage warnings).
alter table audit_jobs
  add column if not exists audit_metadata jsonb;
