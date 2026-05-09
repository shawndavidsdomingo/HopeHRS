# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Hope, Inc. — Human Resource System

A web-based HR management system built for **Hope, Inc.** as a 6-week capstone project.
Manages employees, job history, jobs, and departments with role-based access control (SUPERADMIN / ADMIN / USER).

**Stack:** React 19 · Vite · Tailwind CSS · Supabase (PostgreSQL + Auth) · Vitest

---

## Supabase Project

> Request credentials from M1 (Domingo) if you need the anon key.

| Item | Value |
|------|-------|
| Project URL | `https://xfeyfzhuppaxbmtostea.supabase.co` |
| Region | Southeast Asia |
| Auth Provider | Google OAuth |

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

Run the migration files **in order** via **Supabase Dashboard → SQL Editor**:

| Order | File | Description |
|-------|------|-------------|
| 1 | `db/migrations/001_initial_schema.sql` | Creates all 4 HR tables with `record_status` and `stamp` columns, seeds 32 employees, 8 departments, 14 jobs, 54 job history rows |
| 2 | `db/migrations/002_rights_seed.sql` | Creates rights tables, seeds 5 modules, 17 rights, 6 SUPERADMIN accounts |
| 3 | `db/migrations/003_verify_seed.sql` | Verification queries — run to confirm row counts and FK integrity |
| 4 | `db/migrations/004_provision_new_user.sql` | Auto-provision trigger for new Google OAuth registrants |

> Do not skip files or run out of order.

---

## Supabase RLS Setup

After running migrations, run this in the **Supabase SQL Editor** to allow the login guard to query `hr_user`:

```sql
CREATE POLICY "Allow authenticated read"
ON public.hr_user
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (true);
```

---

## Authentication

- Login and Register both use **Google OAuth only** — no email/password
- After Google sign-in, users land on `/auth/callback` which checks their session
- The login guard (`checkLoginGuard` in `App.jsx`) queries `hr_user` by email
- Only users with `record_status = 'ACTIVE'` are allowed through
- New registrants are auto-provisioned as `USER / INACTIVE` via the `provision_new_user()` trigger and must be activated by an ADMIN or SUPERADMIN

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
│       └── 004_provision_new_user.sql
├── docs/
│   ├── db-erd.png
│   ├── schema-notes.md
│   └── SPRINT1_LOG.md
├── src/
│   ├── components/
│   │   └── AppShell.jsx
│   ├── lib/
│   │   └── supabaseClient.js
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── AuthCallback.jsx
│   │   ├── Employees.jsx
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
- PRs merge into `dev` only — release PRs from `dev` → `main` at end of each sprint
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
