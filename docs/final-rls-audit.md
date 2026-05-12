# Final RLS Audit & Hard-Delete Verification Report
## `docs/final-rls-audit.md`
**Sprint 3 — M3 PR-03: docs/final-rls-audit**
Prepared by: M3 – Backend / Database Engineer
Sprint 3 | Weeks 5–6 | HopeHRS Project

---

## How to Use This Document

1. Open **Supabase Dashboard → SQL Editor**
2. Run each SQL block exactly as written
3. Compare result to the **Expected** column
4. Mark each check ✅ PASS or ❌ FAIL
5. For codebase checks, run commands in terminal at project root
6. All 62 checks must show ✅ PASS before Sprint 3 closes

**Test accounts used for RLS impersonation:**

| Role | Email | UUID |
|---|---|---|
| SUPERADMIN | jcesperanza@neu.edu.ph | `8012de63-ec6c-43eb-aa20-268ea59aeb0c` |
| ADMIN | shawndavidsobremontedomingo@gmail.com | `e4f08763-b32c-4178-b2c3-4b79db1ffbd5` |
| USER | reneespina1199@gmail.com | `34c06716-3033-4c69-a42f-e9f6604eb722` |

> **Important:** Always run impersonation tests inside `BEGIN; ... ROLLBACK;`
> blocks so no real data is changed.

---

---

## SECTION 1: employee RLS

### Step 1.1 — Confirm exactly 5 policies exist on employee

```sql
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'employee'
ORDER BY cmd, policyname;
```

**Expected — exactly these 5 rows, nothing else:**
```
emp_insert         | INSERT
emp_select         | SELECT
emp_update_del     | UPDATE
emp_update_edit    | UPDATE
emp_update_recover | UPDATE
```

| Check | Expected | Result | Remarks |
|---|---|---|---|
| Exactly 5 policies, no extras | 5 rows | ⬜ | |

---

### Step 1.2 — Confirm no _dev policies on employee

```sql
SELECT policyname FROM pg_policies
WHERE tablename = 'employee'
AND policyname LIKE '%_dev';
```

**Expected: 0 rows**

| Check | Expected | Result | Remarks |
|---|---|---|---|
| Zero _dev policies on employee | 0 rows | ⬜ | |

---

### Step 1.3 — USER sees only ACTIVE employees

```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "34c06716-3033-4c69-a42f-e9f6604eb722"}';

  SELECT empno, record_status FROM employee
  WHERE record_status = 'INACTIVE';
  -- Expected: 0 rows (INACTIVE rows invisible to USER)

  SELECT COUNT(*) AS visible_count FROM employee;
  -- Expected: count of ACTIVE employees only
ROLLBACK;
```

| Check | Expected | Result | Remarks |
|---|---|---|---|
| USER cannot see INACTIVE employees | 0 rows | ⬜ | |
| USER sees all ACTIVE employees | Count matches ACTIVE only | ⬜ | |

---

### Step 1.4 — USER cannot INSERT employee

```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "34c06716-3033-4c69-a42f-e9f6604eb722"}';

  INSERT INTO employee (empno, lastname, firstname, gender, birthdate, hiredate, record_status, stamp)
  VALUES ('99999', 'Test', 'User', 'M', '1990-01-01', '2024-01-01', 'ACTIVE', 'TEST');
ROLLBACK;
```

**Expected: ERROR — new row violates row-level security policy**

| Check | Expected | Result | Remarks |
|---|---|---|---|
| USER INSERT blocked | RLS error | ⬜ | |

---

### Step 1.5 — ADMIN cannot soft-delete employee (EMP_DEL = 0)

```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "e4f08763-b32c-4178-b2c3-4b79db1ffbd5"}';

  UPDATE employee SET record_status = 'INACTIVE'
  WHERE empno = '00001';
  -- Expected: UPDATE 0
ROLLBACK;
```

| Check | Expected | Result | Remarks |
|---|---|---|---|
| ADMIN soft-delete blocked | UPDATE 0 | ⬜ | |

---

### Step 1.6 — SUPERADMIN can soft-delete employee

```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "8012de63-ec6c-43eb-aa20-268ea59aeb0c"}';

  UPDATE employee SET record_status = 'INACTIVE', stamp = 'AUDIT TEST'
  WHERE empno = '00001';
  -- Expected: UPDATE 1

  SELECT empno, record_status FROM employee WHERE empno = '00001';
  -- Expected: INACTIVE
ROLLBACK;
```

| Check | Expected | Result | Remarks |
|---|---|---|---|
| SUPERADMIN soft-delete succeeds | UPDATE 1 | ⬜ | |
| Employee shows INACTIVE inside transaction | INACTIVE | ⬜ | |

---

---

## SECTION 2: jobhistory RLS

### Step 2.1 — Confirm exactly 5 policies exist on jobhistory

```sql
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'jobhistory'
ORDER BY cmd, policyname;
```

**Expected — exactly these 5 rows:**
```
jh_insert         | INSERT
jh_select         | SELECT
jh_update_del     | UPDATE
jh_update_edit    | UPDATE
jh_update_recover | UPDATE
```

| Check | Expected | Result | Remarks |
|---|---|---|---|
| Exactly 5 policies, no extras | 5 rows | ⬜ | |

---

### Step 2.2 — Confirm no _dev policies on jobhistory

```sql
SELECT policyname FROM pg_policies
WHERE tablename = 'jobhistory'
AND policyname LIKE '%_dev';
```

**Expected: 0 rows**

| Check | Expected | Result | Remarks |
|---|---|---|---|
| Zero _dev policies on jobhistory | 0 rows | ⬜ | |

---

### Step 2.3 — USER sees only ACTIVE jobhistory rows

```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "34c06716-3033-4c69-a42f-e9f6604eb722"}';

  SELECT COUNT(*) AS inactive_count FROM jobhistory
  WHERE record_status = 'INACTIVE';
  -- Expected: 0 rows
ROLLBACK;
```

| Check | Expected | Result | Remarks |
|---|---|---|---|
| USER cannot see INACTIVE jobhistory | 0 rows | ⬜ | |

---

### Step 2.4 — USER cannot INSERT jobhistory

```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "34c06716-3033-4c69-a42f-e9f6604eb722"}';

  INSERT INTO jobhistory (empno, jobcode, effdate, salary, deptcode, record_status, stamp)
  VALUES ('00001', 'HRS', '2024-01-01', 50000, 'HRD', 'ACTIVE', 'TEST');
ROLLBACK;
```

**Expected: ERROR — new row violates row-level security policy**

| Check | Expected | Result | Remarks |
|---|---|---|---|
| USER INSERT blocked | RLS error | ⬜ | |

---

### Step 2.5 — ADMIN cannot soft-delete jobhistory (JH_DEL = 0)

```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "e4f08763-b32c-4178-b2c3-4b79db1ffbd5"}';

  UPDATE jobhistory SET record_status = 'INACTIVE'
  WHERE empno = '00001' AND jobcode = 'PR1';
  -- Expected: UPDATE 0
ROLLBACK;
```

| Check | Expected | Result | Remarks |
|---|---|---|---|
| ADMIN soft-delete jobhistory blocked | UPDATE 0 | ⬜ | |

---

---

## SECTION 3: job RLS

### Step 3.1 — Confirm exactly 5 policies exist on job

```sql
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'job'
ORDER BY cmd, policyname;
```

**Expected — exactly these 5 rows:**
```
job_insert         | INSERT
job_select         | SELECT
job_update_del     | UPDATE
job_update_edit    | UPDATE
job_update_recover | UPDATE
```

| Check | Expected | Result | Remarks |
|---|---|---|---|
| Exactly 5 policies, no extras | 5 rows | ⬜ | |

---

### Step 3.2 — Confirm no _dev policies on job

```sql
SELECT policyname FROM pg_policies
WHERE tablename = 'job'
AND policyname LIKE '%_dev';
```

**Expected: 0 rows**

| Check | Expected | Result | Remarks |
|---|---|---|---|
| Zero _dev policies on job | 0 rows | ⬜ | |

---

### Step 3.3 — USER sees only ACTIVE jobs

```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "34c06716-3033-4c69-a42f-e9f6604eb722"}';

  SELECT COUNT(*) AS inactive_count FROM job
  WHERE record_status = 'INACTIVE';
  -- Expected: 0 rows

  SELECT COUNT(*) AS total FROM job;
  -- Expected: 14 (all seed jobs are ACTIVE)
ROLLBACK;
```

| Check | Expected | Result | Remarks |
|---|---|---|---|
| USER cannot see INACTIVE jobs | 0 rows | ⬜ | |
| USER sees all 14 seed jobs | 14 | ⬜ | |

---

### Step 3.4 — USER cannot INSERT job

```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "34c06716-3033-4c69-a42f-e9f6604eb722"}';

  INSERT INTO job (jobcode, jobdesc, record_status, stamp)
  VALUES ('TST1', 'Test Job', 'ACTIVE', 'TEST');
ROLLBACK;
```

**Expected: ERROR — new row violates row-level security policy**

| Check | Expected | Result | Remarks |
|---|---|---|---|
| USER INSERT job blocked | RLS error | ⬜ | |

---

### Step 3.5 — ADMIN cannot soft-delete job (JOB_DEL = 0)

```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "e4f08763-b32c-4178-b2c3-4b79db1ffbd5"}';

  UPDATE job SET record_status = 'INACTIVE'
  WHERE jobcode = 'HRS';
  -- Expected: UPDATE 0
ROLLBACK;
```

| Check | Expected | Result | Remarks |
|---|---|---|---|
| ADMIN soft-delete job blocked | UPDATE 0 | ⬜ | |

---

---

## SECTION 4: department RLS

### Step 4.1 — Confirm exactly 5 policies exist on department

```sql
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'department'
ORDER BY cmd, policyname;
```

**Expected — exactly these 5 rows:**
```
dept_insert         | INSERT
dept_select         | SELECT
dept_update_del     | UPDATE
dept_update_edit    | UPDATE
dept_update_recover | UPDATE
```

| Check | Expected | Result | Remarks |
|---|---|---|---|
| Exactly 5 policies, no extras | 5 rows | ⬜ | |

---

### Step 4.2 — Confirm no _dev policies on department

```sql
SELECT policyname FROM pg_policies
WHERE tablename = 'department'
AND policyname LIKE '%_dev';
```

**Expected: 0 rows**

| Check | Expected | Result | Remarks |
|---|---|---|---|
| Zero _dev policies on department | 0 rows | ⬜ | |

---

### Step 4.3 — USER sees only ACTIVE departments

```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "34c06716-3033-4c69-a42f-e9f6604eb722"}';

  SELECT COUNT(*) AS inactive_count FROM department
  WHERE record_status = 'INACTIVE';
  -- Expected: 0 rows

  SELECT COUNT(*) AS total FROM department;
  -- Expected: 8 (all seed departments are ACTIVE)
ROLLBACK;
```

| Check | Expected | Result | Remarks |
|---|---|---|---|
| USER cannot see INACTIVE departments | 0 rows | ⬜ | |
| USER sees all 8 seed departments | 8 | ⬜ | |

---

### Step 4.4 — USER cannot INSERT department

```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "34c06716-3033-4c69-a42f-e9f6604eb722"}';

  INSERT INTO department (deptcode, deptname, record_status, stamp)
  VALUES ('TST', 'Test Dept', 'ACTIVE', 'TEST');
ROLLBACK;
```

**Expected: ERROR — new row violates row-level security policy**

| Check | Expected | Result | Remarks |
|---|---|---|---|
| USER INSERT department blocked | RLS error | ⬜ | |

---

### Step 4.5 — ADMIN cannot soft-delete department (DEPT_DEL = 0)

```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "e4f08763-b32c-4178-b2c3-4b79db1ffbd5"}';

  UPDATE department SET record_status = 'INACTIVE'
  WHERE deptcode = 'IT';
  -- Expected: UPDATE 0
ROLLBACK;
```

| Check | Expected | Result | Remarks |
|---|---|---|---|
| ADMIN soft-delete department blocked | UPDATE 0 | ⬜ | |

---

---

## SECTION 5: hr_user RLS

### Step 5.1 — Confirm exactly 2 policies exist on hr_user

```sql
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'hr_user'
ORDER BY cmd, policyname;
```

**Expected — exactly these 2 rows:**
```
hr_user_select        | SELECT
hr_user_update_status | UPDATE
```

| Check | Expected | Result | Remarks |
|---|---|---|---|
| Exactly 2 policies on hr_user | 2 rows | ⬜ | |

---

### Step 5.2 — Any authenticated user can read their own row

```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "34c06716-3033-4c69-a42f-e9f6604eb722"}';

  SELECT userid, email, user_type, record_status FROM hr_user
  WHERE userid = '34c06716-3033-4c69-a42f-e9f6604eb722';
  -- Expected: 1 row — their own record
ROLLBACK;
```

| Check | Expected | Result | Remarks |
|---|---|---|---|
| USER can read own hr_user row | 1 row | ⬜ | |

---

### Step 5.3 — ADMIN cannot deactivate SUPERADMIN

```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "e4f08763-b32c-4178-b2c3-4b79db1ffbd5"}';

  UPDATE hr_user SET record_status = 'INACTIVE'
  WHERE email = 'jcesperanza@neu.edu.ph';
  -- Expected: UPDATE 0
ROLLBACK;
```

| Check | Expected | Result | Remarks |
|---|---|---|---|
| ADMIN cannot deactivate SUPERADMIN | UPDATE 0 | ⬜ | |

---

### Step 5.4 — ADMIN cannot promote user to SUPERADMIN

```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "e4f08763-b32c-4178-b2c3-4b79db1ffbd5"}';

  UPDATE hr_user SET user_type = 'SUPERADMIN'
  WHERE email = 'hakdogen692@gmail.com';
  -- Expected: RLS error (WITH CHECK violation)
ROLLBACK;
```

| Check | Expected | Result | Remarks |
|---|---|---|---|
| ADMIN cannot promote to SUPERADMIN | RLS error | ⬜ | |

---

---

## SECTION 6: user_module_rights RLS

### Step 6.1 — Confirm exactly 4 policies exist on user_module_rights

```sql
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'user_module_rights'
ORDER BY cmd, policyname;
```

**Expected — exactly these 4 rows:**
```
umr_delete | DELETE
umr_insert | INSERT
umr_select | SELECT
umr_update | UPDATE
```

| Check | Expected | Result | Remarks |
|---|---|---|---|
| Exactly 4 policies on user_module_rights | 4 rows | ⬜ | |

---

### Step 6.2 — ADMIN can read user_module_rights

```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "e4f08763-b32c-4178-b2c3-4b79db1ffbd5"}';

  SELECT COUNT(*) FROM user_module_rights;
  -- Expected: full count of all rights rows
ROLLBACK;
```

| Check | Expected | Result | Remarks |
|---|---|---|---|
| ADMIN can SELECT user_module_rights | Row count > 0 | ⬜ | |

---

### Step 6.3 — ADMIN cannot modify SUPERADMIN rights

```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "e4f08763-b32c-4178-b2c3-4b79db1ffbd5"}';

  UPDATE user_module_rights SET right_value = 0
  WHERE userid = (
    SELECT userid FROM hr_user
    WHERE email = 'jcesperanza@neu.edu.ph'
    LIMIT 1
  )
  AND rightcode = 'ADM_USER';
  -- Expected: UPDATE 0
ROLLBACK;
```

| Check | Expected | Result | Remarks |
|---|---|---|---|
| ADMIN cannot modify SUPERADMIN rights | UPDATE 0 | ⬜ | |

---

### Step 6.4 — ADMIN cannot INSERT user_module_rights

```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "e4f08763-b32c-4178-b2c3-4b79db1ffbd5"}';

  INSERT INTO user_module_rights (userid, rightcode, right_value)
  VALUES ('34c06716-3033-4c69-a42f-e9f6604eb722', 'EMP_DEL', 1);
  -- Expected: RLS error
ROLLBACK;
```

| Check | Expected | Result | Remarks |
|---|---|---|---|
| ADMIN cannot INSERT user_module_rights | RLS error | ⬜ | |

---

### Step 6.5 — ADMIN cannot DELETE user_module_rights

```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "e4f08763-b32c-4178-b2c3-4b79db1ffbd5"}';

  DELETE FROM user_module_rights
  WHERE userid = '34c06716-3033-4c69-a42f-e9f6604eb722'
  AND rightcode = 'EMP_VIEW';
  -- Expected: RLS error or DELETE 0
ROLLBACK;
```

| Check | Expected | Result | Remarks |
|---|---|---|---|
| ADMIN cannot DELETE user_module_rights | RLS error or DELETE 0 | ⬜ | |

---

---

## SECTION 7: No Dev-Mode Policy Bypass

### Step 7.1 — Zero _dev policies across all 6 tables

```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN (
  'employee', 'jobhistory', 'job', 'department',
  'hr_user', 'user_module_rights'
)
AND policyname LIKE '%_dev'
ORDER BY tablename;
```

**Expected: 0 rows**

| Check | Expected | Result | Remarks |
|---|---|---|---|
| Zero _dev policies in production | 0 rows | ⬜ | |

---

---

## SECTION 8: SECURITY DEFINER Helper Functions

### Step 8.1 — All 4 functions exist with SECURITY DEFINER

```sql
SELECT routine_name, security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'get_my_user_type',
  'is_admin_or_above',
  'is_superadmin',
  'get_user_type_for'
)
ORDER BY routine_name;
```

**Expected: 4 rows, all `security_type = DEFINER`**

| Function | Expected security_type | Result | Remarks |
|---|---|---|---|
| `get_my_user_type` | DEFINER | ⬜ | |
| `is_admin_or_above` | DEFINER | ⬜ | |
| `is_superadmin` | DEFINER | ⬜ | |
| `get_user_type_for` | DEFINER | ⬜ | |

---

### Step 8.2 — Functions return correct values for ADMIN

```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "e4f08763-b32c-4178-b2c3-4b79db1ffbd5"}';

  SELECT
    get_my_user_type()  AS my_type,
    is_admin_or_above() AS am_i_admin,
    is_superadmin()     AS am_i_superadmin;
  -- Expected: my_type = ADMIN, am_i_admin = true, am_i_superadmin = false
ROLLBACK;
```

| Check | Expected | Result | Remarks |
|---|---|---|---|
| `get_my_user_type()` for ADMIN | ADMIN | ⬜ | |
| `is_admin_or_above()` for ADMIN | true | ⬜ | |
| `is_superadmin()` for ADMIN | false | ⬜ | |

---

---

## SECTION 9: Trigger Audit

### Step 9.1 — All 3 triggers exist

```sql
SELECT trigger_name, event_object_table, event_manipulation, action_timing
FROM information_schema.triggers
WHERE trigger_name IN (
  'on_auth_user_created',
  'on_employee_status_change',
  'on_hr_user_insert_assign_display_id'
)
ORDER BY trigger_name;
```

**Expected: 3 rows**

| Trigger | Table | Event | Status |
|---|---|---|---|
| `on_auth_user_created` | `auth.users` | INSERT | ⬜ |
| `on_employee_status_change` | `employee` | UPDATE | ⬜ |
| `on_hr_user_insert_assign_display_id` | `hr_user` | INSERT | ⬜ |

---

### Step 9.2 — Cascade trigger works in both directions

```sql
-- Step A: Soft-delete employee 00001
UPDATE employee
SET record_status = 'INACTIVE', stamp = 'AUDIT TEST'
WHERE empno = '00001';

-- Step B: Confirm all jobhistory rows for 00001 are INACTIVE
SELECT empno, jobcode, record_status FROM jobhistory
WHERE empno = '00001';
-- Expected: all rows INACTIVE

-- Step C: Recover employee 00001
UPDATE employee
SET record_status = 'ACTIVE', stamp = 'AUDIT RESTORE'
WHERE empno = '00001';

-- Step D: Confirm all jobhistory rows for 00001 are ACTIVE again
SELECT empno, jobcode, record_status FROM jobhistory
WHERE empno = '00001';
-- Expected: all rows ACTIVE
```

| Check | Expected | Result | Remarks |
|---|---|---|---|
| Cascade deactivate: all jobhistory INACTIVE | All INACTIVE | ⬜ | |
| Cascade restore: all jobhistory ACTIVE | All ACTIVE | ⬜ | |

---

---

## SECTION 10: Hard-Delete Audit — Codebase

### Step 10.1 — Run in terminal at project root

```bash
# 1. Check all service files for .delete( calls
grep -rn "\.delete(" src/lib/

# 2. Check all source files for DELETE SQL
grep -rn "DELETE FROM" src/

# 3. Check migration files for DELETE SQL outside comments
grep -rn "DELETE FROM" db/migrations/
```

**Step-by-step:**

1. Open terminal at your project root (`C:\Users\shawn\Github\HopeHRS`)
2. Run command 1 — expected: no output (0 results)
3. Run command 2 — expected: no output (0 results)
4. Run command 3 — any results should only be inside `/* */` comment blocks

| Check | Expected | Result | Remarks |
|---|---|---|---|
| `.delete(` in `src/lib/employeeService.js` | 0 results | ⬜ | |
| `.delete(` in `src/lib/jobHistoryService.js` | 0 results | ⬜ | |
| `.delete(` in `src/lib/jobService.js` | 0 results | ⬜ | |
| `.delete(` in `src/lib/departmentService.js` | 0 results | ⬜ | |
| `.delete(` in `src/lib/adminService.js` | 0 results | ⬜ | |
| `DELETE FROM` anywhere in `src/` | 0 results | ⬜ | |
| `DELETE FROM` in migrations outside comments | 0 results | ⬜ | |

---

---

## SECTION 11: Hard-Delete Audit — Supabase Functions

### Step 11.1 — No trigger function contains DELETE

```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_definition ILIKE '%DELETE%';
```

**Expected: 0 rows**

> Note: If any results appear, open the function body and confirm the
> word DELETE only appears inside a SQL comment (`--` or `/* */`),
> not as an actual statement.

| Check | Expected | Result | Remarks |
|---|---|---|---|
| No trigger function contains DELETE statement | 0 rows | ⬜ | |

---

---

## SECTION 12: Row Count Verification

### Step 12.1 — Confirm no rows were hard deleted

```sql
SELECT
  (SELECT COUNT(*) FROM employee)   AS employees,
  (SELECT COUNT(*) FROM jobhistory)  AS jobhistory,
  (SELECT COUNT(*) FROM job)         AS jobs,
  (SELECT COUNT(*) FROM department)  AS departments;
```

**Expected minimums (seed data + any added during testing):**

| Table | Min Expected | Actual Count | Status |
|---|---|---|---|
| `employee` | 32 | | ⬜ |
| `jobhistory` | 54 | | ⬜ |
| `job` | 14 | | ⬜ |
| `department` | 8 | | ⬜ |

---

---

## SECTION 13: Database Backup Verification

### Step 13.1 — Verify backup in Supabase Dashboard

1. Go to **Supabase Dashboard**
2. Click your project
3. Go to **Settings** (gear icon in left sidebar)
4. Click **Database**
5. Scroll down to **Backups** section
6. Confirm automatic backups are listed

| Check | Expected | Result | Remarks |
|---|---|---|---|
| Backups section visible in Dashboard | Visible | ⬜ | |
| Most recent backup timestamp shown | Within last 24 hours | ⬜ | |
| Backup status shows successful | Active / Enabled | ⬜ | |

**Most recent backup timestamp:** `___________________`

---

---

## Final Summary

| Section | Checks | ✅ Pass | ❌ Fail | ⬜ Pending |
|---|---|---|---|---|
| 1. employee RLS | 7 | | | 7 |
| 2. jobhistory RLS | 5 | | | 5 |
| 3. job RLS | 5 | | | 5 |
| 4. department RLS | 5 | | | 5 |
| 5. hr_user RLS | 4 | | | 4 |
| 6. user_module_rights RLS | 5 | | | 5 |
| 7. No dev-mode bypass | 1 | | | 1 |
| 8. SECURITY DEFINER functions | 7 | | | 7 |
| 9. Trigger audit | 5 | | | 5 |
| 10. Hard-delete codebase | 7 | | | 7 |
| 11. Hard-delete Supabase functions | 1 | | | 1 |
| 12. Row count verification | 4 | | | 4 |
| 13. Database backup | 3 | | | 3 |
| **TOTAL** | **59** | **0** | **0** | **59** |

---

## Sprint 3 Gate Requirement

> All 59 checks must show ✅ PASS before the project is considered complete.
> Any ❌ FAIL must be documented in the Remarks column with the issue
> description and the resolution applied.

---

*Document prepared by M3 — Backend / Database Engineer*
*New Era University — BS Information Technology | AY 2025–2026*