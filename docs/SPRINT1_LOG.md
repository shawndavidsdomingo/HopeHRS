# Sprint 1 Log — Hope, Inc. HR System
**Sprint Theme:** Project Setup, Database Initialization, Authentication & Login Guard
**Duration:** Week 1 – Week 2
**Sprint Goal:** Dev environment ready, Supabase fully initialized with all HR tables and seed data, Google OAuth registration working, login guard in place.

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
| Apr 18 | M1 | PR-01 | `feat/vite-react-tailwind` | Vite + React + Tailwind initial setup |
| Apr 18 | M1 | PR-02 | `feat/supabase-client` | Supabase client init, .env config |
| Apr 19 | M1 | PR-03 | `feat/routes-protected` | All HR routes, ProtectedRoute, placeholder pages |
| Apr 20 | M1 | PR-04 | `feat/branch-protection` | Branch protection rules and PR template |
| Apr 21 | M2 | PR-01 | `feat/ui-login-page` | Login form with Google OAuth button |
| Apr 22 | M2 | PR-02 | `feat/ui-register-page` | Register page UI |
| Apr 22 | M2 | PR-03 | `feat/ui-app-shell` | AppShell layout with sidebar and topbar |
| Apr 22 | M2 | PR-04 | `feat/ui-auth-callback` | AuthCallback loading screen |
| May 7  | M3 | PR-01 | `db/initial-schema` | HopeDB HR tables + record_status + stamp |
| May 8  | M3 | PR-02 | `db/rights-seed` | 5 modules + 17 rights + SUPERADMIN seed |
| May 8  | M3 | PR-03 | `docs/db-erd` | ERD diagram and schema notes |
| May 8  | M3 | PR-04 | `db/verify-seed` | SQL verification queries |
| May 8  | M4 | PR-01 | `feat/auth-google-oauth` | Google OAuth login guard + AppShell fix |
| May 9  | M4 | PR-02 | `feat/auth-email-signup` | Login cleanup — Google OAuth only |
| May 9  | M1 | PR-03 | `feat/auth-google-oauth` | Redirect URL registration (Supabase + Google Cloud) |
| May 9  | M1 | PR-04 | `db/trigger-provision-user` | provision_new_user() trigger |
| May 9  | M5 | PR-01 | `test/sprint1-auth-flows` | Vitest auth test suite — 12 cases |
| May 9  | M1 | fix   | `fix/google-account-picker` | Force Google account picker on OAuth login and register |
| May 9  | M5 | PR-02 | `docs/sprint1-log-readme` | Sprint 1 log + README setup instructions |

---

## Tasks Completed

### M1 – PR-01 · Apr 18 · `feat/vite-react-tailwind`
- Scaffolded Vite + React project
- Installed and configured Tailwind CSS
- Confirmed app runs locally at `http://localhost:5173`

### M1 – PR-02 · Apr 18 · `feat/supabase-client`
- Installed `@supabase/supabase-js`
- Created `src/lib/supabaseClient.js` with `createClient` setup
- Added `.env` with Supabase project URL and anon key
- Added `.env.example` with placeholder values
- Updated `.gitignore` to exclude `.env` secrets

### M1 – PR-03 · Apr 19 · `feat/routes-protected`
- Installed React Router v6
- Created placeholder pages for all HR routes: `/employees`, `/jobhistory`, `/jobs`, `/departments`, `/admin`, `/deleted-items`, `/login`, `/auth/callback`
- Created `ProtectedRoute` component blocking unauthenticated access
- Updated `App.jsx` with full `BrowserRouter` and `Routes` setup
- Unauthenticated users redirected to `/login`

### M1 – PR-04 · Apr 20 · `feat/branch-protection`
- Added `.github/pull_request_template.md` with team PR checklist
- Branch protection rules set on `main` and `dev`:
  - Require pull request before merging
  - Require at least 1 approval
  - Block force pushes

### M2 – PR-01 · Apr 21 · `feat/ui-login-page`
- Implemented `Login.jsx` with email/password fields and Google OAuth button (UI-only, auth dormant)
- Configured `/login` as the default entry point in `App.jsx`
- Applied Slate/Blue branding and responsive layout

### M2 – PR-02 · Apr 22 · `feat/ui-register-page`
- Developed `Register.jsx` with First Name, Last Name, Username, Email, Password fields
- Added Google OAuth button placeholder
- Updated `App.jsx` routing to support `/register`

### M2 – PR-03 · Apr 22 · `feat/ui-app-shell`
- Created `AppShell.jsx` as the authenticated layout wrapper
- Sidebar with active state styling for Employees, Job History, Jobs, Departments
- Topbar with breadcrumb navigation and user initial placeholder
- Configured nested routing via React Router `<Outlet />`
- Logout button redirects to `/login` (UI-only)

### M2 – PR-04 · Apr 22 · `feat/ui-auth-callback`
- Created `AuthCallback.jsx` with HOPE, INC. branding and animated spinner
- `useEffect` with `setTimeout` simulating session verification before redirect to `/employees`
- Registered `/auth/callback` route in `App.jsx`

### M3 – PR-01 · May 7 · `db/initial-schema`
- Supabase project created; URL and anon key distributed to team
- HopeDB SQL executed on Supabase:
  - `employee`: 32 records
  - `department`: 8 records
  - `job`: 14 records
  - `jobHistory`: 54 records
- `record_status` column added to all tables (default: `'ACTIVE'`)
- `stamp` columns added to all tables

### M3 – PR-02 · May 8 · `db/rights-seed`
- Created rights tables: `module`, `rights`, `hr_user`, `user_module`, `user_module_rights`
- 5 modules seeded: `Emp_Mod`, `JH_Mod`, `Job_Mod`, `Dept_Mod`, `Adm_Mod`
- 17 rights seeded across all 5 modules (`EMP_VIEW` through `ADM_USER`)
- 6 SUPERADMIN accounts seeded (1 permanent + 5 dev team accounts)
- `sync_user_rights` trigger commented out — reserved for Sprint 2
- Migration saved to `db/migrations/002_rights_seed.sql`

### M3 – PR-03 · May 8 · `docs/db-erd`
- ERD diagram committed to `docs/db-erd.png`
- Schema notes committed to `docs/schema-notes.md`
- Covers all 9 tables: 4 HR tables + 5 rights tables
- Documents PKs, FKs, `record_status`, `stamp`, soft-delete and visibility rules

### M3 – PR-04 · May 8 · `db/verify-seed`
- Created `db/migrations/003_verify_seed.sql`
- Section 1: Row count checks for all 9 tables
- Section 2: `record_status` checks for HR and rights tables
- Section 3: FK integrity orphan checks for all relationships
- Section 4: SUPERADMIN rights verification (all 17 rights = 1)

### M4 – PR-01 · May 8 · `feat/auth-google-oauth`
- Fixed `checkLoginGuard` in `App.jsx` — corrected table name (`user` → `hr_user`) and match column (`userId` UUID → `email`)
- Added error logging to `checkLoginGuard`
- Replaced fake `navigate()` in `Register.jsx` with real `supabase.auth.signInWithOAuth({ provider: 'google' })`
- Uncommented `menuItems` array in `AppShell.jsx` (was causing `ReferenceError` crash on authenticated entry)
- Uncommented `supabase.auth.signOut()` in `AppShell.jsx` `handleSignOut`
- Added RLS policy on `public.hr_user`: `FOR SELECT TO authenticated USING (true)` via Supabase SQL Editor

### M4 – PR-02 · May 9 · `feat/auth-email-signup`
- Removed `signInWithPassword()`, email/password inputs, `handleLogin`, `useNavigate`, `displayError`, and all related state from `Login.jsx`
- Removed "Secure Sign In" decorative divider
- Simplified error display to use `pendingError` prop directly
- Added `queryParams: { prompt: 'select_account' }` to both `Login.jsx` and `Register.jsx` OAuth calls to force Google account picker (fix for Chrome FedCM auto-select behavior)

### M1 (Domingo) – fix · May 9 · `fix/google-account-picker`
- Added `queryParams: { prompt: 'select_account' }` to `Login.jsx` OAuth call
- Added `queryParams: { prompt: 'select_account' }` to `Register.jsx` OAuth call
- Fixes Chrome FedCM (Federated Credential Management) behavior introduced in 2023 where the browser auto-selects the last used Google account instead of showing the account picker
- Affects both Login and Register flows — account picker now always appears on every sign-in attempt

### M1 – PR-03 · May 9 · `feat/auth-google-oauth` *(config only, no code changes)*
- Registered `http://localhost:5173/auth/callback` in Supabase Dashboard → Authentication → URL Configuration
- Registered `http://localhost:5173/auth/callback` in Google Cloud Console → OAuth 2.0 → Authorized Redirect URIs
- Production Vercel URL to be added in Sprint 3

### M1 – PR-04 · May 9 · `db/trigger-provision-user`
- Created `db/migrations/004_provision_new_user.sql` — `provision_new_user()` trigger with `SECURITY DEFINER`, fires on `INSERT` into `auth.users`
- Auto-inserts new OAuth users into `hr_user` as `USER / INACTIVE`
- Auto-inserts `user_module` rows for 4 HR modules (excludes `Adm_Mod`)
- Auto-inserts `user_module_rights` with VIEW rights = 1, all others = 0
- Email existence check prevents duplicate rows for seeded SUPERADMIN accounts
- Modified `002_rights_seed.sql` — `userId` widened from `VARCHAR(10)` to `VARCHAR(36)` to accommodate Supabase UUIDs

### M5 – PR-01 · May 9 · `test/sprint1-auth-flows`
- Installed Vitest, jsdom, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`
- Configured `vite.config.js` with Vitest (jsdom environment, globals, coverage via v8)
- Updated `package.json` with `test`, `test:run`, `test:coverage` scripts
- Created `src/tests/setup.js` and `src/tests/__mocks__/supabaseClient.js`
- Written and executed `src/tests/auth.test.jsx` — **12/12 tests passing**

| Test Case | Description | Result |
|-----------|-------------|--------|
| TC-01 | Login renders Google button | ✅ Pass |
| TC-01 | Login fires `signInWithOAuth` on click | ✅ Pass |
| TC-01 | Login displays `pendingError` prop | ✅ Pass |
| TC-02 | Register renders Google button | ✅ Pass |
| TC-02 | Register fires `signInWithOAuth` on click | ✅ Pass |
| TC-02 | Register has no email/password fields | ✅ Pass |
| TC-03 | ACTIVE `hr_user` → `signOut` not called | ✅ Pass |
| TC-04 | PENDING user → pending activation message shown | ✅ Pass |
| TC-04 | Unknown user → unable to verify message shown | ✅ Pass |
| TC-05 | AuthCallback renders spinner while session resolves | ✅ Pass |
| TC-06 | AuthCallback renders spinner when no session | ✅ Pass |
| TC-05 | `getSession` called exactly once on mount | ✅ Pass |

### M5 – PR-02 · May 9 · `docs/sprint1-log-readme`
- Sprint 1 log completed with all PR dates, tasks, blockers, and resolutions
- `README.md` updated with full clone, install, `.env`, and run instructions

---

## Blockers & Resolutions

| # | Blocker | Resolution |
|---|---------|------------|
| 1 | `checkLoginGuard` returning 400 Bad Request on `hr_user` query | Table not exposed to PostgREST — added RLS SELECT policy via Supabase SQL Editor |
| 2 | `AppShell.jsx` crashing with `ReferenceError: menuItems is not defined` | `menuItems` was commented out but still referenced — uncommented it |
| 3 | Google OAuth auto-selecting last used account on Chrome (FedCM) | Added `queryParams: { prompt: 'select_account' }` to both OAuth calls |
| 4 | `checkLoginGuard` matching by `userId` (Supabase UUID) instead of `email` | `hr_user.userId` is `'user1'`–`'user6'`, not a UUID — switched `.eq()` to match on `email` |
| 5 | New Google OAuth registrants not appearing in `hr_user` | No trigger existed — M1 added `provision_new_user()` trigger in PR-04 |
| 6 | `hr_user.userId` too short for Supabase UUID | `VARCHAR(10)` widened to `VARCHAR(36)` in `002_rights_seed.sql` |
| 7 | Google OAuth redirect failing — callback URL not registered | M1 registered `http://localhost:5173/auth/callback` in both Supabase and Google Cloud Console |
| 8 | Chrome FedCM auto-selecting last used Google account, skipping account picker | M1 (Domingo) added `queryParams: { prompt: 'select_account' }` to Login and Register OAuth calls |

---

## Sprint 1 Gate — Status

| Gate Requirement | Status |
|------------------|--------|
| Dev environment set up (Vite + React + Tailwind + Supabase) | ✅ Done |
| All HR tables created with `record_status` and `stamp` | ✅ Done |
| Seed data: 32 employees, 8 departments, 14 jobs, 54 job history rows | ✅ Done |
| 5 modules + 17 rights + 6 SUPERADMIN accounts seeded | ✅ Done |
| Google OAuth login working for SUPERADMIN accounts | ✅ Done |
| Login guard blocks non-ACTIVE accounts | ✅ Done |
| New OAuth registrants auto-provisioned as USER / INACTIVE | ✅ Done |
| Auth test suite passing (12/12) | ✅ Done |

---

## Next Sprint Goals (Sprint 2 – Weeks 3 & 4)

- Full CRUD for all four HR tables: Employee, Job History, Job, Department
- Enforce 17 rights across 5 modules per user type (SUPERADMIN / ADMIN / USER)
- Soft-delete visibility: USER sees ACTIVE only, ADMIN/SUPERADMIN see all
- Cascade soft-delete: employee → jobHistory in the same operation
- Hide `stamp` column from USER in all table views
- Deleted Items panel for ADMIN/SUPERADMIN recovery
- 51-case rights test matrix committed as a single `test/` PR
- `sync_user_rights` trigger uncommented and implemented