-- KRC AI Club internal auth and role schema.
--
-- Purpose:
--   1. Add app login fields to the existing users table.
--   2. Keep app-wide roles on users.app_role.
--   3. Keep project-specific roles on project_members.role.
--   4. Support app signup with password_hash stored in users.
--
-- Required existing tables used by the app:
--   users(id, name, email, grade, class_id, graduation, is_deleted, created_at, updated_at)
--   classes(id, name)
--   project_members(project_id, user_id, role, is_deleted)
--
-- Security notes:
--   - Store only password_hash, never a plain password.
--   - Do not select password_hash in normal app data fetches.
--   - SUPABASE_SERVICE_ROLE_KEY must be server-only and must not use NEXT_PUBLIC_.

BEGIN;

-- App-wide auth fields.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS app_role TEXT NOT NULL DEFAULT 'member',
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;

-- App-wide role:
--   admin  = can manage the whole app
--   member = normal signed-in user
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_app_role_check;

ALTER TABLE users
  ADD CONSTRAINT users_app_role_check
  CHECK (app_role IN ('admin', 'member'));

-- Project-specific role:
--   0 = viewer
--   1 = member
--   2 = leader
--   3 = owner
ALTER TABLE project_members
  DROP CONSTRAINT IF EXISTS project_members_role_check;

ALTER TABLE project_members
  ADD CONSTRAINT project_members_role_check
  CHECK (role IN (0, 1, 2, 3));

-- Login and signup indexes.
CREATE UNIQUE INDEX IF NOT EXISTS users_email_active_unique_idx
  ON users (lower(email))
  WHERE is_deleted = FALSE;

CREATE INDEX IF NOT EXISTS users_email_login_idx
  ON users (lower(email))
  WHERE is_deleted = FALSE;

CREATE INDEX IF NOT EXISTS classes_name_lookup_idx
  ON classes (lower(name));

CREATE INDEX IF NOT EXISTS project_members_user_project_idx
  ON project_members (user_id, project_id)
  WHERE is_deleted = FALSE;

COMMIT;

-- Signup behavior in the app:
--   - New users are inserted with app_role = 'member'.
--   - The app hashes the submitted password and stores it in users.password_hash.
--   - If the submitted class name does not exist in classes, the app creates it.
--
-- Initial admin setup:
--   1. Generate a password hash locally:
--
--        npm run hash-password -- "your-password"
--
--   2. If the admin user already exists:
--
--        UPDATE users
--        SET app_role = 'admin',
--            password_hash = 'scrypt$...',
--            updated_at = CURRENT_TIMESTAMP
--        WHERE lower(email) = lower('admin@example.com')
--          AND is_deleted = FALSE;
--
--   3. If the admin user does not exist yet, create a class first if needed,
--      then insert the user. Replace class_id and password_hash values:
--
--        INSERT INTO users (
--          name,
--          email,
--          app_role,
--          password_hash,
--          grade,
--          class_id,
--          graduation,
--          is_deleted
--        )
--        VALUES (
--          'Admin User',
--          'admin@example.com',
--          'admin',
--          'scrypt$...',
--          1,
--          1,
--          '2029-03-31',
--          FALSE
--        );
--
-- Promote a signed-up user to admin:
--
--   UPDATE users
--   SET app_role = 'admin',
--       updated_at = CURRENT_TIMESTAMP
--   WHERE lower(email) = lower('admin@example.com')
--     AND is_deleted = FALSE;
