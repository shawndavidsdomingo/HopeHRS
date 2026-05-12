-- ============================================================
-- db/migrations/012b_rls_admin_user_mgmt_fix.sql
-- Sprint 3 — M3 PR-02: db/rls-admin-user-mgmt (recursion fix)
-- ============================================================
-- FIX: hr_user RLS policies caused infinite recursion because
-- each policy queried hr_user to check user_type — which
-- triggered the same SELECT policy again in a loop.
--
-- Solution: SECURITY DEFINER helper functions that bypass RLS
-- when checking the caller's user_type. These functions run as
-- the postgres superuser (owner) so they read hr_user directly
-- without triggering the RLS policies on that table.
-- ============================================================


-- ============================================================
-- STEP 1: Drop old recursive policies
-- ============================================================

DROP POLICY IF EXISTS hr_user_select        ON hr_user;
DROP POLICY IF EXISTS hr_user_update_status ON hr_user;
DROP POLICY IF EXISTS umr_select            ON user_module_rights;
DROP POLICY IF EXISTS umr_insert            ON user_module_rights;
DROP POLICY IF EXISTS umr_update            ON user_module_rights;
DROP POLICY IF EXISTS umr_delete            ON user_module_rights;


-- ============================================================
-- STEP 2: Create SECURITY DEFINER helper functions
-- ============================================================
-- These functions bypass RLS when reading hr_user to check
-- the caller's user_type. Called from inside RLS policies
-- so the policy itself does not recursively query hr_user.

-- Returns the user_type of the currently authenticated user
CREATE OR REPLACE FUNCTION get_my_user_type()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_user_type TEXT;
BEGIN
  SELECT user_type INTO v_user_type
  FROM public.hr_user
  WHERE userid = auth.uid()::text
    AND record_status = 'ACTIVE';
  RETURN v_user_type;
END;
$$;

-- Returns true if the currently authenticated user is ADMIN or SUPERADMIN
CREATE OR REPLACE FUNCTION is_admin_or_above()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN get_my_user_type() IN ('ADMIN', 'SUPERADMIN');
END;
$$;

-- Returns true if the currently authenticated user is SUPERADMIN
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN get_my_user_type() = 'SUPERADMIN';
END;
$$;

-- Returns the user_type of a target userid (used to check if
-- target row belongs to a SUPERADMIN before blocking ADMIN update)
CREATE OR REPLACE FUNCTION get_user_type_for(p_userid TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_user_type TEXT;
BEGIN
  SELECT user_type INTO v_user_type
  FROM public.hr_user
  WHERE userid = p_userid;
  RETURN v_user_type;
END;
$$;


-- ============================================================
-- STEP 3: Recreate hr_user RLS policies (no recursion)
-- ============================================================

-- ── SELECT ───────────────────────────────────────────────────
-- Uses is_admin_or_above() — no direct hr_user query in policy

CREATE POLICY hr_user_select ON hr_user
  FOR SELECT
  TO authenticated
  USING (is_admin_or_above());


-- ── UPDATE record_status ──────────────────────────────────────
-- ADMIN can update non-SUPERADMIN rows only
-- SUPERADMIN can update any non-SUPERADMIN row
-- WITH CHECK prevents promoting anyone to SUPERADMIN

CREATE POLICY hr_user_update_status ON hr_user
  FOR UPDATE
  TO authenticated
  USING (
    is_admin_or_above()
    AND user_type != 'SUPERADMIN'
  )
  WITH CHECK (
    is_admin_or_above()
    AND user_type != 'SUPERADMIN'
  );


-- ============================================================
-- STEP 4: Recreate user_module_rights RLS policies (no recursion)
-- ============================================================

-- ── SELECT ───────────────────────────────────────────────────

CREATE POLICY umr_select ON user_module_rights
  FOR SELECT
  TO authenticated
  USING (is_admin_or_above());


-- ── INSERT ───────────────────────────────────────────────────
-- SUPERADMIN only

CREATE POLICY umr_insert ON user_module_rights
  FOR INSERT
  TO authenticated
  WITH CHECK (is_superadmin());


-- ── UPDATE ───────────────────────────────────────────────────
-- ADMIN can update rights rows for non-SUPERADMIN users only
-- Uses get_user_type_for() to check the target row's owner

CREATE POLICY umr_update ON user_module_rights
  FOR UPDATE
  TO authenticated
  USING (
    is_admin_or_above()
    AND get_user_type_for(user_module_rights.userid) != 'SUPERADMIN'
  )
  WITH CHECK (
    is_admin_or_above()
    AND get_user_type_for(user_module_rights.userid) != 'SUPERADMIN'
  );


-- ── DELETE ───────────────────────────────────────────────────
-- SUPERADMIN only

CREATE POLICY umr_delete ON user_module_rights
  FOR DELETE
  TO authenticated
  USING (is_superadmin());


-- ============================================================
-- STEP 5: Confirm policies
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

-- ── TEST 1: ADMIN can SELECT all hr_user rows ────────────────
/*
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "PASTE_ADMIN_UUID"}';
  SELECT display_id, email, user_type, record_status FROM hr_user;
  -- Expected: all rows, no recursion error
ROLLBACK;
*/

-- ── TEST 2: ADMIN can UPDATE non-SUPERADMIN record_status ────
/*
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "PASTE_ADMIN_UUID"}';
  UPDATE hr_user SET record_status = 'INACTIVE'
  WHERE email = 'hakdogen692@gmail.com';
  -- Expected: UPDATE 1
ROLLBACK;
*/

-- ── TEST 3: ADMIN cannot UPDATE SUPERADMIN record_status ─────
/*
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "PASTE_ADMIN_UUID"}';
  UPDATE hr_user SET record_status = 'INACTIVE'
  WHERE email = 'jcesperanza@neu.edu.ph';
  -- Expected: UPDATE 0
ROLLBACK;
*/

-- ── TEST 4: ADMIN cannot change user_type to SUPERADMIN ──────
/*
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "PASTE_ADMIN_UUID"}';
  UPDATE hr_user SET user_type = 'SUPERADMIN'
  WHERE email = 'hakdogen692@gmail.com';
  -- Expected: UPDATE 0 — WITH CHECK blocks user_type = SUPERADMIN
ROLLBACK;
*/

-- ── TEST 5: ADMIN cannot UPDATE SUPERADMIN rights ────────────
/*
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "PASTE_ADMIN_UUID"}';
  UPDATE user_module_rights SET right_value = 0
  WHERE userid = (
    SELECT userid FROM hr_user WHERE email = 'jcesperanza@neu.edu.ph'
  )
  AND rightcode = 'ADM_USER';
  -- Expected: UPDATE 0
ROLLBACK;
*/

-- ── TEST 6: ADMIN can UPDATE non-SUPERADMIN rights ───────────
/*
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "PASTE_ADMIN_UUID"}';
  UPDATE user_module_rights SET right_value = 1
  WHERE userid = (
    SELECT userid FROM hr_user WHERE email = 'hakdogen692@gmail.com'
  )
  AND rightcode = 'EMP_ADD';
  -- Expected: UPDATE 1
ROLLBACK;
*/