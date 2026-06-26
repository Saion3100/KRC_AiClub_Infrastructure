-- Internal app authentication fields.
-- Run this in Supabase SQL editor before enabling Supabase-backed login.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS app_role TEXT NOT NULL DEFAULT 'member',
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;

ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_app_role_check;

ALTER TABLE users
  ADD CONSTRAINT users_app_role_check
  CHECK (app_role IN ('admin', 'member'));

ALTER TABLE project_members
  DROP CONSTRAINT IF EXISTS project_members_role_check;

ALTER TABLE project_members
  ADD CONSTRAINT project_members_role_check
  CHECK (role IN (0, 1, 2, 3));

CREATE INDEX IF NOT EXISTS users_email_login_idx
  ON users (lower(email))
  WHERE is_deleted = FALSE;

CREATE INDEX IF NOT EXISTS project_members_user_project_idx
  ON project_members (user_id, project_id)
  WHERE is_deleted = FALSE;

-- Role meaning:
-- users.app_role:
--   admin  = app-wide administrator
--   member = normal app user
--
-- project_members.role:
--   0 = viewer
--   1 = member
--   2 = leader
--   3 = owner
--
-- Initial admin example:
-- 1. Generate a hash locally:
--      npm run hash-password -- "your-password"
-- 2. Put the generated value below.
--
-- UPDATE users
-- SET app_role = 'admin',
--     password_hash = 'scrypt$...',
--     updated_at = CURRENT_TIMESTAMP
-- WHERE email = 'admin@example.com';
