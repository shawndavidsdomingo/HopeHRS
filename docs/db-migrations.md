# Database Migration Index
## `docs/db-migrations.md`
**Hope, Inc. HR System — Supabase Migration History**
Prepared by: M3 – Backend / Database Engineer
New Era University — BS Information Technology | AY 2025–2026

---

## Overview

All SQL migration files are stored in `db/migrations/` and must be
run in sequential order. Each file is safe to re-run (uses `DROP IF EXISTS`,
`CREATE OR REPLACE`, `ON CONFLICT DO NOTHING` patterns throughout).

> **Note on file naming:** Files were renumbered during Sprint 3 cleanup.
> The original filenames had two conflicts at `004_` and corrupted names
> at `006_` and `007_`. All files have been renumbered sequentially and
> their internal headers updated to match.

---

## Migration Files

### Sprint 1 — Weeks 1–2: Project Setup & Authentication

---

#### `001_initial_schema.sql`
**Branch:** `db/initial-schema` — M3 PR-01
**Purpose:** Creates the four core HR tables from HopeDB with
`record_status` and `stamp` columns added for soft-delete and audit trail.

**Tables created:**
- `employee` — empno (PK), lastname, firstname, gender, birthdate,
  hiredate, sepdate, record_status, stamp
- `jobhistory` — composite PK (empno, jobcode, effdate), salary,
  deptcode, record_status, stamp
- `job` — jobcode (PK), jobdesc, record_status, stamp
- `department` — deptcode (PK), deptname, record_status, stamp

**Seed data:** 32 employees, 54 job history rows, 14 jobs, 8 departments

---

#### `002_rights_seed.sql`
**Branch:** `db/rights-seed` — M3 PR-02
**Purpose:** Creates the rights management tables and seeds all
modules, rights, and SUPERADMIN accounts.

**Tables created:**
- `module` — 5 modules: Emp_Mod, JH_Mod, Job_Mod, Dept_Mod, Adm_Mod
- `rights` — 17 rights across 5 modules (EMP_VIEW through ADM_USER)
- `hr_user` — userId, email, user_type, record_status, stamp
- `user_module` — maps user to module with rights_value
- `user_module_rights` — maps user to each right with right_value

**Seeded accounts:** 6 SUPERADMIN accounts (user1–user6 placeholder IDs)
with all 17 rights = 1

> **Note:** FK constraints on `user_module` and `user_module_rights`
> referencing `hr_user.userid` were permanently dropped in
> `010_fix_provision_new_user.sql` to allow the uid sync trigger to
> run without deadlocking. Referential integrity is enforced by the
> application layer.

---

#### `003_verify_seed.sql`
**Branch:** `db/verify-seed` — M3 PR-04
**Purpose:** Verification queries only — no schema changes.
Confirms row counts, record_status values, FK integrity, and
SUPERADMIN rights are all correct after the initial seed.

**Run this file to verify:** 32 employees, 54 jobhistory, 14 jobs,
8 departments, 5 modules, 17 rights, 6 hr_user rows all ACTIVE,
102 user_module_rights all right_value = 1 for SUPERADMINs.

---

#### `004_provision_new_user.sql`
**Branch:** `db/trigger-provision-user` — M1 PR-04 (Sprint 1)
**Purpose:** Original `provision_new_user()` trigger — auto-inserts
new Google OAuth registrants into `hr_user` as USER/INACTIVE with
VIEW-only rights.

> **Superseded by:** `010_fix_provision_new_user.sql` which rewrites
> this trigger with correct lowercase column names, uid sync logic,
> FK-drop pattern, and EXCEPTION handler. Always run `010` after `004`.

---

### Sprint 2 — Weeks 3–4: HR CRUD & Rights Enforcement

---

#### `005_rls_employee.sql`
**Branch:** `db/rls-employee` — M3 PR-01 (Sprint 2)
**Purpose:** Enables RLS on the `employee` table and creates 5 policies.

**Policies:**
- `emp_select` — USER: ACTIVE only; ADMIN/SUPERADMIN: all rows
- `emp_insert` — gated by EMP_ADD = 1
- `emp_update_edit` — gated by EMP_EDIT = 1
- `emp_update_del` — gated by EMP_DEL = 1; WITH CHECK locks to INACTIVE
- `emp_update_recover` — gated by user_type IN (ADMIN, SUPERADMIN);
  WITH CHECK locks to ACTIVE

> **Note:** `hr_user` RLS must remain DISABLED when running this file.
> `checkLoginGuard` in `App.jsx` reads `hr_user` before a full session
> is established — enabling RLS on `hr_user` at this stage breaks login.

---

#### `006_rls_jobhistory_job_dept.sql`
**Branch:** `db/rls-jobhistory-job-dept` — M3 PR-02 (Sprint 2)
**Purpose:** Applies the same 5-policy RLS pattern to `jobhistory`,
`job`, and `department` (15 policies total).

**Key finding during testing:** Supabase dashboard auto-creates
permissive `_dev` policies (`qual = true`) when RLS is first enabled.
This file explicitly drops all `_dev` policies before creating the
correct ones.

---

#### `007_trigger_cascade_softdelete.sql`
**Branch:** `db/trigger-cascade-softdelete` — M3 PR-03 (Sprint 2)
**Purpose:** Creates `cascade_employee_soft_delete()` trigger function
and attaches it as `on_employee_status_change` on the `employee` table.

**Behavior:**
- ACTIVE → INACTIVE: all jobhistory rows for that empno set to INACTIVE
  with stamp `CASCADE-DEL {empno} {timestamp}`
- INACTIVE → ACTIVE: all jobhistory rows for that empno restored to
  ACTIVE with stamp `CASCADE-RECOVER {empno} {timestamp}`
- Fires ONLY on `record_status` column changes — not on other updates

---

#### `008_view_employee_current_job.sql`
**Branch:** `db/view-employee-current-job` — M3 PR-04 (Sprint 2)
**Purpose:** Creates the `employee_current_job` view used by
`EmployeeListPage` and `EmployeeDetailPage`.

**Logic:** Returns one row per ACTIVE employee showing their latest
ACTIVE jobhistory row joined with `job.jobdesc` and `department.deptname`.
Latest job determined by `MAX(effdate)` via correlated subquery.

**Dependency:** Must be run before `011_views_reports.sql` which
depends on this view for the headcount calculation.

---

### Hotfixes — Between Sprint 2 and Sprint 3

---

#### `009_trigger_sync_seeded_uid.sql`
**Branch:** `fix/sync-seeded-uid-on-login` (initial attempt)
**Purpose:** First attempt at syncing placeholder userids (user1–user6)
to real Supabase Auth UUIDs on first Google OAuth login.

> **Superseded by:** `010_fix_provision_new_user.sql` which merged the
> sync logic directly into `provision_new_user()` and dropped FK
> constraints to allow the sync to run without errors. This file added
> a separate `on_auth_user_created_sync_uid` trigger which conflicted
> with `provision_new_user()` — that trigger was dropped in `010`.

---

#### `010_fix_provision_new_user.sql`
**Branch:** `fix/sync-seeded-uid-on-login` (final fix)
**Purpose:** Complete rewrite of `provision_new_user()` fixing all
issues discovered during Sprint 2–3 transition.

**Changes from `004_provision_new_user.sql`:**
- Fixed column name casing: `moduleCode → modulecode`, `rightCode → rightcode`
- Added `SET search_path = public` so tables resolve from auth schema context
- Added `EXCEPTION WHEN OTHERS` handler — trigger errors no longer block login
- Added uid sync logic: when existing email found with placeholder userid,
  syncs all 3 tables (hr_user, user_module, user_module_rights) to real UUID
- Dropped `on_auth_user_created_sync_uid` trigger (conflicted with this trigger)
- Dropped FK constraints on `user_module` and `user_module_rights` permanently
- Re-seeded all placeholder accounts (user1–user6) with correct emails

---

### Sprint 3 — Weeks 5–6: Admin Module, Reports & Deployment

---

#### `011_views_reports.sql`
**Branch:** `db/views-reports` — M3 PR-01 (Sprint 3)
**Purpose:** Creates two SQL views for the HR Reports module.

**Views:**
- `headcount_by_dept` — COUNT of active employees per department using
  `employee_current_job` view. LEFT JOIN ensures departments with 0
  employees still appear. Columns: deptcode, deptname, activeheadcount
- `salary_summary_by_job` — MIN/MAX/AVG salary per active jobCode from
  all ACTIVE jobhistory rows. NULLS LAST handles jobs with no assignments.
  Columns: jobcode, jobdesc, assignments, minsalary, maxsalary, avgsalary

**Dependency:** Requires `008_view_employee_current_job.sql` to be run first.

---

#### `012_rls_admin_user_mgmt.sql`
**Branch:** `db/rls-admin-user-mgmt` — M3 PR-02 (Sprint 3) — initial version
**Purpose:** Added `display_id` column to `hr_user` and first version of
RLS policies on `hr_user` and `user_module_rights`.

> **Superseded by:** `012b_rls_admin_user_mgmt_fix.sql` which fixed
> infinite recursion in the policies. Always run `012b` immediately
> after `012`.

**display_id:** Human-readable sequential ID (user1, user2, ...) shown
in Admin UI instead of raw Auth UUID. Auto-assigned by
`assign_display_id()` trigger on `hr_user` INSERT.

---

#### `012b_rls_admin_user_mgmt_fix.sql`
**Branch:** `db/rls-admin-user-mgmt` — M3 PR-02 (Sprint 3) — recursion fix
**Purpose:** Fixed infinite recursion in `hr_user` RLS policies by
introducing SECURITY DEFINER helper functions.

**Root cause:** The initial policies in `012` queried `hr_user` directly
inside the `USING` clause to check `user_type` — which triggered the
same SELECT policy again infinitely.

**Fix:** 4 SECURITY DEFINER functions that bypass RLS when reading
`hr_user`:
- `get_my_user_type()` — returns caller's user_type
- `is_admin_or_above()` — true for ADMIN or SUPERADMIN
- `is_superadmin()` — true for SUPERADMIN only
- `get_user_type_for(userid)` — returns target user's user_type

**Final policies:**
- `hr_user`: hr_user_select, hr_user_update_status
- `user_module_rights`: umr_select, umr_insert, umr_update, umr_delete

---

#### `013_fix_display_ids_and_rls_select.sql`
**Branch:** `fix/admin-display-id-rls-login` — Sprint 3 hotfix
**Purpose:** Two critical fixes applied after `012b`.

**Fix 1 — hr_user SELECT policy:** `012b` only allowed ADMIN/SUPERADMIN
to SELECT from `hr_user` — but `checkLoginGuard` and `UserRightsContext`
need to read `hr_user` for any authenticated user during login. Updated
policy adds a self-read clause: `userid = auth.uid()::text OR is_admin_or_above()`.

**Fix 2 — display_id ordering:** Reassigned display_ids to the exact
team-defined order:
- user1–user6: SUPERADMIN NEU accounts
- user7–user11: ADMIN Gmail accounts
- user12–user16: USER Gmail accounts

---

## Migration Run Order

```
001_initial_schema.sql
002_rights_seed.sql
003_verify_seed.sql          ← verification only, no schema changes
004_provision_new_user.sql
005_rls_employee.sql
006_rls_jobhistory_job_dept.sql
007_trigger_cascade_softdelete.sql
008_view_employee_current_job.sql
009_trigger_sync_seeded_uid.sql   ← superseded, kept for history
010_fix_provision_new_user.sql    ← replaces 004 + 009
011_views_reports.sql
012_rls_admin_user_mgmt.sql
012b_rls_admin_user_mgmt_fix.sql  ← always run immediately after 012
013_fix_display_ids_and_rls_select.sql
```

---

## File Rename History

The following files were renamed during Sprint 3 cleanup to fix
numbering conflicts and corrupted filenames:

| Old Filename | New Filename | Reason |
|---|---|---|
| `004_rls_employee.sql` | `005_rls_employee.sql` | Duplicate `004_` prefix |
| `005_rls_jobhistory_job_dept.sql` | `006_rls_jobhistory_job_dept.sql` | Cascade renumber |
| `006__trigger_cascade_softdelet.sql` | `007_trigger_cascade_softdelete.sql` | Double underscore + truncated name |
| `007_view_employee_current_joemployee_current_job.sql` | `008_view_employee_current_job.sql` | Corrupted filename |
| `008_trigger_sync_seeded_uid.sql` | `009_trigger_sync_seeded_uid.sql` | Cascade renumber |
| `009_fix_provision_new_user.sql` | `010_fix_provision_new_user.sql` | Cascade renumber |
| `010_views_headcount_salary_reports.sql` | `011_views_reports.sql` | Cascade renumber + simplified name |
| `011_rls_admin_user_mgmt.sql` | `012_rls_admin_user_mgmt.sql` | Cascade renumber |
| `011b_rls_admin_user_mgmt_fix.sql` | `012b_rls_admin_user_mgmt_fix.sql` | Cascade renumber |
| `012_fix_display_ids_and_rls_select.sql` | `013_fix_display_ids_and_rls_select.sql` | Cascade renumber |

---

*Document prepared by M3 — Backend / Database Engineer*
*New Era University — BS Information Technology | AY 2025–2026*