-- ============================================================
-- db/migrations/005_rls_jobhistory_job_dept.sql
-- Sprint 2 — M3 PR-02: db/rls-jobhistory-job-dept
-- ============================================================
-- Applies the same 5-policy RLS pattern from PR-01 (employee)
-- to: jobhistory, job, and department tables.
--
-- IMPORTANT NOTE FROM TESTING:
--   Supabase creates permissive _dev policies (qual = true) on
--   tables when RLS is first enabled via the dashboard. These
--   override all custom policies and must be dropped first.
--   This file drops them explicitly before creating the correct
--   policies. If you see unexpected behavior, check pg_policies
--   for any policy with qual = true and drop it.
--
-- Rights matrix (confirmed from project spec):
--   VIEW  — SUPERADMIN=YES, ADMIN=YES, USER=YES  (all 3 tables)
--   ADD   — SUPERADMIN=YES, ADMIN=YES, USER=NO   (all 3 tables)
--   EDIT  — SUPERADMIN=YES, ADMIN=YES, USER=NO   (all 3 tables)
--   DEL   — SUPERADMIN=YES, ADMIN=NO,  USER=NO   (all 3 tables)
--   Recover — ADMIN + SUPERADMIN (role-based, no rightcode)
--
-- Run in Supabase SQL Editor (Sprint 2, Week 3).
-- ============================================================


-- ============================================================
-- SECTION 1: jobhistory
-- ============================================================

ALTER TABLE jobhistory ENABLE ROW LEVEL SECURITY;

-- Drop permissive dev policies left by Supabase dashboard
DROP POLICY IF EXISTS jh_select_dev    ON jobhistory;
DROP POLICY IF EXISTS jh_insert_dev    ON jobhistory;
DROP POLICY IF EXISTS jh_update_dev    ON jobhistory;

-- Drop our own policies (safe re-run)
DROP POLICY IF EXISTS jh_select          ON jobhistory;
DROP POLICY IF EXISTS jh_insert          ON jobhistory;
DROP POLICY IF EXISTS jh_update_edit     ON jobhistory;
DROP POLICY IF EXISTS jh_update_del      ON jobhistory;
DROP POLICY IF EXISTS jh_update_recover  ON jobhistory;


-- ── SELECT ───────────────────────────────────────────────────
-- USER       → ACTIVE rows only
-- ADMIN      → all rows (ACTIVE + INACTIVE)
-- SUPERADMIN → all rows (ACTIVE + INACTIVE)

CREATE POLICY jh_select ON jobhistory
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM hr_user
      WHERE hr_user.userid = auth.uid()::text
        AND hr_user.user_type IN ('ADMIN', 'SUPERADMIN')
        AND hr_user.record_status = 'ACTIVE'
    )
    OR
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


-- ── INSERT ───────────────────────────────────────────────────
-- Requires JH_ADD = 1 — ADMIN and SUPERADMIN only

CREATE POLICY jh_insert ON jobhistory
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM hr_user u
      JOIN user_module_rights umr ON umr.userid = u.userid
      WHERE u.userid = auth.uid()::text
        AND u.record_status = 'ACTIVE'
        AND umr.rightcode = 'JH_ADD'
        AND umr.right_value = 1
    )
  );


-- ── UPDATE edit (salary, deptcode) ───────────────────────────
-- Requires JH_EDIT = 1 — ADMIN and SUPERADMIN only

CREATE POLICY jh_update_edit ON jobhistory
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM hr_user u
      JOIN user_module_rights umr ON umr.userid = u.userid
      WHERE u.userid = auth.uid()::text
        AND u.record_status = 'ACTIVE'
        AND umr.rightcode = 'JH_EDIT'
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
        AND umr.rightcode = 'JH_EDIT'
        AND umr.right_value = 1
    )
  );


-- ── UPDATE deactivate (record_status → INACTIVE) ─────────────
-- Requires JH_DEL = 1 — SUPERADMIN only
-- WITH CHECK locks this to deactivation direction only

CREATE POLICY jh_update_del ON jobhistory
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM hr_user u
      JOIN user_module_rights umr ON umr.userid = u.userid
      WHERE u.userid = auth.uid()::text
        AND u.record_status = 'ACTIVE'
        AND umr.rightcode = 'JH_DEL'
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
        AND umr.rightcode = 'JH_DEL'
        AND umr.right_value = 1
    )
  );


-- ── UPDATE recover (record_status → ACTIVE) ──────────────────
-- ADMIN and SUPERADMIN only (role-based, no rightcode)
-- WITH CHECK locks this to recovery direction only

CREATE POLICY jh_update_recover ON jobhistory
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
-- SECTION 2: job
-- ============================================================

ALTER TABLE job ENABLE ROW LEVEL SECURITY;

-- Drop permissive dev policies
DROP POLICY IF EXISTS job_select_dev   ON job;
DROP POLICY IF EXISTS job_insert_dev   ON job;
DROP POLICY IF EXISTS job_update_dev   ON job;

-- Drop our own policies (safe re-run)
DROP POLICY IF EXISTS job_select          ON job;
DROP POLICY IF EXISTS job_insert          ON job;
DROP POLICY IF EXISTS job_update_edit     ON job;
DROP POLICY IF EXISTS job_update_del      ON job;
DROP POLICY IF EXISTS job_update_recover  ON job;


-- ── SELECT ───────────────────────────────────────────────────

CREATE POLICY job_select ON job
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM hr_user
      WHERE hr_user.userid = auth.uid()::text
        AND hr_user.user_type IN ('ADMIN', 'SUPERADMIN')
        AND hr_user.record_status = 'ACTIVE'
    )
    OR
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


-- ── INSERT ───────────────────────────────────────────────────
-- Requires JOB_ADD = 1 — ADMIN and SUPERADMIN only

CREATE POLICY job_insert ON job
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM hr_user u
      JOIN user_module_rights umr ON umr.userid = u.userid
      WHERE u.userid = auth.uid()::text
        AND u.record_status = 'ACTIVE'
        AND umr.rightcode = 'JOB_ADD'
        AND umr.right_value = 1
    )
  );


-- ── UPDATE edit (jobdesc) ─────────────────────────────────────
-- Requires JOB_EDIT = 1 — ADMIN and SUPERADMIN only

CREATE POLICY job_update_edit ON job
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM hr_user u
      JOIN user_module_rights umr ON umr.userid = u.userid
      WHERE u.userid = auth.uid()::text
        AND u.record_status = 'ACTIVE'
        AND umr.rightcode = 'JOB_EDIT'
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
        AND umr.rightcode = 'JOB_EDIT'
        AND umr.right_value = 1
    )
  );


-- ── UPDATE deactivate (record_status → INACTIVE) ─────────────
-- Requires JOB_DEL = 1 — SUPERADMIN only

CREATE POLICY job_update_del ON job
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM hr_user u
      JOIN user_module_rights umr ON umr.userid = u.userid
      WHERE u.userid = auth.uid()::text
        AND u.record_status = 'ACTIVE'
        AND umr.rightcode = 'JOB_DEL'
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
        AND umr.rightcode = 'JOB_DEL'
        AND umr.right_value = 1
    )
  );


-- ── UPDATE recover (record_status → ACTIVE) ──────────────────
-- ADMIN and SUPERADMIN only

CREATE POLICY job_update_recover ON job
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
-- SECTION 3: department
-- ============================================================

ALTER TABLE department ENABLE ROW LEVEL SECURITY;

-- Drop permissive dev policies
DROP POLICY IF EXISTS dept_select_dev  ON department;
DROP POLICY IF EXISTS dept_insert_dev  ON department;
DROP POLICY IF EXISTS dept_update_dev  ON department;

-- Drop our own policies (safe re-run)
DROP POLICY IF EXISTS dept_select          ON department;
DROP POLICY IF EXISTS dept_insert          ON department;
DROP POLICY IF EXISTS dept_update_edit     ON department;
DROP POLICY IF EXISTS dept_update_del      ON department;
DROP POLICY IF EXISTS dept_update_recover  ON department;


-- ── SELECT ───────────────────────────────────────────────────

CREATE POLICY dept_select ON department
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM hr_user
      WHERE hr_user.userid = auth.uid()::text
        AND hr_user.user_type IN ('ADMIN', 'SUPERADMIN')
        AND hr_user.record_status = 'ACTIVE'
    )
    OR
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


-- ── INSERT ───────────────────────────────────────────────────
-- Requires DEPT_ADD = 1 — ADMIN and SUPERADMIN only

CREATE POLICY dept_insert ON department
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM hr_user u
      JOIN user_module_rights umr ON umr.userid = u.userid
      WHERE u.userid = auth.uid()::text
        AND u.record_status = 'ACTIVE'
        AND umr.rightcode = 'DEPT_ADD'
        AND umr.right_value = 1
    )
  );


-- ── UPDATE edit (deptname) ────────────────────────────────────
-- Requires DEPT_EDIT = 1 — ADMIN and SUPERADMIN only

CREATE POLICY dept_update_edit ON department
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM hr_user u
      JOIN user_module_rights umr ON umr.userid = u.userid
      WHERE u.userid = auth.uid()::text
        AND u.record_status = 'ACTIVE'
        AND umr.rightcode = 'DEPT_EDIT'
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
        AND umr.rightcode = 'DEPT_EDIT'
        AND umr.right_value = 1
    )
  );


-- ── UPDATE deactivate (record_status → INACTIVE) ─────────────
-- Requires DEPT_DEL = 1 — SUPERADMIN only

CREATE POLICY dept_update_del ON department
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM hr_user u
      JOIN user_module_rights umr ON umr.userid = u.userid
      WHERE u.userid = auth.uid()::text
        AND u.record_status = 'ACTIVE'
        AND umr.rightcode = 'DEPT_DEL'
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
        AND umr.rightcode = 'DEPT_DEL'
        AND umr.right_value = 1
    )
  );


-- ── UPDATE recover (record_status → ACTIVE) ──────────────────
-- ADMIN and SUPERADMIN only

CREATE POLICY dept_update_recover ON department
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
-- STEP 4: Confirm all policies — expected 15 rows total
-- ============================================================

SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('jobhistory', 'job', 'department')
ORDER BY tablename, cmd, policyname;

-- Expected:
-- department | dept_insert         | INSERT
-- department | dept_select         | SELECT
-- department | dept_update_del     | UPDATE
-- department | dept_update_edit    | UPDATE
-- department | dept_update_recover | UPDATE
-- job        | job_insert          | INSERT
-- job        | job_select          | SELECT
-- job        | job_update_del      | UPDATE
-- job        | job_update_edit     | UPDATE
-- job        | job_update_recover  | UPDATE
-- jobhistory | jh_insert           | INSERT
-- jobhistory | jh_select           | SELECT
-- jobhistory | jh_update_del       | UPDATE
-- jobhistory | jh_update_edit      | UPDATE
-- jobhistory | jh_update_recover   | UPDATE