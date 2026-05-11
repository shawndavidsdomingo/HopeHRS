# Sprint 2 Log — Hope, Inc. HR System
**Sprint Theme:** HR CRUD, Rights Enforcement & Soft Delete Visibility
**Duration:** Week 3 – Week 4
**Sprint Goal:** Full CRUD for all four HR tables gated by rights, soft-delete visibility enforced (USER sees ACTIVE only), stamp hidden from USER, Deleted Items panel for ADMIN/SUPERADMIN.

---

## Team

| Role | Member |
|------|--------|
| M1 – Project Lead | Domingo |
| M2 – Frontend Dev | Espina |
| M3 – DB Engineer | Timbang |
| M4 – Rights & Auth | Claveria |
| M5 – QA / Docs | Ramones |

---

## PR Timeline

| Date | Member | PR | Branch | Title |
|------|--------|----|--------|-------|
| May 10 | M1 | PR-01 | `feat/employee-api` | Employee service functions (CRUD + soft delete + recover) |
| May 10 | M1 | PR-02 | `feat/jobhistory-api` | Job History service functions (CRUD + soft delete + recover) |
| May 10 | M1 | PR-03 | `feat/job-dept-api` | Job and Department service functions (CRUD + soft delete + recover) |
| May 10 | M1 | PR-04 | `feat/route-guard-deleted` | UserRightsContext, useRights hook, /deleted-items route guard |
| May 10 | M2 | PR-01 | `feat/ui-employee-list` | EmployeeListPage with stamp gating + INACTIVE filter |
| May 10 | M2 | PR-02 | `feat/ui-employee-detail-jh` | EmployeeDetailPage + JobHistoryPanel + AddJobHistoryForm |
| May 10 | M2 | PR-03 | `feat/ui-job-dept` | JobListPage + DeptListPage + their modals |
| May 10 | M2 | PR-04 | `feat/ui-deleted-items` | DeletedItemsPage with 4 tabs and Recover buttons |
| May 10 | M2 | PR-05 | `fix/ui-sidebar-gating` | Hide Deleted Items + Admin links for USER in sidebar |
| May 11 | M3 | PR-01 | `db/rls-employee` | RLS policies for employee table |
| May 11 | M3 | PR-02 | `db/rls-jobhistory-job-dept` | RLS policies for jobhistory, job, department tables |
| May 11 | M3 | PR-03 | `db/trigger-cascade-softdelete` | Cascade trigger (employee → jobHistory status sync) |
| May 11 | M3 | PR-04 | `db/view-employee-current-job` | employee_current_job SQL view |
| May 11 | M4 | PR-01 | `feat/rights-context` | UserRightsContext + useRights hook (17 rights) |
| May 11 | M4 | PR-02 | `feat/rights-employee-jh` | Button gating for Employee and Job History modules |
| May 11 | M4 | PR-03 | `feat/rights-job-dept` | Button gating for Job and Department modules |
| May 11 | M4 | PR-04 | `feat/rights-stamp-sidebar` | Stamp column visibility + sidebar link gating |
| May 11 | M5 | PR-01 | `test/sprint2-rights-51-cases` | Full 51-case rights test matrix |
| May 11 | M5 | PR-02 | `test/sprint2-cascade-visibility` | Cascade, recovery, API bypass, stamp tests |
| May 11 | M5 | PR-03 | `docs/sprint2-log` | Sprint 2 log with findings and resolutions |

---

## Tasks Completed

### M1 – PR-01 · May 10 · `feat/employee-api`
- Created `src/lib/employeeService.js`
- Implemented `getEmployees(userType)` — filters `ACTIVE` only for USER, returns all rows for ADMIN/SUPERADMIN
- Implemented `addEmployee(employeeData, userEmail)` — inserts with `record_status = ACTIVE` and stamp
- Implemented `updateEmployee(empno, updates, userEmail)` — updates editable fields only, never touches `record_status`
- Implemented `softDeleteEmployee(empno, userEmail)` — sets `INACTIVE`; DB trigger cascades to jobHistory automatically
- Implemented `recoverEmployee(empno, userEmail)` — sets `ACTIVE`; DB trigger restores jobHistory automatically
- All 6 tests passed via `TestEmployee.jsx` against live Supabase data (32 seeded rows)

### M1 – PR-02 · May 10 · `feat/jobhistory-api`
- Created `src/lib/jobHistoryService.js`
- Implemented `getJobHistory(empno, userType)` — fetches job history for one employee, sorted newest first
- Implemented `getAllJobHistory(userType)` — fetches across all employees (used by DeletedItems tab)
- Implemented `addJobHistory()`, `updateJobHistory()` using composite PK `(empno, jobcode, effdate)`
- Implemented `softDeleteJobHistory(pk, userEmail)` and `recoverJobHistory(pk, userEmail)`
- All 7 tests passed via `TestJobHistory.jsx` against live Supabase data (54 seeded rows)

### M1 – PR-03 · May 10 · `feat/job-dept-api`
- Created `src/lib/jobService.js` — `getJobs`, `addJob`, `updateJob`, `softDeleteJob`, `recoverJob`
- Created `src/lib/departmentService.js` — `getDepts`, `addDept`, `updateDept`, `softDeleteDept`, `recoverDept`
- Corrected column names from Sprint 1 placeholder (`jobdesc` not `jobtitle`; `deptcode`/`deptname` not `deptno`/`location`)
- All 10 tests passed via `TestJobDept.jsx` (14 seeded job rows, 8 seeded department rows)

### M1 – PR-04 · May 10 · `feat/route-guard-deleted`
- Created `src/contexts/UserRightsContext.jsx` — queries `hr_user` by email on login, loads all 17 `user_module_rights` rows, stores as flat rights map
- Fixed Postgres column name casing: `userId → userid`, `rightCode → rightcode`
- Updated `src/routes/ProtectedRoute.jsx` — replaced hardcoded `isAuthenticated = false` with real session from `useRights()`; added `adminOnly` prop blocking USER from `/deleted-items` and `/admin`
- Updated `src/App.jsx` — wrapped in `UserRightsProvider`; added `adminOnly` guards on `/deleted-items` and `/admin`

### M2 – PR-01 · May 10 · `feat/ui-employee-list`
- Replaced `Employees.jsx` placeholder with full `EmployeeListPage`
- Add button gated by `rights.EMP_ADD === 1`; Edit by `EMP_EDIT`; Delete by `EMP_DEL`
- Stamp column visible to ADMIN/SUPERADMIN only; hidden for USER
- INACTIVE rows hidden for USER (enforced by service + RLS)
- Created `AddEmployeeModal.jsx`, `EditEmployeeModal.jsx`, `SoftDeleteConfirmDialog.jsx`

### M2 – PR-02 · May 10 · `feat/ui-employee-detail-jh`
- Created `EmployeeDetailPage.jsx` — full employee profile with embedded JobHistoryPanel
- Implemented lookup maps to resolve `jobCode → jobDesc` and `deptCode → deptName`
- Job history sorted by `effDate` descending (newest first)
- Add, Edit, Delete actions gated by `JH_ADD`, `JH_EDIT`, `JH_DEL`
- Added dynamic route `/employees/:empno` to `App.jsx`
- Added View link per employee row in `Employees.jsx`

### M2 – PR-03 · May 10 · `feat/ui-job-dept`
- Replaced inline `JobList`, `DepartmentList`, `JobHistoryList` from `App.jsx` with dedicated page files
- `Jobs.jsx` — `jobcode`, `jobdesc`, `record_status` columns; Add gated by `JOB_ADD`; Edit by `JOB_EDIT`; Delete by `JOB_DEL`
- `Departments.jsx` — `deptcode`, `deptname`, `record_status` columns; same gating pattern
- Created `AddJobModal.jsx`, `EditJobModal.jsx`, `AddDeptModal.jsx`, `EditDeptModal.jsx`
- PK fields (`jobcode`, `deptcode`) read-only in edit modals

### M2 – PR-04 · May 10 · `feat/ui-deleted-items`
- Created `DeletedItems.jsx` — 4 tabs (Employees, Job History, Jobs, Departments)
- Recover button per row; composite PK `(empno, jobcode, effdate)` passed correctly for Job History recovery
- Created `DeleteConfirmModal.jsx` replacing native `window.confirm` across Jobs, Departments, JobHistory
- Sidebar Deleted Items link restricted to ADMIN and SUPERADMIN

### M2 – PR-05 · May 10 · `fix/ui-sidebar-gating`
- Updated `AppShell.jsx` — Deleted Items and Admin links restricted to SUPERADMIN only
- Updated `Departments.jsx`, `Jobs.jsx`, `JobHistory.jsx` — Delete buttons restricted to SUPERADMIN only (`canDelete = isSuperAdmin`)
- Added Shield icon to Admin sidebar link

### M3 – PR-01 · May 11 · `db/rls-employee`
- Enabled RLS on `employee` table
- Created 5 policies: `emp_select`, `emp_insert`, `emp_update_edit`, `emp_update_del`, `emp_update_recover`
- `emp_update_del` locked to deactivation direction only via `WITH CHECK (record_status = 'INACTIVE')`
- `emp_update_recover` locked to recovery direction only via `WITH CHECK (record_status = 'ACTIVE')`
- Dropped `hr_user` RLS — intentional; `checkLoginGuard` reads `hr_user` before session is established
- Synced `hr_user.userid` to match real Supabase Auth UUIDs for all registered users
- All 11 verification tests passed in Supabase SQL Editor via role impersonation

### M3 – PR-02 · May 11 · `db/rls-jobhistory-job-dept`
- Enabled RLS on `jobhistory`, `job`, `department` tables
- Dropped Supabase-generated permissive `_dev` policies (`qual = true`) that were overriding all custom policies
- Created 5 policies per table (15 total) — same pattern as PR-01
- All 20 verification tests passed in Supabase SQL Editor

### M3 – PR-03 · May 11 · `db/trigger-cascade-softdelete`
- Created `cascade_employee_soft_delete()` trigger function
- Attached as `on_employee_status_change` — fires `AFTER UPDATE OF record_status ON employee FOR EACH ROW`
- Direction 1: `ACTIVE → INACTIVE` sets all jobhistory rows for that `empno` to `INACTIVE` with `CASCADE-DEL` stamp
- Direction 2: `INACTIVE → ACTIVE` restores all jobhistory rows to `ACTIVE` with `CASCADE-RECOVER` stamp
- Trigger fires only on `record_status` changes — non-status updates do not fire it
- All 6 verification tests passed

### M3 – PR-04 · May 11 · `db/view-employee-current-job`
- Created `employee_current_job` view
- Returns one row per ACTIVE employee with their latest ACTIVE jobhistory row
- Joins `job` for `jobdesc` and `department` for `deptname`
- Latest job determined by `MAX(effdate)` among ACTIVE jobhistory rows via correlated subquery
- All 6 verification tests passed including duplicate-check and inactive employee exclusion

### M4 – PR-01 · May 11 · `feat/rights-context`
- Refactored `UserRightsContext.jsx` — added `ALL_RIGHT_CODES`, `EMPTY_RIGHTS`, `hasRight()`, `canDo`, `isAdminOrAbove`
- `hasRight(code)` returns `true` if `rights[code] === 1`; memoized with `useCallback`
- `canDo` is a readable alias of `hasRight`
- `isAdminOrAbove` is `true` for ADMIN and SUPERADMIN — used for stamp column and sidebar gating
- All 4 tests passed via `/test-rights` against live Supabase data

### M4 – PR-02 · May 11 · `feat/rights-employee-jh`
- Migrated `Employees.jsx` from `rights['EMP_ADD'] === 1` pattern to `hasRight('EMP_ADD')`
- Migrated `EmployeeDetailPage.jsx` from raw rights map to `hasRight()` for all JH gating
- Removed local `isAdmin` variable — replaced with `isAdminOrAbove` from context
- 9 of 12 tests passed; Tests 4, 5, 11 pending USER account verification

### M4 – PR-03 · May 11 · `feat/rights-job-dept`
- Migrated `Jobs.jsx` from `canAdd/canEdit/canDelete` local variables to `hasRight()`
- Migrated `Departments.jsx` same pattern
- Removed `isAdmin`, `isSuperAdmin` local variables from both files
- 5 of 9 tests passed; Tests 3, 4, 6, 7 pending ADMIN and USER verification

### M4 – PR-04 · May 11 · `feat/rights-stamp-sidebar`
- Updated `Employees.jsx` stamp column gate from local `isAdmin` to `isAdminOrAbove`
- Updated `AppShell.jsx` sidebar gate from `user_type === 'SUPERADMIN'` to `isAdminOrAbove` — Deleted Items and Admin now visible to ADMIN as well
- Updated `ProtectedRoute.jsx` — no changes needed, already correct
- 3 of 8 tests passed; Tests 4–8 pending ADMIN and USER verification

### M5 – PR-01 · May 11 · `test/sprint2-rights-51-cases`
- Created `test/sprint2-rights-51-cases.md`
- 51 cases across 5 modules, grouped by module
- Each case includes right code, action, user type, expected behavior, step-by-step test instructions
- Result column pre-filled as ⬜ pending — to be filled during final QA pass

### M5 – PR-02 · May 11 · `test/sprint2-cascade-visibility`
- Created `test/sprint2-cascade-visibility.md`
- 17 cases across 5 categories: cascade, recovery, API bypass, stamp visibility, no hard delete audit
- Each category includes SQL impersonation queries and UI steps
- Result column pre-filled as ⬜ pending — to be filled during final QA pass

---

## Blockers & Resolutions

| # | Blocker | Resolution |
|---|---------|------------|
| 1 | Sprint 1 `App.jsx` had wrong column names (`jobtitle`, `highsal`, `lowsal`, `deptno`, `location`) from placeholder UI | M1 corrected to `jobdesc`, `deptcode`, `deptname` in all service files to match `001_initial_schema.sql` |
| 2 | `ProtectedRoute.jsx` had hardcoded `isAuthenticated = false` from Sprint 1 | M1 replaced with real session from `useRights()` in PR-04 |
| 3 | `UserRightsContext` was querying `userId` and `rightCode` but Postgres lowercased them to `userid` and `rightcode` | M1 fixed column names in all queries and destructuring |
| 4 | Supabase dashboard auto-created permissive `_dev` policies (`qual = true`) when RLS was first enabled on tables | M3 explicitly dropped all `_dev` policies before creating custom policies in `005_rls_jobhistory_job_dept.sql` |
| 5 | RLS policies not firing — `auth.uid()` not matching `hr_user.userid` | `hr_user.userid` was seeded as `user1`–`user6` strings, not real Auth UUIDs — M3 synced all userids to real Supabase Auth UUIDs using a FK-safe mapping transaction |
| 6 | FK constraint error during userid sync — `user_module` and `user_module_rights` reference `hr_user.userid` | M3 dropped FK constraints, updated all 3 tables using a temp mapping table, then re-added FK constraints |
| 7 | Enabling RLS on `hr_user` broke login — `checkLoginGuard` reads `hr_user` before session is established | RLS disabled on `hr_user` intentionally — login guard security is enforced at application layer |
| 8 | USER accounts with `record_status = INACTIVE` returned 0 rows from RLS SELECT policies — policies require `hr_user.record_status = ACTIVE` | Activated USER test accounts via SQL `UPDATE hr_user SET record_status = 'ACTIVE'` |
| 9 | React Strict Mode fired add functions twice in development causing duplicate key errors on test rows | Expected behavior in dev mode — not a bug in service code; test rows cleaned up after each test run |
| 10 | `emp_update_deactivate` leftover policy from a previous run conflicted with `emp_update_del` | Dropped the duplicate policy; added `DROP POLICY IF EXISTS` for all legacy names in migration files |
| 11 | Testing in Supabase SQL Editor using `postgres` role bypassed RLS entirely — tests appeared to pass when they should have failed | Added `FORCE ROW LEVEL SECURITY` during testing then reverted; final fix was using `BEGIN / SET LOCAL ROLE authenticated / ROLLBACK` blocks for all tests |
| 12 | provision_new_user() trigger crashing with "Database error saving new 
user" — caused by on_auth_user_created_sync_uid trigger conflicting with 
provision_new_user() on auth.users INSERT | Dropped on_auth_user_created_sync_uid 
trigger; fixed provision_new_user() column names (moduleCode → modulecode, 
rightCode → rightcode); added EXCEPTION handler and SET search_path = public |


---

## Sprint 2 Gate — Status

| Gate Requirement | Status |
|------------------|--------|
| Employee service functions: getEmployees, addEmployee, updateEmployee, softDeleteEmployee, recoverEmployee | ✅ Done |
| Job History service functions with composite PK support | ✅ Done |
| Job and Department service functions | ✅ Done |
| UserRightsContext loading all 17 rights on login | ✅ Done |
| ProtectedRoute blocking USER from /deleted-items and /admin | ✅ Done |
| EmployeeListPage with rights gating and stamp visibility | ✅ Done |
| EmployeeDetailPage with embedded JobHistoryPanel | ✅ Done |
| JobListPage and DeptListPage with modals | ✅ Done |
| DeletedItemsPage with 4 tabs and Recover buttons | ✅ Done |
| RLS policies on all 4 HR tables (employee, jobhistory, job, department) | ✅ Done |
| Cascade soft-delete trigger (employee → jobhistory) | ✅ Done |
| employee_current_job SQL view | ✅ Done |
| hasRight() / canDo / isAdminOrAbove API in UserRightsContext | ✅ Done |
| Button gating migrated to hasRight() across all modules | ✅ Done |
| 51-case rights test matrix committed | ✅ Done |
| Cascade + visibility + stamp + no-hard-delete test document committed | ✅ Done |
| All 51 rights cases verified ✅ | ⬜ Pending final QA pass |
| All 17 cascade/visibility cases verified ✅ | ⬜ Pending final QA pass |

---

## Next Sprint Goals (Sprint 3 – Weeks 5 & 6)

- Admin Module: `getUsers()`, `activateUser()`, `deactivateUser()` — all blocking operations on SUPERADMIN rows
- HR Reports: `headcount_by_dept` view, `salary_summary_by_job` view, `getEmployeeFullHistory(empNo)`
- UserManagementPage: user table with Activate/Deactivate buttons; SUPERADMIN rows fully disabled with tooltip
- HeadcountByDeptPage, SalaryReportPage, EmployeeHistoryReportPage
- Admin Module RLS: ADMIN can UPDATE `user.record_status` only WHERE `user_type != 'SUPERADMIN'`
- `ADM_USER` right gating for Admin sidebar link
- SUPERADMIN row protection at UI level (buttons disabled) and DB level (RLS)
- Production deployment to Vercel or Netlify with production Supabase env vars
- Release PR: `dev → main`, reviewed by all 5 members
- User Manual, Sprint Log, and Presentation Slides finalized