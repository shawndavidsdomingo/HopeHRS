# Sprint 2 — Rights Test Matrix
## `test/sprint2-rights-51-cases.md`
**51 Cases: 3 User Types × 17 Rights**
Prepared by: M5 – QA / Documentation Specialist
Sprint 2 | Weeks 3–4 | HopeHRS Project

---

## How to Use This Document

1. Log in as each user type in the live app
2. Perform the action described in the **How to Test** column
3. Mark the **Result** column as ✅ PASS or ❌ FAIL
4. Note any issues in the **Remarks** column
5. All 51 cases must show ✅ PASS before Sprint 2 gate is cleared

**Test Accounts:**

| User Type | Email | How to Activate |
|---|---|---|
| SUPERADMIN | you@neu.edu.ph | Pre-seeded, already active |
| ADMIN | youradmin@gmail.com | Activated via SQL in testing |
| USER | youruser@gmail.com | Activated via SQL in testing |

---

## Module 1: Emp_Mod — Employee Module
*4 rights × 3 user types = 12 test cases*

| # | Right Code | Action | User Type | Expected Behavior | How to Test | Result | Remarks |
|---|---|---|---|---|---|---|---|
| 1 | EMP_VIEW | View Employees | SUPERADMIN | Employee list loads with all rows (ACTIVE + INACTIVE) | Log in as SUPERADMIN → go to /employees → confirm all rows visible including INACTIVE | ⬜ | |
| 2 | EMP_VIEW | View Employees | ADMIN | Employee list loads with all rows (ACTIVE + INACTIVE) | Log in as ADMIN → go to /employees → confirm all rows visible including INACTIVE | ⬜ | |
| 3 | EMP_VIEW | View Employees | USER | Employee list loads with ACTIVE rows only — INACTIVE rows hidden | Log in as USER → go to /employees → confirm only ACTIVE rows visible | ⬜ | |
| 4 | EMP_ADD | Add Employee | SUPERADMIN | Add Employee button visible → modal opens → new employee saved | Log in as SUPERADMIN → click Add Employee → fill form → submit → confirm new row appears | ⬜ | |
| 5 | EMP_ADD | Add Employee | ADMIN | Add Employee button visible → modal opens → new employee saved | Log in as ADMIN → click Add Employee → fill form → submit → confirm new row appears | ⬜ | |
| 6 | EMP_ADD | Add Employee | USER | Add Employee button NOT visible | Log in as USER → go to /employees → confirm no Add Employee button exists on page | ⬜ | |
| 7 | EMP_EDIT | Edit Employee | SUPERADMIN | Edit button visible per row → modal opens → changes saved | Log in as SUPERADMIN → click Edit on any row → change lastname → save → confirm update | ⬜ | |
| 8 | EMP_EDIT | Edit Employee | ADMIN | Edit button visible per row → modal opens → changes saved | Log in as ADMIN → click Edit on any row → change lastname → save → confirm update | ⬜ | |
| 9 | EMP_EDIT | Edit Employee | USER | Edit button NOT visible on any row | Log in as USER → go to /employees → confirm no Edit button on any row | ⬜ | |
| 10 | EMP_DEL | Soft Delete Employee | SUPERADMIN | Delete button visible → confirm dialog → employee set INACTIVE → cascade to jobHistory | Log in as SUPERADMIN → click Delete on employee 00003 → confirm → verify 00003 INACTIVE in Supabase + all their jobHistory rows INACTIVE | ⬜ | |
| 11 | EMP_DEL | Soft Delete Employee | ADMIN | Delete button NOT visible on any row | Log in as ADMIN → go to /employees → confirm no Delete button on any row | ⬜ | |
| 12 | EMP_DEL | Soft Delete Employee | USER | Delete button NOT visible on any row | Log in as USER → go to /employees → confirm no Delete button on any row | ⬜ | |

---

## Module 2: JH_Mod — Job History Module
*4 rights × 3 user types = 12 test cases*

| # | Right Code | Action | User Type | Expected Behavior | How to Test | Result | Remarks |
|---|---|---|---|---|---|---|---|
| 13 | JH_VIEW | View Job History | SUPERADMIN | Job History page loads with all rows (ACTIVE + INACTIVE) | Log in as SUPERADMIN → go to /jobhistory → confirm all rows visible including INACTIVE | ⬜ | |
| 14 | JH_VIEW | View Job History | ADMIN | Job History page loads with all rows (ACTIVE + INACTIVE) | Log in as ADMIN → go to /jobhistory → confirm all rows visible including INACTIVE | ⬜ | |
| 15 | JH_VIEW | View Job History | USER | Job History page loads with ACTIVE rows only | Log in as USER → go to /jobhistory → confirm only ACTIVE rows visible | ⬜ | |
| 16 | JH_ADD | Add Job History | SUPERADMIN | Add Job History form visible on EmployeeDetailPage → new row saved | Log in as SUPERADMIN → go to /employees/00001 → confirm Add Job History form visible → fill and submit | ⬜ | |
| 17 | JH_ADD | Add Job History | ADMIN | Add Job History form visible on EmployeeDetailPage → new row saved | Log in as ADMIN → go to /employees/00001 → confirm Add Job History form visible → fill and submit | ⬜ | |
| 18 | JH_ADD | Add Job History | USER | Add Job History form NOT visible on EmployeeDetailPage | Log in as USER → go to /employees/00001 → confirm no Add Job History form on page | ⬜ | |
| 19 | JH_EDIT | Edit Job History | SUPERADMIN | Edit button visible per job history row → modal opens → changes saved | Log in as SUPERADMIN → go to /employees/00001 → click Edit on a job history row → change salary → save → confirm | ⬜ | |
| 20 | JH_EDIT | Edit Job History | ADMIN | Edit button visible per job history row → modal opens → changes saved | Log in as ADMIN → go to /employees/00001 → click Edit on a job history row → change salary → save → confirm | ⬜ | |
| 21 | JH_EDIT | Edit Job History | USER | Edit button NOT visible on any job history row | Log in as USER → go to /employees/00001 → confirm no Edit button on any job history row | ⬜ | |
| 22 | JH_DEL | Soft Delete Job History | SUPERADMIN | Delete button visible per job history row → confirm → row set INACTIVE | Log in as SUPERADMIN → go to /employees/00001 → click Delete on one job history row → confirm → verify that row INACTIVE in Supabase | ⬜ | |
| 23 | JH_DEL | Soft Delete Job History | ADMIN | Delete button NOT visible on any job history row | Log in as ADMIN → go to /employees/00001 → confirm no Delete button on any job history row | ⬜ | |
| 24 | JH_DEL | Soft Delete Job History | USER | Delete button NOT visible on any job history row | Log in as USER → go to /employees/00001 → confirm no Delete button on any job history row | ⬜ | |

---

## Module 3: Job_Mod — Job Module
*4 rights × 3 user types = 12 test cases*

| # | Right Code | Action | User Type | Expected Behavior | How to Test | Result | Remarks |
|---|---|---|---|---|---|---|---|
| 25 | JOB_VIEW | View Jobs | SUPERADMIN | Job Catalogue loads with all rows (ACTIVE + INACTIVE) | Log in as SUPERADMIN → go to /jobs → confirm all rows visible including INACTIVE | ⬜ | |
| 26 | JOB_VIEW | View Jobs | ADMIN | Job Catalogue loads with all rows (ACTIVE + INACTIVE) | Log in as ADMIN → go to /jobs → confirm all rows visible including INACTIVE | ⬜ | |
| 27 | JOB_VIEW | View Jobs | USER | Job Catalogue loads with ACTIVE rows only | Log in as USER → go to /jobs → confirm only ACTIVE rows visible (14 rows from seed) | ⬜ | |
| 28 | JOB_ADD | Add Job | SUPERADMIN | Add Job button visible → modal opens → new job saved | Log in as SUPERADMIN → click Add Job → fill jobcode + jobdesc → submit → confirm new row appears | ⬜ | |
| 29 | JOB_ADD | Add Job | ADMIN | Add Job button visible → modal opens → new job saved | Log in as ADMIN → click Add Job → fill jobcode + jobdesc → submit → confirm new row appears | ⬜ | |
| 30 | JOB_ADD | Add Job | USER | Add Job button NOT visible | Log in as USER → go to /jobs → confirm no Add Job button on page | ⬜ | |
| 31 | JOB_EDIT | Edit Job | SUPERADMIN | Edit button visible per row → modal opens → jobdesc updated | Log in as SUPERADMIN → click Edit on any job row → change jobdesc → save → confirm update | ⬜ | |
| 32 | JOB_EDIT | Edit Job | ADMIN | Edit button visible per row → modal opens → jobdesc updated | Log in as ADMIN → click Edit on any job row → change jobdesc → save → confirm update | ⬜ | |
| 33 | JOB_EDIT | Edit Job | USER | Edit button NOT visible on any row | Log in as USER → go to /jobs → confirm no Edit button on any row | ⬜ | |
| 34 | JOB_DEL | Soft Delete Job | SUPERADMIN | Delete button visible → confirm → job set INACTIVE | Log in as SUPERADMIN → click Delete on a job row → confirm → verify INACTIVE in Supabase | ⬜ | |
| 35 | JOB_DEL | Soft Delete Job | ADMIN | Delete button NOT visible on any row | Log in as ADMIN → go to /jobs → confirm no Delete button on any row | ⬜ | |
| 36 | JOB_DEL | Soft Delete Job | USER | Delete button NOT visible on any row | Log in as USER → go to /jobs → confirm no Delete button on any row | ⬜ | |

---

## Module 4: Dept_Mod — Department Module
*4 rights × 3 user types = 12 test cases*

| # | Right Code | Action | User Type | Expected Behavior | How to Test | Result | Remarks |
|---|---|---|---|---|---|---|---|
| 37 | DEPT_VIEW | View Departments | SUPERADMIN | Departments page loads with all rows (ACTIVE + INACTIVE) | Log in as SUPERADMIN → go to /departments → confirm all rows visible including INACTIVE | ⬜ | |
| 38 | DEPT_VIEW | View Departments | ADMIN | Departments page loads with all rows (ACTIVE + INACTIVE) | Log in as ADMIN → go to /departments → confirm all rows visible including INACTIVE | ⬜ | |
| 39 | DEPT_VIEW | View Departments | USER | Departments page loads with ACTIVE rows only | Log in as USER → go to /departments → confirm only ACTIVE rows visible (8 rows from seed) | ⬜ | |
| 40 | DEPT_ADD | Add Department | SUPERADMIN | Add Department button visible → modal opens → new dept saved | Log in as SUPERADMIN → click Add Department → fill deptcode + deptname → submit → confirm new row | ⬜ | |
| 41 | DEPT_ADD | Add Department | ADMIN | Add Department button visible → modal opens → new dept saved | Log in as ADMIN → click Add Department → fill deptcode + deptname → submit → confirm new row | ⬜ | |
| 42 | DEPT_ADD | Add Department | USER | Add Department button NOT visible | Log in as USER → go to /departments → confirm no Add Department button on page | ⬜ | |
| 43 | DEPT_EDIT | Edit Department | SUPERADMIN | Edit button visible per row → modal opens → deptname updated | Log in as SUPERADMIN → click Edit on any dept row → change deptname → save → confirm update | ⬜ | |
| 44 | DEPT_EDIT | Edit Department | ADMIN | Edit button visible per row → modal opens → deptname updated | Log in as ADMIN → click Edit on any dept row → change deptname → save → confirm update | ⬜ | |
| 45 | DEPT_EDIT | Edit Department | USER | Edit button NOT visible on any row | Log in as USER → go to /departments → confirm no Edit button on any row | ⬜ | |
| 46 | DEPT_DEL | Soft Delete Department | SUPERADMIN | Delete button visible → confirm → dept set INACTIVE | Log in as SUPERADMIN → click Delete on a dept row → confirm → verify INACTIVE in Supabase | ⬜ | |
| 47 | DEPT_DEL | Soft Delete Department | ADMIN | Delete button NOT visible on any row | Log in as ADMIN → go to /departments → confirm no Delete button on any row | ⬜ | |
| 48 | DEPT_DEL | Soft Delete Department | USER | Delete button NOT visible on any row | Log in as USER → go to /departments → confirm no Delete button on any row | ⬜ | |

---

## Module 5: Adm_Mod — Admin Module
*1 right × 3 user types = 3 test cases*

| # | Right Code | Action | User Type | Expected Behavior | How to Test | Result | Remarks |
|---|---|---|---|---|---|---|---|
| 49 | ADM_USER | Access Admin Module | SUPERADMIN | Admin link visible in sidebar → /admin page loads | Log in as SUPERADMIN → confirm Admin link in sidebar → click it → confirm page loads | ⬜ | |
| 50 | ADM_USER | Access Admin Module | ADMIN | Admin link visible in sidebar → /admin page loads | Log in as ADMIN → confirm Admin link in sidebar → click it → confirm page loads | ⬜ | |
| 51 | ADM_USER | Access Admin Module | USER | Admin link NOT visible in sidebar → /admin URL redirects to /employees | Log in as USER → confirm no Admin link in sidebar → type /admin in URL bar → confirm redirect to /employees | ⬜ | |

---

## Summary

| Module | Total Cases | ✅ Pass | ❌ Fail | ⬜ Pending |
|---|---|---|---|---|
| Emp_Mod | 12 | | | 12 |
| JH_Mod | 12 | | | 12 |
| Job_Mod | 12 | | | 12 |
| Dept_Mod | 12 | | | 12 |
| Adm_Mod | 3 | | | 3 |
| **TOTAL** | **51** | **0** | **0** | **51** |

---

## Sprint 2 Gate Requirement

> All 51 cases must show ✅ PASS before Sprint 2 is considered complete.
> Any ❌ FAIL must be documented in the Remarks column with the bug description
> and assigned to the responsible member for resolution.

---

*Document prepared by M5 — QA / Documentation Specialist*
*New Era University — BS Information Technology | AY 2025–2026*