<div align="center">

# HOPE, INC. HRS

**A real-time, serverless library visitor management system for New Era University.**
*Built to replace paper logbooks — one tap at a time.*

[![Live on Vercel](https://img.shields.io/badge/▲_Vercel-infoman2--hope--hrs--olive.vercel.app-black?style=for-the-badge)](group2-infoman2-hope-hrs-olive.vercel.app)

> **2026 Information Management 2 — Finals Project**
> New Era University · College of Informatics and Computing Studies

</div>

# Hope, Inc. — HR Management System

A web-based HR management system built for **Hope, Inc.** as a 6-week capstone project.
Manages employees, job history, jobs, and departments with role-based access control (SUPERADMIN / ADMIN / USER) enforced at both the UI and database layer via Supabase Row-Level Security.

**Stack:** React 19 · Vite · Tailwind CSS · Supabase (PostgreSQL + Auth) · Vitest

---

## Supabase Project

> Request credentials from M1 (Domingo) if you need the anon key.

| Item | Value |
|------|-------|
| Project URL | `https://xfeyfzhuppaxbmtostea.supabase.co` |
| Region | Southeast Asia |
| Auth Provider | Google OAuth only |

---

## Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- Git
- Access to the GitHub repository (ask M1 for invite)
- Access to the Supabase project (ask M1 for anon key)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/<org>/HopeHRS.git
cd HopeHRS
```

> Always branch off `dev` — **never work directly on `main`.**

```bash
git checkout dev
```

---

### 2. Install dependencies

```bash
npm install react react-dom react-router-dom @supabase/supabase-js lucide-react vite @vitejs/plugin-react tailwindcss @tailwindcss/postcss postcss autoprefixer eslint @eslint/js eslint-plugin-react-hooks eslint-plugin-react-refresh @types/react @types/react-dom globals vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install tailwindcss @tailwindcss/vite
```

---

### 3. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=https://xfeyfzhuppaxbmtostea.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

> Get the anon key from **Supabase Dashboard → Project Settings → API → anon public**.
> Never commit your `.env` file — it is already in `.gitignore`.

---

### 4. Run the development server

```bash
npm run dev
```

App will be available at `http://localhost:5173`

---

### 5. Run tests

```bash
# Run all tests once
npm run test:run

# Watch mode
npm run test

# With coverage report
npm run test:coverage
```

---

## Database Setup

Run the migration files **in order** via **Supabase Dashboard → SQL Editor**. All files use `DROP IF EXISTS`, `CREATE OR REPLACE`, and `ON CONFLICT DO NOTHING` patterns and are safe to re-run.

| Order | File | Description |
|-------|------|-------------|
| 1 | `db/migrations/001_initial_schema.sql` | Creates all 4 HR tables (`employee`, `jobhistory`, `job`, `department`) with `record_status` and `stamp` columns. Seeds 32 employees, 8 departments, 14 jobs, 54 job history rows. |
| 2 | `db/migrations/002_rights_seed.sql` | Creates rights tables, seeds 5 modules, 17 rights, and 6 SUPERADMIN accounts. |
| 3 | `db/migrations/003_verify_seed.sql` | Verification queries only — no schema changes. Run to confirm row counts and FK integrity after seeding. |
| 4 | `db/migrations/004_provision_new_user.sql` | Original `provision_new_user()` trigger. Superseded by `010` — always run `010` after this file. |
| 5 | `db/migrations/005_rls_employee.sql` | Enables RLS on `employee`. Creates 5 policies (`emp_select`, `emp_insert`, `emp_update_edit`, `emp_update_del`, `emp_update_recover`). |
| 6 | `db/migrations/006_rls_jobhistory_job_dept.sql` | Applies the same 5-policy RLS pattern to `jobhistory`, `job`, and `department` (15 policies total). Drops any auto-created `_dev` policies. |
| 7 | `db/migrations/007_trigger_cascade_softdelete.sql` | Creates the `on_employee_status_change` trigger. Cascades soft-delete and recovery from `employee` to all linked `jobhistory` rows. |
| 8 | `db/migrations/008_view_employee_current_job.sql` | Creates the `employee_current_job` view — one row per ACTIVE employee showing their latest ACTIVE job. **Must run before `011`**. |
| 9 | `db/migrations/009_trigger_sync_seeded_uid.sql` | First UID sync attempt (superseded). Kept for history — `010` replaces it. |
| 10 | `db/migrations/010_fix_provision_new_user.sql` | Complete rewrite of `provision_new_user()`. Fixes column name casing, adds UID sync logic (placeholder → real Auth UUID), drops FK constraints on `user_module` and `user_module_rights`, adds exception handler. **Replaces `004` and `009`**. |
| 11 | `db/migrations/011_views_reports.sql` | Creates `headcount_by_dept` and `salary_summary_by_job` SQL views for the HR Reports module. Requires `008` to be run first. |
| 12 | `db/migrations/012_rls_admin_user_mgmt.sql` | Adds `display_id` column to `hr_user` and first-version RLS policies. **Always run `012b` immediately after**. |
| 12b | `db/migrations/012b_rls_admin_user_mgmt_fix.sql` | Fixes infinite recursion in `hr_user` RLS via 4 `SECURITY DEFINER` helper functions (`get_my_user_type`, `is_admin_or_above`, `is_superadmin`, `get_user_type_for`). |
| 13 | `db/migrations/013_fix_display_ids_and_rls_select.sql` | Two hotfixes: (1) adds self-read clause to `hr_user` SELECT policy so `checkLoginGuard` works for all authenticated users; (2) reassigns `display_id` values to the correct team-defined order. |

> Do not skip files or run them out of order.

---

## Authentication

- Login uses **Google OAuth only** — no email/password
- After Google sign-in, users land on `/auth/callback`, which resolves their session
- `checkLoginGuard` in `App.jsx` queries `hr_user` by email to verify access
- Only users with `record_status = 'ACTIVE'` are allowed through
- New OAuth registrants are auto-provisioned as `USER / INACTIVE` via the `provision_new_user()` trigger and must be activated by an ADMIN or SUPERADMIN
- Google account picker is always shown (`prompt: 'select_account'`) — Chrome FedCM auto-select is suppressed

---

## Access Control

Rights are stored per-user in `user_module_rights` as `right_value` 0 or 1 across 17 right codes. `UserRightsContext` loads all 17 rights on login and exposes `hasRight(code)` throughout the app.

| Action | USER | ADMIN | SUPERADMIN |
|--------|------|-------|------------|
| View ACTIVE records | ✓ | ✓ | ✓ |
| View INACTIVE records | ✗ | ✓ | ✓ |
| Add / edit records | ✗ | ✓ | ✓ |
| Soft-delete records | ✗ | ✗ | ✓ |
| Recover deleted records | ✗ | ✓ | ✓ |
| View `stamp` column | ✗ | ✓ | ✓ |
| Access Reports & Deleted Items | ✗ | ✓ | ✓ |
| Activate / deactivate users | ✗ | non-SA only | non-SA only |

Rights are enforced at two independent layers — UI (buttons hidden/disabled) and database (RLS policies). SUPERADMIN accounts cannot be modified by any user at either layer.

---

## Database Schema

9 tables total: 4 HR tables + 5 rights tables. No hard deletes — all removals set `record_status = 'INACTIVE'`.

### HR Tables

| Table | PK | Notes |
|-------|----|-------|
| `employee` | `empno` (VARCHAR 5) | `record_status`, `stamp` |
| `jobhistory` | `(empno, jobcode, effdate)` composite | FKs to `employee`, `job`, `department` |
| `job` | `jobcode` (VARCHAR 4) | `record_status`, `stamp` |
| `department` | `deptcode` (VARCHAR 3) | `record_status`, `stamp` |

### Rights Tables

| Table | PK | Notes |
|-------|----|-------|
| `module` | `modulecode` | 5 modules seeded |
| `rights` | `rightcode` | 17 rights seeded |
| `hr_user` | `userid` | `user_type`, `record_status`, `display_id` |
| `user_module` | `(userid, modulecode)` | `rights_value` 0 or 1 |
| `user_module_rights` | `(userid, rightcode)` | `right_value` 0 or 1 |

> FK constraints on `user_module` and `user_module_rights` referencing `hr_user.userid` were permanently dropped in `010_fix_provision_new_user.sql` to allow the UID sync trigger to run without deadlocking. Referential integrity is enforced at the application layer.

See `docs/db-erd.png` and `docs/schema-notes.md` for the full ERD and field-level details.

---

## Database Triggers

| Trigger | Table | Event | Purpose |
|---------|-------|-------|---------|
| `on_auth_user_created` | `auth.users` | INSERT | Runs `provision_new_user()` — auto-provisions new OAuth users as USER / INACTIVE |
| `on_employee_status_change` | `employee` | UPDATE (record_status) | Cascades soft-delete and recovery to all linked `jobhistory` rows |
| `on_hr_user_insert_assign_display_id` | `hr_user` | INSERT | Assigns sequential `display_id` (user1, user2, …) for Admin UI |

---

## Project Structure

```
HopeHRS/
├── .github/
│   └── pull_request_template.md
├── db/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_rights_seed.sql
│       ├── 003_verify_seed.sql
│       ├── 004_provision_new_user.sql
│       ├── 005_rls_employee.sql
│       ├── 006_rls_jobhistory_job_dept.sql
│       ├── 007_trigger_cascade_softdelete.sql
│       ├── 008_view_employee_current_job.sql
│       ├── 009_trigger_sync_seeded_uid.sql
│       ├── 010_fix_provision_new_user.sql
│       ├── 011_views_reports.sql
│       ├── 012_rls_admin_user_mgmt.sql
│       ├── 012b_rls_admin_user_mgmt_fix.sql
│       └── 013_fix_display_ids_and_rls_select.sql
├── docs/
│   ├── db-erd.png
│   ├── schema-notes.md
│   ├── db-migrations.md
│   ├── final-rls-audit.md
│   ├── SPRINT1_LOG.md
│   └── SPRINT2_LOG.md
├── src/
│   ├── components/
│   │   └── AppShell.jsx
│   ├── contexts/
│   │   └── UserRightsContext.jsx
│   ├── lib/
│   │   ├── supabaseClient.js
│   │   ├── employeeService.js
│   │   ├── jobHistoryService.js
│   │   ├── jobService.js
│   │   ├── departmentService.js
│   │   └── adminService.js
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── AuthCallback.jsx
│   │   ├── Employees.jsx
│   │   ├── EmployeeDetailPage.jsx
│   │   ├── Jobs.jsx
│   │   ├── Departments.jsx
│   │   ├── JobHistory.jsx
│   │   ├── Admin.jsx
│   │   └── DeletedItems.jsx
│   ├── routes/
│   │   └── ProtectedRoute.jsx
│   ├── tests/
│   │   ├── __mocks__/
│   │   │   └── supabaseClient.js
│   │   ├── setup.js
│   │   └── auth.test.jsx
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

---

## Branch & PR Rules

- All branches must be created from `dev` — never from `main`
- Branch naming: `feat/`, `fix/`, `db/`, `test/`, `docs/`
- PRs must be reviewed and approved by at least 1 other member before merging
- PRs merge into `dev` only — release PRs from `dev → main` at the end of each sprint
- After merge, delete the feature branch from GitHub
- Never commit `.env` files or API keys

---

## Team

| Role | Member | Email |
|------|--------|-------|
| M1 – Project Lead | Domingo | shawndavid.domingo@neu.edu.ph |
| M2 – Frontend Dev | Espina | rene.espina@neu.edu.ph |
| M3 – DB Engineer | Timbang | myra.timbang@neu.edu.ph |
| M4 – Rights & Auth | Claveria | daveandrew.claveria@neu.edu.ph |
| M5 – QA / Docs | Ramones | glennross.ramones@neu.edu.ph |

---

*New Era University — College of Computer Studies · AY 2025–2026*
