-- ============================================================
-- db/migrations/007_view_employee_current_job.sql
-- Sprint 2 — M3 PR-04: db/view-employee-current-job
-- ============================================================
-- Creates the employee_current_job view.
--
-- Purpose:
--   Returns one row per ACTIVE employee showing their most
--   recent ACTIVE job assignment, joined with job description
--   and department name.
--
-- Used by:
--   Employees.jsx  — EmployeeListPage current job column
--   EmployeeDetailPage.jsx — employee profile header
--
-- Logic:
--   "Latest active jobHistory" = the row with the MAX(effdate)
--   among all ACTIVE jobhistory rows for that employee.
--   Only ACTIVE employees and ACTIVE jobhistory rows are included.
--
-- Column names confirmed from 001_initial_schema.sql:
--   employee   : empno, lastname, firstname, gender, hiredate,
--                sepdate, record_status, stamp
--   jobhistory : empno, jobcode, effdate, salary, deptcode,
--                record_status
--   job        : jobcode, jobdesc, record_status
--   department : deptcode, deptname, record_status
--
-- Run in Supabase SQL Editor (Sprint 2, Week 3).
-- ============================================================


-- ============================================================
-- STEP 1: Drop existing view (safe re-run)
-- ============================================================

DROP VIEW IF EXISTS employee_current_job;


-- ============================================================
-- STEP 2: Create the view
-- ============================================================

CREATE VIEW employee_current_job AS
SELECT
  e.empno,
  e.lastname,
  e.firstname,
  e.gender,
  e.hiredate,
  e.sepdate,
  e.record_status   AS emp_status,
  e.stamp           AS emp_stamp,

  -- Current job details
  jh.jobcode,
  j.jobdesc,
  jh.effdate        AS current_effdate,
  jh.salary         AS current_salary,

  -- Current department details
  jh.deptcode,
  d.deptname

FROM employee e

-- Join to the latest ACTIVE jobhistory row for each employee
JOIN jobhistory jh
  ON jh.empno   = e.empno
  AND jh.effdate = (
    SELECT MAX(jh2.effdate)
    FROM jobhistory jh2
    WHERE jh2.empno          = e.empno
      AND jh2.record_status  = 'ACTIVE'
  )
  AND jh.record_status = 'ACTIVE'

-- Join job for jobdesc
JOIN job j
  ON j.jobcode        = jh.jobcode
  AND j.record_status = 'ACTIVE'

-- Join department for deptname
JOIN department d
  ON d.deptcode        = jh.deptcode
  AND d.record_status  = 'ACTIVE'

-- Only ACTIVE employees
WHERE e.record_status = 'ACTIVE';


-- ============================================================
-- STEP 3: Confirm view was created
-- ============================================================

SELECT table_name, table_type
FROM information_schema.tables
WHERE table_name = 'employee_current_job'
  AND table_schema = 'public';

-- Expected:
-- table_name           | table_type
-- employee_current_job | VIEW


-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================


-- ── TEST 1: View returns rows ─────────────────────────────────
-- Expected: one row per ACTIVE employee who has at least one
-- ACTIVE jobhistory row — should return ~32 rows from seed data
/*
SELECT
  empno,
  lastname,
  firstname,
  jobcode,
  jobdesc,
  deptcode,
  deptname,
  current_effdate,
  current_salary
FROM employee_current_job
ORDER BY empno;
*/


-- ── TEST 2: Each employee appears only once ───────────────────
-- Expected: count per empno = 1 for all rows
-- If any empno shows count > 1, the subquery is not picking
-- a unique latest effdate (possible tie on same date)
/*
SELECT empno, COUNT(*) AS row_count
FROM employee_current_job
GROUP BY empno
HAVING COUNT(*) > 1;
-- Expected: 0 rows (no duplicates)
*/


-- ── TEST 3: Correct latest job is shown ──────────────────────
-- Employee 00007 has 3 jobhistory rows:
--   ANYS | 2010-05-30
--   MGR  | 2011-01-02
--   VP   | 2011-03-31  ← this is the latest
-- View must show VP for employee 00007
/*
SELECT empno, lastname, jobcode, jobdesc, current_effdate
FROM employee_current_job
WHERE empno = '00007';
-- Expected: jobcode = VP, jobdesc = Vice president,
--           current_effdate = 2011-03-31
*/


-- ── TEST 4: jobdesc and deptname are resolved ─────────────────
-- Confirm no NULLs in jobdesc or deptname columns
/*
SELECT COUNT(*) AS null_jobdesc  FROM employee_current_job WHERE jobdesc  IS NULL;
SELECT COUNT(*) AS null_deptname FROM employee_current_job WHERE deptname IS NULL;
-- Expected: both = 0
*/


-- ── TEST 5: INACTIVE employee is excluded ────────────────────
-- Soft-delete an employee and confirm they disappear from view
/*
-- Soft-delete employee 00001
UPDATE employee
SET record_status = 'INACTIVE',
    stamp = 'DEACTIVATED | test | ' || NOW()::text
WHERE empno = '00001';

-- Check view — 00001 should not appear
SELECT empno FROM employee_current_job WHERE empno = '00001';
-- Expected: 0 rows

-- Restore employee 00001
UPDATE employee
SET record_status = 'ACTIVE',
    stamp = 'REACTIVATED | test | ' || NOW()::text
WHERE empno = '00001';

-- Check view — 00001 should appear again
SELECT empno, jobcode FROM employee_current_job WHERE empno = '00001';
-- Expected: 1 row
*/


-- ── TEST 6: View used in Employees.jsx query ──────────────────
-- This is the exact query the frontend will run to populate
-- the EmployeeListPage current job column
/*
SELECT
  empno,
  lastname,
  firstname,
  gender,
  hiredate,
  sepdate,
  jobcode,
  jobdesc,
  deptcode,
  deptname,
  current_salary
FROM employee_current_job
ORDER BY empno;
*/