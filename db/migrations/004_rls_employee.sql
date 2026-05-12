-- ============================================================
-- db/migrations/005_rls_employee.sql
-- Sprint 2 — M3 PR-01: db/rls-employee
-- ============================================================
-- RLS policies for the employee table.
--
-- IMPORTANT NOTES FROM TESTING:
--   1. hr_user RLS must remain DISABLED — the app login guard
--      (checkLoginGuard in App.jsx) reads hr_user before a full
--      session is established. Enabling RLS on hr_user breaks login.
--
--   2. user_module_rights, user_module, module, rights tables
--      should also remain without RLS — they are internal rights
--      tables read by UserRightsContext on login.
--
--   3. The cascade trigger (employee → jobHistory on soft delete)
--      is a separate deliverable in M3 PR-02 (db/trigger-cascade-softdelete).
--      Test 9 cascade behavior cannot be verified until PR-02 is merged.
--
--   4. hr_user.userid must match auth.users.id exactly for policies
--      to work. Run the userid sync script if adding new users.
--
-- Policies implemented:
--   emp_select         — SELECT visibility by user type
--   emp_insert         — INSERT gated by EMP_ADD = 1
--   emp_update_edit    — UPDATE edit fields gated by EMP_EDIT = 1
--   emp_update_del     — UPDATE deactivate gated by EMP_DEL = 1
--   emp_update_recover — UPDATE recover gated by user_type ADMIN/SUPERADMIN
--
-- Run in Supabase SQL Editor (Sprint 2, Week 3).
-- ============================================================


-- ============================================================
-- STEP 1: Enable RLS on employee table
-- ============================================================

ALTER TABLE employee ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- STEP 2: Drop existing policies (safe re-run)
-- ============================================================

DROP POLICY IF EXISTS emp_select          ON employee;
DROP POLICY IF EXISTS emp_insert          ON employee;
DROP POLICY IF EXISTS emp_update_edit     ON employee;
DROP POLICY IF EXISTS emp_update_del      ON employee;
DROP POLICY IF EXISTS emp_update_deactivate ON employee;
DROP POLICY IF EXISTS emp_update_recover  ON employee;


-- ============================================================
-- POLICY 1: SELECT
-- ============================================================
-- USER       → ACTIVE rows only
-- ADMIN      → all rows (ACTIVE + INACTIVE)
-- SUPERADMIN → all rows (ACTIVE + INACTIVE)

CREATE POLICY emp_select ON employee
  FOR SELECT
  TO authenticated
  USING (
    -- ADMIN / SUPERADMIN: see all rows
    EXISTS (
      SELECT 1 FROM hr_user
      WHERE hr_user.userid = auth.uid()::text
        AND hr_user.user_type IN ('ADMIN', 'SUPERADMIN')
        AND hr_user.record_status = 'ACTIVE'
    )
    OR
    -- USER: see ACTIVE rows only
    (
      record_status = 'ACTIVE'
      AND EXISTS (
        SELECT 1 FROM hr_user
        WHERE hr_user.userid = auth.uid()::text
          AND hr_user.user_type = 'USER'
          AND hr_user.record_status = 'ACTIVE'
      )
    )
  );


-- ============================================================
-- POLICY 2: INSERT
-- ============================================================
-- Requires EMP_ADD = 1 in user_module_rights.
-- Per rights matrix: ADMIN and SUPERADMIN only.

CREATE POLICY emp_insert ON employee
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM hr_user u
      JOIN user_module_rights umr ON umr.userid = u.userid
      WHERE u.userid = auth.uid()::text
        AND u.record_status = 'ACTIVE'
        AND umr.rightcode = 'EMP_ADD'
        AND umr.right_value = 1
    )
  );


-- ============================================================
-- POLICY 3: UPDATE — edit fields
-- ============================================================
-- Requires EMP_EDIT = 1 in user_module_rights.
-- Per rights matrix: ADMIN and SUPERADMIN only.

CREATE POLICY emp_update_edit ON employee
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM hr_user u
      JOIN user_module_rights umr ON umr.userid = u.userid
      WHERE u.userid = auth.uid()::text
        AND u.record_status = 'ACTIVE'
        AND umr.rightcode = 'EMP_EDIT'
        AND umr.right_value = 1
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM hr_user u
      JOIN user_module_rights umr ON umr.userid = u.userid
      WHERE u.userid = auth.uid()::text
        AND u.record_status = 'ACTIVE'
        AND umr.rightcode = 'EMP_EDIT'
        AND umr.right_value = 1
    )
  );


-- ============================================================
-- POLICY 4: UPDATE — soft deactivate (INACTIVE)
-- ============================================================
-- Requires EMP_DEL = 1 in user_module_rights.
-- Per rights matrix: SUPERADMIN only (ADMIN has EMP_DEL = 0).
-- WITH CHECK locks this policy to deactivation direction only.

CREATE POLICY emp_update_del ON employee
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM hr_user u
      JOIN user_module_rights umr ON umr.userid = u.userid
      WHERE u.userid = auth.uid()::text
        AND u.record_status = 'ACTIVE'
        AND umr.rightcode = 'EMP_DEL'
        AND umr.right_value = 1
    )
  )
  WITH CHECK (
    record_status = 'INACTIVE'
    AND EXISTS (
      SELECT 1
      FROM hr_user u
      JOIN user_module_rights umr ON umr.userid = u.userid
      WHERE u.userid = auth.uid()::text
        AND u.record_status = 'ACTIVE'
        AND umr.rightcode = 'EMP_DEL'
        AND umr.right_value = 1
    )
  );


-- ============================================================
-- POLICY 5: UPDATE — recover (ACTIVE)
-- ============================================================
-- Accessible to ADMIN and SUPERADMIN by user_type.
-- No EMP_RECOVER rightcode exists — recovery is role-based.
-- WITH CHECK locks this policy to recovery direction only.

CREATE POLICY emp_update_recover ON employee
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM hr_user
      WHERE hr_user.userid = auth.uid()::text
        AND hr_user.user_type IN ('ADMIN', 'SUPERADMIN')
        AND hr_user.record_status = 'ACTIVE'
    )
  )
  WITH CHECK (
    record_status = 'ACTIVE'
    AND EXISTS (
      SELECT 1 FROM hr_user
      WHERE hr_user.userid = auth.uid()::text
        AND hr_user.user_type IN ('ADMIN', 'SUPERADMIN')
        AND hr_user.record_status = 'ACTIVE'
    )
  );


-- ============================================================
-- STEP 3: Confirm policies are in place
-- ============================================================

SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'employee'
ORDER BY cmd, policyname;

-- Expected 5 rows:
-- emp_insert          | INSERT
-- emp_select          | SELECT
-- emp_update_del      | UPDATE
-- emp_update_edit     | UPDATE
-- emp_update_recover  | UPDATE