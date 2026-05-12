-- ============================================================
-- db/migrations/012_rls_admin_user_mgmt.sql
-- Sprint 3 — M3 PR-02: db/rls-admin-user-mgmt
-- ============================================================
-- Two deliverables in this file:
--
-- PART A: display_id column on hr_user
--   Adds a human-readable sequential ID (user1, user2, ...)
--   shown in the Admin UI instead of the long Auth UUID.
--   The real userid (Auth UUID) remains the PK.
--
-- PART B: RLS policies on hr_user and user_module_rights
--   hr_user:
--     ADMIN can SELECT all rows
--     ADMIN can UPDATE record_status only WHERE user_type != 'SUPERADMIN'
--     ADMIN cannot UPDATE user_type (no policy for that column)
--     ADMIN cannot INSERT or DELETE hr_user rows
--     SUPERADMIN rows are fully protected at DB level
--   user_module_rights:
--     ADMIN cannot INSERT/UPDATE/DELETE rows belonging to SUPERADMIN
--     ADMIN can read all rows (needed to load rights for display)
--
-- Run in Supabase SQL Editor (Sprint 3, Week 5).
-- ============================================================


-- ============================================================
-- PART A: display_id column
-- ============================================================

-- Step 1: Add display_id column to hr_user
ALTER TABLE hr_user
  ADD COLUMN IF NOT EXISTS display_id VARCHAR(20);

-- Step 2: Populate display_id for existing rows
-- Assigns user1, user2, ... in order of insertion (by userid alphabetically
-- for seeded accounts, then by email for OAuth accounts)
WITH numbered AS (
  SELECT userid,
         'user' || ROW_NUMBER() OVER (ORDER BY
           CASE user_type
             WHEN 'SUPERADMIN' THEN 1
             WHEN 'ADMIN'      THEN 2
             ELSE                   3
           END,
           email
         ) AS new_display_id
  FROM hr_user
)
UPDATE hr_user
SET display_id = numbered.new_display_id
FROM numbered
WHERE hr_user.userid = numbered.userid;

-- Step 3: Create a function + trigger to auto-assign display_id
-- for new users provisioned by provision_new_user()
CREATE OR REPLACE FUNCTION assign_display_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only assign if not already set
  IF NEW.display_id IS NULL THEN
    NEW.display_id := 'user' || (
      SELECT COUNT(*) + 1 FROM hr_user WHERE display_id IS NOT NULL
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_hr_user_insert_assign_display_id ON hr_user;

CREATE TRIGGER on_hr_user_insert_assign_display_id
  BEFORE INSERT ON hr_user
  FOR EACH ROW
  EXECUTE FUNCTION assign_display_id();

-- Step 4: Verify display_id assigned correctly
SELECT display_id, email, user_type, record_status
FROM hr_user
ORDER BY display_id;
-- Expected: user1, user2, ... one per row, no NULLs


-- ============================================================
-- PART B: RLS on hr_user
-- ============================================================

-- Enable RLS
ALTER TABLE hr_user ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (safe re-run)
DROP POLICY IF EXISTS hr_user_select       ON hr_user;
DROP POLICY IF EXISTS hr_user_update_status ON hr_user;
DROP POLICY IF EXISTS hr_user_superadmin_block ON hr_user;


-- ── SELECT ───────────────────────────────────────────────────
-- ADMIN and SUPERADMIN can read all hr_user rows
-- Needed for getUsers() in adminService.js

CREATE POLICY hr_user_select ON hr_user
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM hr_user u
      WHERE u.userid = auth.uid()::text
        AND u.user_type IN ('ADMIN', 'SUPERADMIN')
        AND u.record_status = 'ACTIVE'
    )
  );


-- ── UPDATE record_status ──────────────────────────────────────
-- ADMIN can UPDATE record_status only WHERE user_type != 'SUPERADMIN'
-- SUPERADMIN can UPDATE record_status on any non-SUPERADMIN row
--
-- WITH CHECK: the resulting row must not have user_type = 'SUPERADMIN'
-- This prevents ADMIN from promoting anyone to SUPERADMIN
-- AND prevents ADMIN from modifying existing SUPERADMIN rows

CREATE POLICY hr_user_update_status ON hr_user
  FOR UPDATE
  TO authenticated
  USING (
    -- Caller must be ADMIN or SUPERADMIN
    EXISTS (
      SELECT 1 FROM hr_user u
      WHERE u.userid = auth.uid()::text
        AND u.user_type IN ('ADMIN', 'SUPERADMIN')
        AND u.record_status = 'ACTIVE'
    )
    -- Target row must NOT be a SUPERADMIN
    AND user_type != 'SUPERADMIN'
  )
  WITH CHECK (
    -- Resulting row must NOT become a SUPERADMIN
    -- This blocks user_type changes to SUPERADMIN
    user_type != 'SUPERADMIN'
    AND EXISTS (
      SELECT 1 FROM hr_user u
      WHERE u.userid = auth.uid()::text
        AND u.user_type IN ('ADMIN', 'SUPERADMIN')
        AND u.record_status = 'ACTIVE'
    )
  );


-- ============================================================
-- PART B: RLS on user_module_rights
-- ============================================================

-- Enable RLS
ALTER TABLE user_module_rights ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (safe re-run)
DROP POLICY IF EXISTS umr_select          ON user_module_rights;
DROP POLICY IF EXISTS umr_insert          ON user_module_rights;
DROP POLICY IF EXISTS umr_update          ON user_module_rights;
DROP POLICY IF EXISTS umr_delete          ON user_module_rights;


-- ── SELECT ───────────────────────────────────────────────────
-- ADMIN and SUPERADMIN can read all user_module_rights rows
-- Needed by UserRightsContext to load rights on login

CREATE POLICY umr_select ON user_module_rights
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM hr_user u
      WHERE u.userid = auth.uid()::text
        AND u.user_type IN ('ADMIN', 'SUPERADMIN')
        AND u.record_status = 'ACTIVE'
    )
  );


-- ── INSERT ───────────────────────────────────────────────────
-- Only SUPERADMIN can insert user_module_rights rows
-- ADMIN cannot grant rights to any user

CREATE POLICY umr_insert ON user_module_rights
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM hr_user u
      WHERE u.userid = auth.uid()::text
        AND u.user_type = 'SUPERADMIN'
        AND u.record_status = 'ACTIVE'
    )
  );


-- ── UPDATE ───────────────────────────────────────────────────
-- ADMIN can UPDATE user_module_rights rows
-- EXCEPT rows belonging to a SUPERADMIN user
-- SUPERADMIN can UPDATE any row

CREATE POLICY umr_update ON user_module_rights
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM hr_user caller
      WHERE caller.userid = auth.uid()::text
        AND caller.user_type IN ('ADMIN', 'SUPERADMIN')
        AND caller.record_status = 'ACTIVE'
    )
    -- Block ADMIN from touching SUPERADMIN rights rows
    AND NOT EXISTS (
      SELECT 1 FROM hr_user target
      WHERE target.userid = user_module_rights.userid
        AND target.user_type = 'SUPERADMIN'
        AND EXISTS (
          SELECT 1 FROM hr_user caller2
          WHERE caller2.userid = auth.uid()::text
            AND caller2.user_type = 'ADMIN'
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM hr_user caller
      WHERE caller.userid = auth.uid()::text
        AND caller.user_type IN ('ADMIN', 'SUPERADMIN')
        AND caller.record_status = 'ACTIVE'
    )
  );


-- ── DELETE ───────────────────────────────────────────────────
-- Only SUPERADMIN can delete user_module_rights rows
-- ADMIN cannot remove rights from any user

CREATE POLICY umr_delete ON user_module_rights
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM hr_user u
      WHERE u.userid = auth.uid()::text
        AND u.user_type = 'SUPERADMIN'
        AND u.record_status = 'ACTIVE'
    )
  );


-- ============================================================
-- STEP 3: Confirm all policies
-- ============================================================

SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('hr_user', 'user_module_rights')
ORDER BY tablename, cmd, policyname;

-- Expected hr_user (2 policies):
--   hr_user_select         | SELECT
--   hr_user_update_status  | UPDATE

-- Expected user_module_rights (4 policies):
--   umr_delete  | DELETE
--   umr_insert  | INSERT
--   umr_select  | SELECT
--   umr_update  | UPDATE


-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- ── TEST 1: display_id assigned to all users ─────────────────
/*
SELECT display_id, email, user_type FROM hr_user ORDER BY display_id;
-- Expected: user1, user2, ... no NULLs
*/

-- ── TEST 2: ADMIN can SELECT all hr_user rows ────────────────
/*
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "PASTE_ADMIN_UUID"}';
  SELECT display_id, email, user_type, record_status FROM hr_user;
  -- Expected: all rows returned
ROLLBACK;
*/

-- ── TEST 3: ADMIN can UPDATE record_status for non-SUPERADMIN ─
/*
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "PASTE_ADMIN_UUID"}';
  UPDATE hr_user SET record_status = 'INACTIVE'
  WHERE email = 'PASTE_USER_EMAIL';
  -- Expected: UPDATE 1
ROLLBACK;
*/

-- ── TEST 4: ADMIN cannot UPDATE SUPERADMIN record_status ─────
/*
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "PASTE_ADMIN_UUID"}';
  UPDATE hr_user SET record_status = 'INACTIVE'
  WHERE email = 'jcesperanza@neu.edu.ph';
  -- Expected: UPDATE 0 — RLS blocks it
ROLLBACK;
*/

-- ── TEST 5: ADMIN cannot change user_type ────────────────────
/*
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "PASTE_ADMIN_UUID"}';
  UPDATE hr_user SET user_type = 'SUPERADMIN'
  WHERE email = 'PASTE_USER_EMAIL';
  -- Expected: UPDATE 0 — WITH CHECK blocks user_type = SUPERADMIN
ROLLBACK;
*/

-- ── TEST 6: ADMIN cannot UPDATE SUPERADMIN rights ────────────
/*
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "PASTE_ADMIN_UUID"}';
  UPDATE user_module_rights SET right_value = 0
  WHERE userid = (SELECT userid FROM hr_user WHERE email = 'jcesperanza@neu.edu.ph')
    AND rightcode = 'ADM_USER';
  -- Expected: UPDATE 0 — RLS blocks ADMIN from touching SUPERADMIN rights
ROLLBACK;
*/