# Sprint 2 — Cascade, Recovery, API Bypass & Stamp Tests
## `test/sprint2-cascade-visibility.md`
Prepared by: M5 – QA / Documentation Specialist
Sprint 2 | Weeks 3–4 | HopeHRS Project

---

## Overview

This document covers 5 test categories required for the Sprint 2 gate:

| # | Test Category | Cases | Status |
|---|---|---|---|
| 1 | Soft-delete cascade | 4 | ⬜ Pending |
| 2 | Recovery cascade | 4 | ⬜ Pending |
| 3 | Visibility bypass (API-level RLS) | 4 | ⬜ Pending |
| 4 | Stamp visibility | 4 | ⬜ Pending |
| 5 | No hard delete audit | 1 | ⬜ Pending |

**Total: 17 test cases**

---

## Prerequisites

Before running any test, confirm the following in Supabase:

```sql
-- Confirm all HR tables have RLS enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('employee', 'jobhistory', 'job', 'department');
-- Expected: rowsecurity = true for all 4

-- Confirm cascade trigger is attached
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_employee_status_change';
-- Expected: 1 row

-- Confirm employee 00001 is ACTIVE and has 2 jobHistory rows
SELECT empno, record_status FROM employee WHERE empno = '00001';
SELECT empno, jobcode, effdate, record_status FROM jobhistory WHERE empno = '00001';
-- Expected: employee ACTIVE, 2 jobHistory rows both ACTIVE
```

**Test accounts used:**

| Role | Email | UUID |
|---|---|---|
| SUPERADMIN | @neu.edu.ph | `----` |
| ADMIN | @gmail.com | `----` |
| USER | @gmail.com | `----` |

---

---

# CATEGORY 1: Soft-Delete Cascade Tests

**Scenario:** SUPERADMIN soft-deletes employee 00001. All their jobHistory
rows must cascade to INACTIVE. USER must not see them. ADMIN must see them
in Deleted Items.

---

## TEST C-01 — SUPERADMIN soft-deletes employee 00001

**Method:** UI

**Steps:**
1. Log in as SUPERADMIN (`shawndavid.domingo@neu.edu.ph`)
2. Go to `/employees`
3. Find employee `00001` in the list
4. Click the **Delete** button on that row
5. Read the confirmation dialog — confirm it mentions cascade to job history
6. Click **Confirm Deactivate**

**Verify in Supabase SQL Editor:**
```sql
-- Employee must be INACTIVE
SELECT empno, record_status, stamp
FROM employee
WHERE empno = '00001';
-- Expected: record_status = INACTIVE, stamp starts with DEACTIVATED

-- All jobHistory rows for 00001 must be INACTIVE (cascade)
SELECT empno, jobcode, effdate, record_status, stamp
FROM jobhistory
WHERE empno = '00001'
ORDER BY effdate;
-- Expected: both rows INACTIVE, stamp starts with CASCADE-DEL
```

| Check | Expected | Result | Remarks |
|---|---|---|---|
| Employee 00001 record_status | INACTIVE | ⬜ | |
| Employee 00001 stamp | starts with DEACTIVATED | ⬜ | |
| All jobHistory rows for 00001 | INACTIVE | ⬜ | |
| jobHistory stamp | starts with CASCADE-DEL | ⬜ | |

---

## TEST C-02 — USER cannot see employee 00001 or their jobHistory after cascade

**Method:** UI + SQL

**Steps (UI):**
1. Log in as USER
2. Go to `/employees`
3. Confirm employee `00001` does **not** appear in the list
4. Go to `/jobhistory`
5. Confirm no jobHistory rows for `00001` appear

**Steps (SQL — RLS verification):**
```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "----"}';

  -- Employee must be invisible
  SELECT empno FROM employee WHERE empno = '00001';
  -- Expected: 0 rows

  -- jobHistory rows must be invisible
  SELECT empno, jobcode FROM jobhistory WHERE empno = '00001';
  -- Expected: 0 rows
ROLLBACK;
```

| Check | Expected | Result | Remarks |
|---|---|---|---|
| Employee 00001 visible to USER in UI | Not visible | ⬜ | |
| jobHistory rows for 00001 visible to USER in UI | Not visible | ⬜ | |
| Employee 00001 via RLS impersonation | 0 rows | ⬜ | |
| jobHistory rows via RLS impersonation | 0 rows | ⬜ | |

---

## TEST C-03 — ADMIN sees employee 00001 in Deleted Items

**Method:** UI

**Steps:**
1. Log in as ADMIN (`@gmail.com`)
2. Go to `/deleted-items`
3. Click the **Employees** tab
4. Confirm employee `00001` appears in the list with status INACTIVE
5. Click the **Job History** tab
6. Confirm both jobHistory rows for `00001` appear with status INACTIVE

| Check | Expected | Result | Remarks |
|---|---|---|---|
| Deleted Items page accessible to ADMIN | Yes | ⬜ | |
| Employee 00001 in Employees tab | Visible, INACTIVE | ⬜ | |
| jobHistory rows for 00001 in Job History tab | Both visible, INACTIVE | ⬜ | |

---

## TEST C-04 — ADMIN cannot see employee 00001 in main Employee list

**Method:** UI

**Steps:**
1. While still logged in as ADMIN
2. Go to `/employees`
3. Confirm employee `00001` does **not** appear in the main list
4. Go to `/jobhistory`
5. Confirm jobHistory rows for `00001` do **not** appear

**Verify in SQL:**
```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "----"}';

  -- ADMIN should see all rows including INACTIVE
  SELECT empno, record_status FROM employee WHERE empno = '00001';
  -- Expected: 1 row, INACTIVE

  -- ADMIN sees all jobHistory rows
  SELECT empno, jobcode, record_status FROM jobhistory WHERE empno = '00001';
  -- Expected: 2 rows, both INACTIVE
ROLLBACK;
```

> **Note:** ADMIN sees INACTIVE rows via RLS (they have full SELECT access)
> but the app UI filters them to the Deleted Items panel only.

| Check | Expected | Result | Remarks |
|---|---|---|---|
| Employee 00001 in main /employees list for ADMIN | Not visible in UI | ⬜ | |
| Employee 00001 via SQL as ADMIN | 1 row, INACTIVE | ⬜ | |
| jobHistory for 00001 via SQL as ADMIN | 2 rows, INACTIVE | ⬜ | |

---

---

# CATEGORY 2: Recovery Cascade Tests

**Scenario:** ADMIN recovers employee 00001 from Deleted Items. All their
jobHistory rows must cascade back to ACTIVE. USER must be able to see them again.

---

## TEST R-01 — ADMIN recovers employee 00001 from Deleted Items

**Method:** UI

**Steps:**
1. Log in as ADMIN (`@gmail.com`)
2. Go to `/deleted-items` → **Employees** tab
3. Find employee `00001`
4. Click the **Recover** button
5. Confirm the row disappears from the Deleted Items list

**Verify in Supabase SQL Editor:**
```sql
-- Employee must be ACTIVE again
SELECT empno, record_status, stamp
FROM employee
WHERE empno = '00001';
-- Expected: record_status = ACTIVE, stamp starts with REACTIVATED

-- All jobHistory rows for 00001 must be ACTIVE (cascade restore)
SELECT empno, jobcode, effdate, record_status, stamp
FROM jobhistory
WHERE empno = '00001'
ORDER BY effdate;
-- Expected: both rows ACTIVE, stamp starts with CASCADE-RECOVER
```

| Check | Expected | Result | Remarks |
|---|---|---|---|
| Employee 00001 record_status after recover | ACTIVE | ⬜ | |
| Employee 00001 stamp | starts with REACTIVATED | ⬜ | |
| All jobHistory rows for 00001 | ACTIVE | ⬜ | |
| jobHistory stamp | starts with CASCADE-RECOVER | ⬜ | |

---

## TEST R-02 — USER can see employee 00001 and their jobHistory after recovery

**Method:** UI + SQL

**Steps (UI):**
1. Log in as USER (`@gmail.com`)
2. Go to `/employees`
3. Confirm employee `00001` appears in the list again
4. Go to `/jobhistory`
5. Confirm jobHistory rows for `00001` appear again

**Steps (SQL):**
```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "----"}';

  -- Employee must be visible again
  SELECT empno, lastname, record_status FROM employee WHERE empno = '00001';
  -- Expected: 1 row, ACTIVE

  -- jobHistory rows must be visible again
  SELECT empno, jobcode, record_status FROM jobhistory WHERE empno = '00001';
  -- Expected: 2 rows, both ACTIVE
ROLLBACK;
```

| Check | Expected | Result | Remarks |
|---|---|---|---|
| Employee 00001 visible to USER in UI | Visible | ⬜ | |
| jobHistory rows for 00001 visible to USER in UI | Visible | ⬜ | |
| Employee 00001 via RLS impersonation | 1 row, ACTIVE | ⬜ | |
| jobHistory rows via RLS impersonation | 2 rows, ACTIVE | ⬜ | |

---

## TEST R-03 — Employee 00001 no longer in Deleted Items after recovery

**Method:** UI

**Steps:**
1. Log in as ADMIN
2. Go to `/deleted-items` → **Employees** tab
3. Confirm employee `00001` is **not** in the list
4. Go to **Job History** tab
5. Confirm jobHistory rows for `00001` are **not** in the list

| Check | Expected | Result | Remarks |
|---|---|---|---|
| Employee 00001 in Deleted Items Employees tab | Not present | ⬜ | |
| jobHistory rows for 00001 in Deleted Items Job History tab | Not present | ⬜ | |

---

## TEST R-04 — Cross-contamination check (other employees unaffected)

**Scenario:** Soft-deleting and recovering 00001 must not affect any other
employee's records.

**Steps:**
```sql
-- Check employee 00003 is still ACTIVE and their jobHistory is unaffected
SELECT empno, record_status FROM employee WHERE empno = '00003';
-- Expected: ACTIVE

SELECT empno, jobcode, record_status FROM jobhistory WHERE empno = '00003';
-- Expected: all rows ACTIVE, stamps unchanged from original seed
```

| Check | Expected | Result | Remarks |
|---|---|---|---|
| Employee 00003 record_status | ACTIVE | ⬜ | |
| Employee 00003 jobHistory rows | All ACTIVE | ⬜ | |

---

---

# CATEGORY 3: Visibility Bypass Tests (API-Level RLS)

**Scenario:** A USER attempts to bypass the UI filter and call service
functions or Supabase directly without the ACTIVE filter. RLS must block
INACTIVE rows at the database level regardless.

---

## TEST V-01 — RLS blocks INACTIVE employee rows from USER (API bypass)

**Method:** SQL impersonation

```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "----"}';

  -- Attempt to fetch ALL employee rows without any filter
  -- RLS should still block INACTIVE rows automatically
  SELECT empno, record_status FROM employee ORDER BY empno;
  -- Expected: only ACTIVE rows returned — no INACTIVE rows visible
ROLLBACK;
```

**Also test in browser console:**
```js
// Open browser DevTools console while logged in as USER
// Run a direct Supabase query without the ACTIVE filter
const { data } = await supabase.from('employee').select('*');
console.log(data.filter(r => r.record_status === 'INACTIVE'));
// Expected: empty array — RLS blocks INACTIVE rows
```

| Check | Expected | Result | Remarks |
|---|---|---|---|
| USER SQL query without filter — INACTIVE employees | 0 rows | ⬜ | |
| USER browser console query without filter — INACTIVE employees | 0 rows | ⬜ | |

---

## TEST V-02 — RLS blocks INACTIVE jobHistory rows from USER (API bypass)

**Method:** SQL impersonation

```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "----"}';

  -- Fetch ALL jobHistory rows without filter
  SELECT empno, jobcode, record_status FROM jobhistory ORDER BY empno;
  -- Expected: only ACTIVE rows returned
ROLLBACK;
```

| Check | Expected | Result | Remarks |
|---|---|---|---|
| USER SQL query without filter — INACTIVE jobHistory | 0 rows | ⬜ | |

---

## TEST V-03 — RLS blocks INACTIVE job rows from USER (API bypass)

**Method:** SQL impersonation

```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "----"}';

  -- Fetch ALL job rows without filter
  SELECT jobcode, record_status FROM job ORDER BY jobcode;
  -- Expected: only ACTIVE rows (14 from seed)
ROLLBACK;
```

| Check | Expected | Result | Remarks |
|---|---|---|---|
| USER SQL query without filter — INACTIVE jobs | 0 rows | ⬜ | |

---

## TEST V-04 — RLS blocks INACTIVE department rows from USER (API bypass)

**Method:** SQL impersonation

```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub": "----"}';

  -- Fetch ALL department rows without filter
  SELECT deptcode, record_status FROM department ORDER BY deptcode;
  -- Expected: only ACTIVE rows (8 from seed)
ROLLBACK;
```

| Check | Expected | Result | Remarks |
|---|---|---|---|
| USER SQL query without filter — INACTIVE departments | 0 rows | ⬜ | |

---

---

# CATEGORY 4: Stamp Visibility Tests

**Scenario:** The stamp column must be hidden from USER in all 4 HR table
views. ADMIN and SUPERADMIN must see it.

---

## TEST S-01 — USER cannot see stamp column in Employee list

**Method:** UI

**Steps:**
1. Log in as USER (`@gmail.com`)
2. Go to `/employees`
3. Inspect the table columns

| Check | Expected | Result | Remarks |
|---|---|---|---|
| Stamp column header visible | NOT visible | ⬜ | |
| Any stamp data visible in rows | NOT visible | ⬜ | |

---

## TEST S-02 — ADMIN can see stamp column in Employee list

**Method:** UI

**Steps:**
1. Log in as ADMIN (`reneespina0929@gmail.com`)
2. Go to `/employees`
3. Inspect the table columns

| Check | Expected | Result | Remarks |
|---|---|---|---|
| Stamp column header visible | Visible | ⬜ | |
| Stamp data populated in rows | Visible with audit strings | ⬜ | |

---

## TEST S-03 — USER cannot see stamp column in Job History, Jobs, Departments

**Method:** UI

**Steps:**
1. Log in as USER
2. Go to `/jobhistory` — confirm no stamp column
3. Go to `/jobs` — confirm no stamp column
4. Go to `/departments` — confirm no stamp column

| Check | Table | Expected | Result | Remarks |
|---|---|---|---|---|
| Stamp column | /jobhistory | NOT visible | ⬜ | |
| Stamp column | /jobs | NOT visible | ⬜ | |
| Stamp column | /departments | NOT visible | ⬜ | |

---

## TEST S-04 — ADMIN can see stamp column in Job History, Jobs, Departments

**Method:** UI

**Steps:**
1. Log in as ADMIN
2. Go to `/jobhistory` — confirm stamp column present
3. Go to `/jobs` — confirm stamp column present
4. Go to `/departments` — confirm stamp column present

| Check | Table | Expected | Result | Remarks |
|---|---|---|---|---|
| Stamp column | /jobhistory | Visible | ⬜ | |
| Stamp column | /jobs | Visible | ⬜ | |
| Stamp column | /departments | Visible | ⬜ | |

---

---

# CATEGORY 5: No Hard Delete Audit

**Scenario:** The project rule states no `DELETE` SQL keyword may appear
anywhere in application code or Supabase functions. All removals must use
`record_status = 'INACTIVE'` instead.

---

## TEST H-01 — Codebase contains zero `.delete(` calls on HR tables

**Method:** Codebase search

**Steps — run in terminal at project root:**

```bash
# Search for any .delete( calls in the src directory
grep -rn "\.delete(" src/

# Search for raw DELETE SQL in any file
grep -rn "DELETE FROM" src/

# Search in SQL migration files
grep -rn "DELETE FROM" db/
```

**Expected for each command:** zero results, or only results in:
- `test/` files (cleanup queries in test blocks are permitted)
- SQL files inside `/* */` comment blocks (commented-out test cleanup)

**Any `.delete(` call targeting `employee`, `jobhistory`, `job`, or
`department` outside of a comment block is a violation.**

**Verify service files individually:**

```bash
# Check each service file
grep -n "delete" src/lib/employeeService.js
grep -n "delete" src/lib/jobHistoryService.js
grep -n "delete" src/lib/jobService.js
grep -n "delete" src/lib/departmentService.js
```

**Expected:** zero results in all 4 service files.

| Check | Expected | Result | Remarks |
|---|---|---|---|
| `.delete(` calls in `src/lib/employeeService.js` | 0 results | ⬜ | |
| `.delete(` calls in `src/lib/jobHistoryService.js` | 0 results | ⬜ | |
| `.delete(` calls in `src/lib/jobService.js` | 0 results | ⬜ | |
| `.delete(` calls in `src/lib/departmentService.js` | 0 results | ⬜ | |
| `DELETE FROM` in any migration SQL file | 0 results outside comments | ⬜ | |
| `DELETE FROM` in any Supabase trigger/function | 0 results | ⬜ | |

---

---

# Final Summary

| Category | Cases | ✅ Pass | ❌ Fail | ⬜ Pending |
|---|---|---|---|---|
| C: Soft-delete cascade | 4 | | | 4 |
| R: Recovery cascade | 4 | | | 4 |
| V: Visibility bypass (RLS) | 4 | | | 4 |
| S: Stamp visibility | 4 | | | 4 |
| H: No hard delete audit | 1 | | | 1 |
| **TOTAL** | **17** | **0** | **0** | **17** |

---

## Sprint 2 Gate Requirement

> All 17 cases must show ✅ PASS.
> Any ❌ FAIL must include a description in Remarks and be assigned
> to the responsible member for resolution before Sprint 2 closes.

---

*Document prepared by M5 — QA / Documentation Specialist*
*New Era University — BS Information Technology | AY 2025–2026*