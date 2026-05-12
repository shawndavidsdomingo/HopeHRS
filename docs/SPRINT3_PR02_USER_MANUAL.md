# Hope, Inc. HR System — User Manual
## `docs/user-manual-final`
**HopeHRS — Human Resources Management System**
Prepared by: M5 – QA / Docs | Ramones
New Era University — BS Information Technology | AY 2025–2026
**Version:** 1.0 — Sprint 3 Final

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Getting Started — Registration](#2-getting-started--registration)
3. [Logging In](#3-logging-in)
4. [Application Layout](#4-application-layout)
5. [User Types & Permissions](#5-user-types--permissions)
6. [Employee Module](#6-employee-module)
7. [Job History Module](#7-job-history-module)
8. [Job Module](#8-job-module)
9. [Department Module](#9-department-module)
10. [Deleted Items Panel](#10-deleted-items-panel)
11. [HR Reports Module](#11-hr-reports-module)
12. [Admin Module — User Management](#12-admin-module--user-management)
13. [Logging Out](#13-logging-out)
14. [Frequently Asked Questions](#14-frequently-asked-questions)

---

---

## 1. System Overview

**HopeHRS** is the internal Human Resources Management System for Hope, Inc. It allows authorized staff to manage employee records, job assignments, organizational structure, and user access — all from a web browser.

The system is built on three layers of access control:

- **Row-Level Security (RLS)** enforced at the database level — no API call can bypass it
- **Rights-based button gating** in the UI — actions are hidden if the user does not have the required right
- **Sidebar gating** — navigation links are shown only to user types that are permitted to access them

All data removals in HopeHRS are **soft deletes** — no record is ever permanently erased. INACTIVE records can always be recovered by an ADMIN or SUPERADMIN.

---

---

## 2. Getting Started — Registration

New users register through Google OAuth. No password is required.

### Steps

1. Navigate to the HopeHRS production URL in your web browser.
2. You will be directed to the **Login page**.
3. Click **"Register with Google"**.
4. Google's account picker will appear — select the Google account you want to register with.

   > **Screenshot placeholder:** `um-02-register-google-picker.png`
   > *Caption: Google account picker shown during registration*

5. After selecting your account, you will be redirected back to the application.
6. You will see a **"Pending Activation"** message.

   > **Screenshot placeholder:** `um-02-pending-activation.png`
   > *Caption: Pending activation screen shown after first registration*

### What happens next

Your account is automatically created in the system as a **USER** with **INACTIVE** status. You will not be able to access the application until an **ADMIN** or **SUPERADMIN** activates your account.

Contact your system administrator to request activation.

> **Note:** SUPERADMIN accounts (the permanent institutional accounts) are pre-seeded and do not need to go through this registration flow. They log in directly.

---

---

## 3. Logging In

### Steps

1. Navigate to the HopeHRS production URL.
2. Click **"Sign in with Google"**.

   > **Screenshot placeholder:** `um-03-login-page.png`
   > *Caption: Login page with Sign in with Google button*

3. Google's account picker will appear — select your registered account.

   > The system always shows the account picker even if you previously signed in. This prevents accidental login with the wrong account.

4. If your account is **ACTIVE**, you will be redirected to the **Employees page**.

   > **Screenshot placeholder:** `um-03-login-success.png`
   > *Caption: Employees page after successful login*

### Login Failures

| Situation | What you see |
|---|---|
| Account not yet activated | "Pending activation" message on the Login page |
| Unrecognized email (not registered) | "Unable to verify account" message on the Login page |
| Network / OAuth error | Google error page — try again or contact your administrator |

---

---

## 4. Application Layout

After logging in, you will see the main application shell with two areas:

### Sidebar (Left)

The sidebar contains navigation links to all modules you have access to.

> **Screenshot placeholder:** `um-04-app-shell-superadmin.png`
> *Caption: Full sidebar visible to SUPERADMIN*

| Link | Visible to |
|---|---|
| Employees | All user types |
| Job History | All user types |
| Jobs | All user types |
| Departments | All user types |
| Deleted Items | ADMIN and SUPERADMIN only |
| Admin | ADMIN and SUPERADMIN only |
| Reports | ADMIN and SUPERADMIN only |

### Topbar (Top)

The topbar shows the current page name as a breadcrumb and your user initial. The **Logout** button is accessible from the topbar.

---

---

## 5. User Types & Permissions

HopeHRS has three user types. Your user type determines which actions you can perform.

| Action | USER | ADMIN | SUPERADMIN |
|---|---|---|---|
| View ACTIVE employees | ✅ | ✅ | ✅ |
| View INACTIVE employees | ❌ | ✅ | ✅ |
| Add employee | ❌ | ✅ | ✅ |
| Edit employee | ❌ | ✅ | ✅ |
| Soft-delete employee | ❌ | ❌ | ✅ |
| Recover employee | ❌ | ✅ | ✅ |
| View stamp column | ❌ | ✅ | ✅ |
| Add / Edit job history | ❌ | ✅ | ✅ |
| Soft-delete job history | ❌ | ❌ | ✅ |
| Add / Edit job | ❌ | ✅ | ✅ |
| Soft-delete job | ❌ | ❌ | ✅ |
| Add / Edit department | ❌ | ✅ | ✅ |
| Soft-delete department | ❌ | ❌ | ✅ |
| Access Deleted Items panel | ❌ | ✅ | ✅ |
| Access Reports | ❌ | ✅ | ✅ |
| Access Admin module | ❌ | ✅ | ✅ |
| Activate / deactivate users | ❌ | ✅ (non-SUPERADMIN only) | ✅ (non-SUPERADMIN only) |
| Modify SUPERADMIN accounts | ❌ | ❌ | ❌ |

> SUPERADMIN accounts are permanently protected. No user type — including other SUPERADMINs — can modify their account status through the Admin module.

---

---

## 6. Employee Module

Navigate to **Employees** in the sidebar.

> **Screenshot placeholder:** `um-06-employee-list.png`
> *Caption: Employee list page — SUPERADMIN view showing all rows and stamp column*

### 6.1 Viewing Employees

The employee list shows all employees your account is permitted to see:

- **USER** — sees ACTIVE employees only
- **ADMIN / SUPERADMIN** — sees all employees including INACTIVE rows

Each row shows: Employee No., Last Name, First Name, Gender, Hire Date, Separation Date, Current Job, Department, Record Status, and (for ADMIN/SUPERADMIN) the Stamp column.

### 6.2 Viewing Employee Details

Click the **View** button on any employee row to open the Employee Detail page.

> **Screenshot placeholder:** `um-06-employee-detail.png`
> *Caption: Employee Detail page showing profile and Job History panel*

The detail page shows the full employee profile and an embedded **Job History panel** listing all job assignments for that employee, sorted from newest to oldest.

### 6.3 Adding an Employee

> Available to: **ADMIN, SUPERADMIN**

1. Click the **Add Employee** button at the top of the list.
2. Fill in all required fields in the modal:
   - Employee No. (5-character code, e.g. `00033`)
   - Last Name, First Name
   - Gender
   - Birth Date, Hire Date
   - Separation Date (leave blank if currently employed)
3. Click **Save**.

> **Screenshot placeholder:** `um-06-add-employee-modal.png`
> *Caption: Add Employee modal*

The new employee will appear in the list with `record_status = ACTIVE`.

### 6.4 Editing an Employee

> Available to: **ADMIN, SUPERADMIN**

1. Click the **Edit** button on the employee row you want to update.
2. Change the fields as needed. Employee No. is read-only.
3. Click **Save**.

> **Screenshot placeholder:** `um-06-edit-employee-modal.png`
> *Caption: Edit Employee modal*

### 6.5 Soft-Deleting an Employee

> Available to: **SUPERADMIN only**

1. Click the **Delete** button on an ACTIVE employee row.
2. A confirmation dialog will appear — click **Confirm**.

> **Screenshot placeholder:** `um-06-delete-confirm.png`
> *Caption: Soft-delete confirmation dialog*

The employee's `record_status` is set to **INACTIVE**. Their record is not permanently removed — it moves to the **Deleted Items** panel and can be recovered at any time.

> **Cascade behavior:** When an employee is soft-deleted, all of their job history rows are automatically set to INACTIVE at the same time. No manual action is needed for job history.

### 6.6 Recovering an Employee

> Available to: **ADMIN, SUPERADMIN**

INACTIVE employees are visible in the list for ADMIN and SUPERADMIN. To recover one:

1. Locate the INACTIVE employee row (shown with INACTIVE status).
2. Click the **Recover** button.

The employee and all of their job history rows are restored to **ACTIVE** simultaneously.

> Alternatively, use the **Deleted Items** panel (see Section 10).

---

---

## 7. Job History Module

Job history records track every job assignment an employee has held. Each record has a composite key of **Employee No. + Job Code + Effective Date** — this means the same employee can have multiple job history rows as long as the effective date or job code differs.

Job history is managed from the **Employee Detail page** (click View on any employee in the Employees list).

> **Screenshot placeholder:** `um-07-jh-panel.png`
> *Caption: Job History panel on the Employee Detail page*

### 7.1 Adding a Job History Row

> Available to: **ADMIN, SUPERADMIN**

1. Open the Employee Detail page for the relevant employee.
2. In the Job History panel, click **Add Job History**.
3. Fill in:
   - Job Code (select from list)
   - Effective Date
   - Salary
   - Department Code (select from list)
4. Click **Save**.

> **Screenshot placeholder:** `um-07-add-jh-modal.png`
> *Caption: Add Job History modal*

### 7.2 Editing a Job History Row

> Available to: **ADMIN, SUPERADMIN**

1. In the Job History panel, click **Edit** on the row to update.
2. Modify the salary or department as needed. The composite PK fields (Job Code, Effective Date) are read-only.
3. Click **Save**.

### 7.3 Soft-Deleting a Job History Row

> Available to: **SUPERADMIN only**

1. In the Job History panel, click **Delete** on the row to remove.
2. Confirm in the dialog.

The row is set to INACTIVE and hidden from USER view. It can be recovered from the **Deleted Items** panel.

> **Note:** When an employee is soft-deleted (Section 6.5), all their job history rows cascade to INACTIVE automatically. You do not need to delete job history rows manually.

---

---

## 8. Job Module

Navigate to **Jobs** in the sidebar.

> **Screenshot placeholder:** `um-08-job-list.png`
> *Caption: Jobs list page — SUPERADMIN view*

The Jobs module manages the list of job positions available in the organization (e.g. Manager, Analyst, Vice President).

### 8.1 Adding a Job

> Available to: **ADMIN, SUPERADMIN**

1. Click **Add Job**.
2. Enter:
   - Job Code (4-character code, e.g. `MGR`)
   - Job Description
3. Click **Save**.

> **Screenshot placeholder:** `um-08-add-job-modal.png`
> *Caption: Add Job modal*

### 8.2 Editing a Job

> Available to: **ADMIN, SUPERADMIN**

1. Click **Edit** on any job row.
2. Update the Job Description. Job Code is read-only.
3. Click **Save**.

### 8.3 Soft-Deleting a Job

> Available to: **SUPERADMIN only**

1. Click **Delete** on a job row and confirm.

The job is set to INACTIVE and hidden from USER view. It can be recovered from the **Deleted Items** panel.

---

---

## 9. Department Module

Navigate to **Departments** in the sidebar.

> **Screenshot placeholder:** `um-09-dept-list.png`
> *Caption: Departments list page — SUPERADMIN view*

The Departments module manages the organizational units employees belong to (e.g. Human Resources, Information Technology).

### 9.1 Adding a Department

> Available to: **ADMIN, SUPERADMIN**

1. Click **Add Department**.
2. Enter:
   - Department Code (3-character code, e.g. `HRD`)
   - Department Name
3. Click **Save**.

### 9.2 Editing a Department

> Available to: **ADMIN, SUPERADMIN**

1. Click **Edit** on a department row.
2. Update the Department Name. Department Code is read-only.
3. Click **Save**.

### 9.3 Soft-Deleting a Department

> Available to: **SUPERADMIN only**

1. Click **Delete** on a department row and confirm.

The department is set to INACTIVE. It can be recovered from the **Deleted Items** panel.

---

---

## 10. Deleted Items Panel

> Available to: **ADMIN, SUPERADMIN only**

Navigate to **Deleted Items** in the sidebar. USER accounts will not see this link.

> **Screenshot placeholder:** `um-10-deleted-items.png`
> *Caption: Deleted Items page — 4 tabs for Employees, Job History, Jobs, Departments*

The Deleted Items panel shows all INACTIVE records across all four modules in four separate tabs:

- **Employees** — soft-deleted employees
- **Job History** — individually soft-deleted job history rows
- **Jobs** — soft-deleted job positions
- **Departments** — soft-deleted organizational units

### Recovering a Record

1. Navigate to the appropriate tab.
2. Find the record to restore.
3. Click **Recover**.

The record is immediately set back to ACTIVE and disappears from the Deleted Items panel.

> **Note for Employees:** Recovering an employee from the Deleted Items panel also restores all of their cascaded job history rows to ACTIVE at the same time.

> **Note for Job History:** Job history rows have a composite key (Employee No. + Job Code + Effective Date). The system handles this automatically — no extra steps are needed.

---

---

## 11. HR Reports Module

> Available to: **ADMIN, SUPERADMIN only**

Navigate to **Reports** in the sidebar. USER accounts will not see this link.

The Reports module provides three read-only analytical views generated directly from the live database.

### 11.1 Headcount by Department

> **Screenshot placeholder:** `um-11-headcount.png`
> *Caption: Headcount by Department report*

Shows the number of currently active employees per department.

| Column | Description |
|---|---|
| Department Code | The department's code |
| Department Name | The department's full name |
| Active Headcount | Count of ACTIVE employees currently assigned to this department |

All 8 departments are always shown — departments with no active employees appear with a headcount of 0.

The headcount updates in real time as employees are added, soft-deleted, or recovered.

### 11.2 Salary Summary by Job

> **Screenshot placeholder:** `um-11-salary-summary.png`
> *Caption: Salary Summary by Job report*

Shows salary statistics per job position across all active job history assignments.

| Column | Description |
|---|---|
| Job Code | The job's code |
| Job Description | The job's full name |
| Assignments | Number of active job history rows for this position |
| Min Salary | Lowest salary among active assignments |
| Max Salary | Highest salary among active assignments |
| Avg Salary | Average salary rounded to 2 decimal places |

Jobs with no active assignments show NULL for salary statistics.

### 11.3 Employee Full History

> **Screenshot placeholder:** `um-11-employee-history.png`
> *Caption: Employee Full History report — all job history rows for a selected employee*

Allows an administrator to view the complete job history of any employee, including INACTIVE rows, for audit and review purposes.

1. Select an employee from the dropdown or search field.
2. All job history rows for that employee are shown in chronological order.

---

---

## 12. Admin Module — User Management

> Available to: **ADMIN, SUPERADMIN only**

Navigate to **Admin** in the sidebar.

> **Screenshot placeholder:** `um-12-admin-page.png`
> *Caption: Admin — User Management page showing all registered users*

The Admin module displays all users registered in the system. Each row shows:

| Column | Description |
|---|---|
| Display ID | Human-readable ID (user1, user2, ...) — not the raw database UUID |
| Email | The user's Google account email |
| User Type | SUPERADMIN, ADMIN, or USER |
| Status | ACTIVE or INACTIVE |
| Actions | Activate or Deactivate button (where permitted) |

### 12.1 Activating a User

New users who register via Google OAuth arrive as **USER / INACTIVE**. They cannot log in until activated.

> Available to: **ADMIN, SUPERADMIN**

1. Find the user row with `record_status = INACTIVE`.
2. Click **Activate**.

> **Screenshot placeholder:** `um-12-activate-user.png`
> *Caption: Activating an INACTIVE user account*

The user's status changes to **ACTIVE** immediately. They can now log in.

### 12.2 Deactivating a User

> Available to: **ADMIN, SUPERADMIN**

1. Find the user row with `record_status = ACTIVE`.
2. Click **Deactivate**.

The user's status changes to **INACTIVE**. They will not be able to log in until reactivated.

### 12.3 SUPERADMIN Account Protection

SUPERADMIN accounts are **permanently protected** at both the UI and database levels.

> **Screenshot placeholder:** `um-12-superadmin-protected.png`
> *Caption: SUPERADMIN rows shown with disabled controls in the Admin module*

- In the Admin UI, the Activate / Deactivate buttons are **disabled** for all SUPERADMIN rows.
- Hovering over the disabled control shows a tooltip: *"SUPERADMIN accounts cannot be modified."*
- Even a direct database API call attempting to update a SUPERADMIN row will be **blocked by RLS** — the `hr_user_update_status` policy enforces `user_type != 'SUPERADMIN'` at the database level.

This protection cannot be bypassed through the application or through direct API access.

---

---

## 13. Logging Out

1. Click the **Logout** button in the topbar (top-right area of the screen).
2. You will be redirected to the Login page.
3. Your session is cleared — navigating to any protected route will redirect back to Login.

> **Screenshot placeholder:** `um-13-logout.png`
> *Caption: Logout button in the topbar*

---

---

## 14. Frequently Asked Questions

**Q: I registered but cannot log in. What do I do?**
Your account is pending activation. Contact your system administrator (an ADMIN or SUPERADMIN) and ask them to activate your account in the Admin module.

---

**Q: I can see employees but the buttons (Add, Edit, Delete) are missing. Why?**
Your user account is of type USER. USER accounts have read-only access across all HR modules. Only ADMIN and SUPERADMIN accounts have write access. Contact your administrator if you need elevated access.

---

**Q: An employee I deleted is gone from my view. Did I permanently delete them?**
No. HopeHRS never permanently deletes any record. The employee was soft-deleted — their `record_status` was set to INACTIVE. ADMIN and SUPERADMIN users can still see them and recover them from the **Deleted Items** panel.

---

**Q: I soft-deleted an employee and all their job history disappeared too. Is that expected?**
Yes. This is the cascade soft-delete behavior. When an employee is deactivated, all their job history rows are automatically set to INACTIVE at the same time. When the employee is recovered, all their job history rows are restored as well.

---

**Q: The Deleted Items and Admin links are not in my sidebar. Where are they?**
These links are only visible to ADMIN and SUPERADMIN accounts. If you are a USER, you will not see them. If you believe you should have elevated access, contact your system administrator.

---

**Q: Can I change my user type from USER to ADMIN myself?**
No. User type changes can only be made by SUPERADMIN accounts directly in the database. The Admin module in the UI only allows activating or deactivating accounts — it does not expose a user type change function.

---

**Q: Why does Google always show an account picker even if I am already signed in?**
This is intentional. The system forces the Google account picker on every login to prevent accidental sign-in with the wrong Google account, especially on shared computers.

---

**Q: What is the Stamp column?**
The Stamp column is an internal audit trail field that records who last modified a record and when. It is visible only to ADMIN and SUPERADMIN accounts — it is hidden from USER view entirely.

---

*Document prepared by M5 — QA / Docs | Ramones*
*New Era University — BS Information Technology | AY 2025–2026*
*HopeHRS Version 1.0 — Sprint 3 Final*
