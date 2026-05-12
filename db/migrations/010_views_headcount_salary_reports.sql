-- ============================================================
-- db/migrations/010_views_reports.sql
-- Sprint 3 — M3 PR-01: db/views-reports
-- ============================================================
-- Creates two SQL views for the HR Reports module:
--
--   headcount_by_dept     — COUNT of active employees per
--                           department using latest active
--                           jobHistory row per employee
--
--   salary_summary_by_job — MIN, MAX, AVG salary per active
--                           jobCode from active jobHistory rows
--
-- Column names match reportsService.js exactly:
--   headcount_by_dept    : deptcode, deptname, activeheadcount
--   salary_summary_by_job: jobcode, jobdesc, assignments,
--                          minsalary, maxsalary, avgsalary
--
-- Depends on:
--   007_view_employee_current_job.sql (employee_current_job view)
--   Must be run AFTER that migration.
--
-- Run in Supabase SQL Editor (Sprint 3, Week 5).
-- ============================================================


-- ============================================================
-- STEP 1: Drop existing views (safe re-run)
-- ============================================================

DROP VIEW IF EXISTS headcount_by_dept;
DROP VIEW IF EXISTS salary_summary_by_job;


-- ============================================================
-- STEP 2: headcount_by_dept
-- ============================================================
-- COUNT of active employees per department using the latest
-- active jobHistory row per employee.
--
-- Logic:
--   Uses employee_current_job view which already resolves the
--   latest ACTIVE jobhistory row per ACTIVE employee joined
--   with department. COUNT(DISTINCT empno) per deptcode gives
--   the active headcount for each department.
--
--   LEFT JOIN ensures departments with 0 active employees
--   still appear in the result with activeheadcount = 0.
-- ============================================================

CREATE VIEW headcount_by_dept AS
SELECT
  d.deptcode,
  d.deptname,
  COUNT(ecj.empno)  AS activeheadcount
FROM department d
LEFT JOIN employee_current_job ecj
  ON ecj.deptcode = d.deptcode
WHERE d.record_status = 'ACTIVE'
GROUP BY d.deptcode, d.deptname
ORDER BY activeheadcount DESC;


-- ============================================================
-- STEP 3: salary_summary_by_job
-- ============================================================
-- MIN, MAX, AVG salary per active jobCode from active
-- jobHistory rows.
--
-- Logic:
--   Joins job with all ACTIVE jobhistory rows for that jobcode.
--   Computes min/max/avg salary across all active assignments
--   (not just the latest — full salary range per position).
--   ROUND(AVG, 2) matches the spec output format.
--   NULLS LAST on ORDER BY handles jobs with no active
--   jobhistory rows (assignments = 0, salary stats = NULL).
-- ============================================================

CREATE VIEW salary_summary_by_job AS
SELECT
  j.jobcode,
  j.jobdesc,
  COUNT(jh.empno)           AS assignments,
  MIN(jh.salary)            AS minsalary,
  MAX(jh.salary)            AS maxsalary,
  ROUND(AVG(jh.salary), 2)  AS avgsalary
FROM job j
LEFT JOIN jobhistory jh
  ON  jh.jobcode       = j.jobcode
  AND jh.record_status = 'ACTIVE'
WHERE j.record_status = 'ACTIVE'
GROUP BY j.jobcode, j.jobdesc
ORDER BY avgsalary DESC NULLS LAST;


-- ============================================================
-- STEP 4: Confirm views were created
-- ============================================================

SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('headcount_by_dept', 'salary_summary_by_job')
ORDER BY table_name;

-- Expected:
-- table_name             | table_type
-- headcount_by_dept      | VIEW
-- salary_summary_by_job  | VIEW


-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================


-- ── TEST 1: headcount_by_dept returns all 8 departments ──────
/*
SELECT deptcode, deptname, activeheadcount
FROM headcount_by_dept
ORDER BY activeheadcount DESC;
-- Expected: 8 rows (one per ACTIVE department)
-- Departments with 0 active employees still appear (LEFT JOIN)
-- Total activeheadcount across all depts should equal number
-- of ACTIVE employees in employee_current_job view
*/


-- ── TEST 2: Verify headcount total matches active employees ──
/*
SELECT
  (SELECT COUNT(*) FROM employee_current_job) AS total_active_employees,
  (SELECT SUM(activeheadcount) FROM headcount_by_dept) AS total_headcount;
-- Expected: both values equal (same active employees counted differently)
*/


-- ── TEST 3: salary_summary_by_job returns all 14 jobs ────────
/*
SELECT jobcode, jobdesc, assignments, minsalary, maxsalary, avgsalary
FROM salary_summary_by_job
ORDER BY avgsalary DESC NULLS LAST;
-- Expected: 14 rows (one per ACTIVE job)
-- PRES should have highest avg salary
-- Jobs with no active assignments show NULL for salary stats
*/


-- ── TEST 4: No NULLs in key columns ──────────────────────────
/*
SELECT COUNT(*) AS null_deptcode
FROM headcount_by_dept WHERE deptcode IS NULL OR deptname IS NULL;
-- Expected: 0

SELECT COUNT(*) AS null_jobcode
FROM salary_summary_by_job WHERE jobcode IS NULL OR jobdesc IS NULL;
-- Expected: 0
*/


-- ── TEST 5: Soft-delete impact on headcount ───────────────────
-- Soft-delete an employee and confirm their dept headcount drops
/*
-- Note current headcount for dept IT (or any dept)
SELECT deptcode, activeheadcount FROM headcount_by_dept WHERE deptcode = 'IT';

-- Soft-delete an IT employee (adjust empno to match your data)
UPDATE employee
SET record_status = 'INACTIVE', stamp = 'DEACTIVATED | test'
WHERE empno = '00001';

-- Recheck headcount — should be 1 less
SELECT deptcode, activeheadcount FROM headcount_by_dept WHERE deptcode = 'IT';

-- Restore
UPDATE employee
SET record_status = 'ACTIVE', stamp = 'REACTIVATED | test'
WHERE empno = '00001';
*/