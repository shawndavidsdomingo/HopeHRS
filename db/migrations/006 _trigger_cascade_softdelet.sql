-- ============================================================
-- db/migrations/007_trigger_cascade_softdelete.sql
-- Sprint 2 — M3 PR-03: db/trigger-cascade-softdelete
-- ============================================================
-- Cascade trigger: when an employee's record_status changes,
-- all their jobHistory rows are synced to the same status.
--
-- Direction 1 — Soft delete:
--   employee record_status: ACTIVE → INACTIVE
--   Result: all jobhistory rows for that empno → INACTIVE
--
-- Direction 2 — Recovery:
--   employee record_status: INACTIVE → ACTIVE
--   Result: all jobhistory rows for that empno → ACTIVE
--
-- This trigger fires AFTER UPDATE OF record_status ON employee.
-- It is called automatically by:
--   softDeleteEmployee() in employeeService.js
--   recoverEmployee()    in employeeService.js
-- No manual jobhistory update is needed in the service layer.
--
-- Table names confirmed from 001_initial_schema.sql:
--   employee  — empno (PK)
--   jobhistory — empno (FK → employee.empno)
--
-- Run in Supabase SQL Editor (Sprint 2, Week 3).
-- ============================================================


-- ============================================================
-- STEP 1: Drop existing trigger and function (safe re-run)
-- ============================================================

DROP TRIGGER IF EXISTS on_employee_status_change ON employee;
DROP FUNCTION IF EXISTS cascade_employee_soft_delete();


-- ============================================================
-- STEP 2: Create the trigger function
-- ============================================================
-- Fires after record_status is updated on any employee row.
-- Checks which direction the status changed and syncs jobhistory.
-- Stamp records the cascade action + empno + timestamp for audit.

CREATE OR REPLACE FUNCTION cascade_employee_soft_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN

  -- ── Direction 1: Soft delete (ACTIVE → INACTIVE) ──────────
  -- Employee was deactivated — set all their jobhistory to INACTIVE
  IF NEW.record_status = 'INACTIVE' AND OLD.record_status = 'ACTIVE' THEN

    UPDATE jobhistory
    SET
      record_status = 'INACTIVE',
      stamp = LEFT('CASCADE-DEL ' || NEW.empno || ' ' || NOW()::text, 60)
    WHERE empno = NEW.empno;

  END IF;

  -- ── Direction 2: Recovery (INACTIVE → ACTIVE) ─────────────
  -- Employee was recovered — restore all their jobhistory to ACTIVE
  IF NEW.record_status = 'ACTIVE' AND OLD.record_status = 'INACTIVE' THEN

    UPDATE jobhistory
    SET
      record_status = 'ACTIVE',
      stamp = LEFT('CASCADE-RECOVER ' || NEW.empno || ' ' || NOW()::text, 60)
    WHERE empno = NEW.empno;

  END IF;

  RETURN NEW;

END;
$$;


-- ============================================================
-- STEP 3: Attach trigger to employee table
-- ============================================================
-- AFTER UPDATE OF record_status — only fires when record_status
-- column specifically changes, not on every UPDATE to employee.
-- FOR EACH ROW — runs once per updated employee row.

CREATE TRIGGER on_employee_status_change
  AFTER UPDATE OF record_status
  ON employee
  FOR EACH ROW
  EXECUTE FUNCTION cascade_employee_soft_delete();


-- ============================================================
-- STEP 4: Confirm trigger is attached
-- ============================================================

SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_orientation
FROM information_schema.triggers
WHERE event_object_table = 'employee'
  AND trigger_name = 'on_employee_status_change';

-- Expected:
-- trigger_name              | on_employee_status_change
-- event_manipulation        | UPDATE
-- event_object_table        | employee
-- action_timing             | AFTER
-- action_orientation        | ROW


-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
-- Employee 00001 has 2 jobhistory rows:
--   PR1 | 2010-05-11
--   PR2 | 2010-12-01
-- Both must cascade when employee 00001 status changes.
--
-- Run each block separately. Tests 1 and 2 use COMMIT so the
-- state persists between blocks (needed to test both directions).
-- Test 3 verifies the final restore.
-- ============================================================


-- ── TEST 1: Soft delete — employee ACTIVE → INACTIVE ─────────
-- Expected: employee 00001 = INACTIVE
--           both jobhistory rows for 00001 = INACTIVE
--           stamp on jobhistory rows starts with 'CASCADE-DEL'
/*
UPDATE employee
SET record_status = 'INACTIVE',
    stamp = 'DEACTIVATED | test | ' || NOW()::text
WHERE empno = '00001';

-- Check employee
SELECT empno, record_status, stamp
FROM employee
WHERE empno = '00001';

-- Check cascade on jobhistory
SELECT empno, jobcode, effdate, record_status, stamp
FROM jobhistory
WHERE empno = '00001'
ORDER BY effdate;
*/


-- ── TEST 2: USER cannot see 00001 after soft delete ──────────
-- Confirms RLS + cascade work together correctly
-- (run this after TEST 1 is committed)
/*
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "34c06716-3033-4c69-a42f-e9f6604eb722"}';

  -- Employee should be invisible to USER
  SELECT empno FROM employee WHERE empno = '00001';
  -- Expected: 0 rows

  -- jobhistory rows should also be invisible to USER
  SELECT empno, jobcode FROM jobhistory WHERE empno = '00001';
  -- Expected: 0 rows
ROLLBACK;
*/


-- ── TEST 3: Recovery — employee INACTIVE → ACTIVE ────────────
-- Expected: employee 00001 = ACTIVE
--           both jobhistory rows for 00001 = ACTIVE
--           stamp on jobhistory rows starts with 'CASCADE-RECOVER'
/*
UPDATE employee
SET record_status = 'ACTIVE',
    stamp = 'REACTIVATED | test | ' || NOW()::text
WHERE empno = '00001';

-- Check employee
SELECT empno, record_status, stamp
FROM employee
WHERE empno = '00001';

-- Check cascade restore on jobhistory
SELECT empno, jobcode, effdate, record_status, stamp
FROM jobhistory
WHERE empno = '00001'
ORDER BY effdate;
*/


-- ── TEST 4: USER can see 00001 again after recovery ──────────
-- Confirms RLS + cascade restore work together
/*
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "34c06716-3033-4c69-a42f-e9f6604eb722"}';

  -- Employee should be visible again
  SELECT empno, lastname FROM employee WHERE empno = '00001';
  -- Expected: 1 row — Smith, John

  -- jobhistory rows should be visible again
  SELECT empno, jobcode, record_status FROM jobhistory WHERE empno = '00001';
  -- Expected: 2 rows, both ACTIVE
ROLLBACK;
*/


-- ── TEST 5: No cross-contamination ───────────────────────────
-- Soft-deleting employee 00001 must NOT affect 00003's jobhistory
/*
-- First soft-delete 00001
UPDATE employee
SET record_status = 'INACTIVE',
    stamp = 'DEACTIVATED | test | ' || NOW()::text
WHERE empno = '00001';

-- Check 00003 jobhistory is unaffected
SELECT empno, jobcode, record_status
FROM jobhistory
WHERE empno = '00003'
ORDER BY effdate;
-- Expected: 2 rows (PR2/ANYS) both still ACTIVE

-- Restore 00001 after test
UPDATE employee
SET record_status = 'ACTIVE',
    stamp = 'REACTIVATED | test | ' || NOW()::text
WHERE empno = '00001';
*/


-- ── TEST 6: Trigger does NOT fire on non-status updates ──────
-- Updating lastname must NOT change jobhistory
/*
-- Note jobhistory stamp before
SELECT empno, jobcode, stamp FROM jobhistory WHERE empno = '00001';

-- Update a non-status column
UPDATE employee SET lastname = 'SmithTest' WHERE empno = '00001';

-- Check jobhistory stamp is unchanged
SELECT empno, jobcode, stamp FROM jobhistory WHERE empno = '00001';
-- Expected: stamp identical to before — trigger did not fire

-- Restore lastname
UPDATE employee SET lastname = 'Smith' WHERE empno = '00001';
*/