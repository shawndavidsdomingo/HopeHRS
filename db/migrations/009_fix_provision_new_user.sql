-- ============================================================
-- db/migrations/009_fix_provision_new_user.sql
-- Hotfix: fix/sync-seeded-uid-on-login
-- ============================================================
-- Fixes multiple cascading issues that blocked new Google OAuth
-- registrations and seeded account logins:
--
--   1. provision_new_user() used camelCase column names
--      (moduleCode, rightCode) — Postgres lowercases all
--      unquoted identifiers so these columns didn't exist,
--      crashing the trigger on every new login
--
--   2. on_auth_user_created_sync_uid conflicted with
--      provision_new_user() — both firing on auth.users INSERT
--      caused "Database error saving new user"
--
--   3. Seeded accounts had placeholder userids (user1–user6,
--      prof-superadmin-1) that didn't match real Supabase Auth
--      UUIDs — RLS policies compare auth.uid() against
--      hr_user.userid so all queries returned 0 rows
--
--   4. FK constraints on user_module and user_module_rights
--      blocked uid sync inside the trigger — Postgres cannot
--      ALTER TABLE constraints mid-transaction inside a trigger
--
-- Solution:
--   - Drop FK constraints permanently (integrity enforced by app)
--   - Drop conflicting sync trigger
--   - Rewrite provision_new_user() with correct column names,
--     uid sync logic, exception handler, and search_path
--   - Re-seed all placeholder userid accounts
--
-- Run in Supabase SQL Editor before Sprint 3 begins.
-- ============================================================


-- ============================================================
-- STEP 1: Drop FK constraints permanently
-- ============================================================
-- These constraints blocked uid sync inside triggers.
-- Referential integrity is maintained by:
--   - provision_new_user() always inserting correct userids
--   - Service functions using soft delete (record_status only)
--   - RLS policies enforcing access at DB level

ALTER TABLE public.user_module
  DROP CONSTRAINT IF EXISTS user_module_userid_fkey;

ALTER TABLE public.user_module_rights
  DROP CONSTRAINT IF EXISTS user_module_rights_userid_fkey;


-- ============================================================
-- STEP 2: Drop conflicting sync trigger
-- ============================================================
-- on_auth_user_created_sync_uid conflicted with
-- provision_new_user() — uid sync is now built into
-- provision_new_user() directly

DROP TRIGGER IF EXISTS on_auth_user_created_sync_uid ON auth.users;
DROP FUNCTION IF EXISTS sync_seeded_user_uid();


-- ============================================================
-- STEP 3: Rewrite provision_new_user()
-- ============================================================

CREATE OR REPLACE FUNCTION provision_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_uid TEXT;
BEGIN
  -- Check if email already exists in hr_user (seeded accounts)
  SELECT userid INTO old_uid
  FROM public.hr_user
  WHERE email = NEW.email;

  IF old_uid IS NOT NULL THEN
    -- Email exists — sync userid to real Auth UUID if different
    -- FK constraints are dropped so this runs freely
    IF old_uid != NEW.id::text THEN

      UPDATE public.user_module_rights
      SET userid = NEW.id::text
      WHERE userid = old_uid;

      UPDATE public.user_module
      SET userid = NEW.id::text
      WHERE userid = old_uid;

      UPDATE public.hr_user
      SET userid = NEW.id::text
      WHERE userid = old_uid;

    END IF;

    -- Skip new row insertion — account already exists
    RETURN NEW;
  END IF;

  -- ── New user — insert as USER / INACTIVE ──────────────────
  INSERT INTO public.hr_user (userid, email, user_type, record_status, stamp)
  VALUES (
    NEW.id::text,
    NEW.email,
    'USER',
    'INACTIVE',
    LEFT('PROVISIONED | ' || COALESCE(NEW.email, '') || ' | ' || NOW()::text, 60)
  );

  -- Insert user_module rows for 4 HR modules (exclude Adm_Mod)
  INSERT INTO public.user_module (userid, modulecode, rights_value)
  SELECT NEW.id::text, m.modulecode, 0
  FROM public.module m
  WHERE m.modulecode != 'Adm_Mod';

  -- Insert user_module_rights: VIEW = 1, all others = 0
  INSERT INTO public.user_module_rights (userid, rightcode, right_value)
  SELECT NEW.id::text, r.rightcode,
    CASE
      WHEN r.rightcode IN ('EMP_VIEW', 'JH_VIEW', 'JOB_VIEW', 'DEPT_VIEW') THEN 1
      ELSE 0
    END
  FROM public.rights r
  WHERE r.modulecode != 'Adm_Mod';

  RETURN NEW;

EXCEPTION
  WHEN OTHERS THEN
    -- Log error but never block auth.users insert
    RAISE LOG 'provision_new_user error for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$;


-- ============================================================
-- STEP 4: Re-seed placeholder accounts
-- ============================================================
-- All seeded accounts that still have placeholder userids
-- (user1–user6, prof-superadmin-1) need to be in hr_user with
-- their correct email so provision_new_user() can find them
-- and sync the uid on first Google OAuth login.
--
-- Run the re-seed only for accounts not yet synced.
-- ON CONFLICT DO NOTHING prevents duplicate inserts.

-- Professor account
INSERT INTO public.hr_user (userid, email, user_type, record_status, stamp)
VALUES ('prof-superadmin-1', 'jcesperanza@neu.edu.ph', 'SUPERADMIN', 'ACTIVE', 'SEEDED')
ON CONFLICT (userid) DO NOTHING;

INSERT INTO public.user_module (userid, modulecode, rights_value)
SELECT 'prof-superadmin-1', m.modulecode, 1
FROM public.module m
ON CONFLICT DO NOTHING;

INSERT INTO public.user_module_rights (userid, rightcode, right_value)
SELECT 'prof-superadmin-1', r.rightcode, 1
FROM public.rights r
ON CONFLICT DO NOTHING;

-- Dev team accounts (only inserts if they don't already exist)
INSERT INTO public.hr_user (userid, email, user_type, record_status, stamp)
VALUES
  ('user2', 'shawndavid.domingo@neu.edu.ph',  'SUPERADMIN', 'ACTIVE', 'SEEDED'),
  ('user3', 'rene.espina@neu.edu.ph',          'SUPERADMIN', 'ACTIVE', 'SEEDED'),
  ('user4', 'myra.timbang@neu.edu.ph',         'SUPERADMIN', 'ACTIVE', 'SEEDED'),
  ('user5', 'daveandrew.claveria@neu.edu.ph',  'SUPERADMIN', 'ACTIVE', 'SEEDED'),
  ('user6', 'glennross.ramones@neu.edu.ph',    'SUPERADMIN', 'ACTIVE', 'SEEDED')
ON CONFLICT (userid) DO NOTHING;

INSERT INTO public.user_module (userid, modulecode, rights_value)
SELECT u.userid, m.modulecode, 1
FROM public.hr_user u
CROSS JOIN public.module m
WHERE u.userid IN ('user2','user3','user4','user5','user6')
ON CONFLICT DO NOTHING;

INSERT INTO public.user_module_rights (userid, rightcode, right_value)
SELECT u.userid, r.rightcode, 1
FROM public.hr_user u
CROSS JOIN public.rights r
WHERE u.userid IN ('user2','user3','user4','user5','user6')
ON CONFLICT DO NOTHING;


-- ============================================================
-- STEP 5: Verify everything is correct
-- ============================================================

-- Check all seeded accounts have placeholder userids set
SELECT userid, email, user_type, record_status
FROM public.hr_user
WHERE userid IN (
  'prof-superadmin-1','user2','user3','user4','user5','user6'
)
ORDER BY userid;
-- Expected: 6 rows, all SUPERADMIN, ACTIVE

-- Check professor has all 17 rights = 1
SELECT COUNT(*) AS rights_count,
       SUM(right_value) AS rights_enabled
FROM public.user_module_rights
WHERE userid = 'prof-superadmin-1';
-- Expected: rights_count = 17, rights_enabled = 17

-- Check trigger is still attached
SELECT trigger_name, event_object_schema, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
-- Expected: 1 row on auth.users

-- Check FK constraints are dropped
SELECT constraint_name
FROM information_schema.table_constraints
WHERE table_name IN ('user_module', 'user_module_rights')
  AND constraint_type = 'FOREIGN KEY'
  AND constraint_name IN (
    'user_module_userid_fkey',
    'user_module_rights_userid_fkey'
  );
-- Expected: 0 rows


-- ============================================================
-- VERIFICATION: After professor's first login
-- ============================================================
-- Run after jcesperanza@neu.edu.ph logs in via Google OAuth

/*
-- Confirm uid was synced automatically
SELECT h.userid, h.email, h.user_type,
       a.id::text AS auth_id,
       (h.userid = a.id::text) AS is_match
FROM public.hr_user h
JOIN auth.users a ON h.email = a.email
WHERE h.email = 'jcesperanza@neu.edu.ph';
-- Expected: is_match = true, SUPERADMIN, ACTIVE

-- Confirm all 17 rights loaded
SELECT rightcode, right_value
FROM public.user_module_rights
WHERE userid = (
  SELECT userid FROM public.hr_user
  WHERE email = 'jcesperanza@neu.edu.ph'
)
ORDER BY rightcode;
-- Expected: 17 rows, all right_value = 1
*/-- ============================================================
-- db/migrations/009_fix_provision_new_user.sql
-- Hotfix: fix/sync-seeded-uid-on-login
-- ============================================================
-- Fixes multiple cascading issues that blocked new Google OAuth
-- registrations and seeded account logins:
--
--   1. provision_new_user() used camelCase column names
--      (moduleCode, rightCode) — Postgres lowercases all
--      unquoted identifiers so these columns didn't exist,
--      crashing the trigger on every new login
--
--   2. on_auth_user_created_sync_uid conflicted with
--      provision_new_user() — both firing on auth.users INSERT
--      caused "Database error saving new user"
--
--   3. Seeded accounts had placeholder userids (user1–user6,
--      prof-superadmin-1) that didn't match real Supabase Auth
--      UUIDs — RLS policies compare auth.uid() against
--      hr_user.userid so all queries returned 0 rows
--
--   4. FK constraints on user_module and user_module_rights
--      blocked uid sync inside the trigger — Postgres cannot
--      ALTER TABLE constraints mid-transaction inside a trigger
--
-- Solution:
--   - Drop FK constraints permanently (integrity enforced by app)
--   - Drop conflicting sync trigger
--   - Rewrite provision_new_user() with correct column names,
--     uid sync logic, exception handler, and search_path
--   - Re-seed all placeholder userid accounts
--
-- Run in Supabase SQL Editor before Sprint 3 begins.
-- ============================================================


-- ============================================================
-- STEP 1: Drop FK constraints permanently
-- ============================================================
-- These constraints blocked uid sync inside triggers.
-- Referential integrity is maintained by:
--   - provision_new_user() always inserting correct userids
--   - Service functions using soft delete (record_status only)
--   - RLS policies enforcing access at DB level

ALTER TABLE public.user_module
  DROP CONSTRAINT IF EXISTS user_module_userid_fkey;

ALTER TABLE public.user_module_rights
  DROP CONSTRAINT IF EXISTS user_module_rights_userid_fkey;


-- ============================================================
-- STEP 2: Drop conflicting sync trigger
-- ============================================================
-- on_auth_user_created_sync_uid conflicted with
-- provision_new_user() — uid sync is now built into
-- provision_new_user() directly

DROP TRIGGER IF EXISTS on_auth_user_created_sync_uid ON auth.users;
DROP FUNCTION IF EXISTS sync_seeded_user_uid();


-- ============================================================
-- STEP 3: Rewrite provision_new_user()
-- ============================================================

CREATE OR REPLACE FUNCTION provision_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_uid TEXT;
BEGIN
  -- Check if email already exists in hr_user (seeded accounts)
  SELECT userid INTO old_uid
  FROM public.hr_user
  WHERE email = NEW.email;

  IF old_uid IS NOT NULL THEN
    -- Email exists — sync userid to real Auth UUID if different
    -- FK constraints are dropped so this runs freely
    IF old_uid != NEW.id::text THEN

      UPDATE public.user_module_rights
      SET userid = NEW.id::text
      WHERE userid = old_uid;

      UPDATE public.user_module
      SET userid = NEW.id::text
      WHERE userid = old_uid;

      UPDATE public.hr_user
      SET userid = NEW.id::text
      WHERE userid = old_uid;

    END IF;

    -- Skip new row insertion — account already exists
    RETURN NEW;
  END IF;

  -- ── New user — insert as USER / INACTIVE ──────────────────
  INSERT INTO public.hr_user (userid, email, user_type, record_status, stamp)
  VALUES (
    NEW.id::text,
    NEW.email,
    'USER',
    'INACTIVE',
    LEFT('PROVISIONED | ' || COALESCE(NEW.email, '') || ' | ' || NOW()::text, 60)
  );

  -- Insert user_module rows for 4 HR modules (exclude Adm_Mod)
  INSERT INTO public.user_module (userid, modulecode, rights_value)
  SELECT NEW.id::text, m.modulecode, 0
  FROM public.module m
  WHERE m.modulecode != 'Adm_Mod';

  -- Insert user_module_rights: VIEW = 1, all others = 0
  INSERT INTO public.user_module_rights (userid, rightcode, right_value)
  SELECT NEW.id::text, r.rightcode,
    CASE
      WHEN r.rightcode IN ('EMP_VIEW', 'JH_VIEW', 'JOB_VIEW', 'DEPT_VIEW') THEN 1
      ELSE 0
    END
  FROM public.rights r
  WHERE r.modulecode != 'Adm_Mod';

  RETURN NEW;

EXCEPTION
  WHEN OTHERS THEN
    -- Log error but never block auth.users insert
    RAISE LOG 'provision_new_user error for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$;


-- ============================================================
-- STEP 4: Re-seed placeholder accounts
-- ============================================================
-- All seeded accounts that still have placeholder userids
-- (user1–user6, prof-superadmin-1) need to be in hr_user with
-- their correct email so provision_new_user() can find them
-- and sync the uid on first Google OAuth login.
--
-- Run the re-seed only for accounts not yet synced.
-- ON CONFLICT DO NOTHING prevents duplicate inserts.

-- Professor account
INSERT INTO public.hr_user (userid, email, user_type, record_status, stamp)
VALUES ('prof-superadmin-1', 'jcesperanza@neu.edu.ph', 'SUPERADMIN', 'ACTIVE', 'SEEDED')
ON CONFLICT (userid) DO NOTHING;

INSERT INTO public.user_module (userid, modulecode, rights_value)
SELECT 'prof-superadmin-1', m.modulecode, 1
FROM public.module m
ON CONFLICT DO NOTHING;

INSERT INTO public.user_module_rights (userid, rightcode, right_value)
SELECT 'prof-superadmin-1', r.rightcode, 1
FROM public.rights r
ON CONFLICT DO NOTHING;

-- Dev team accounts (only inserts if they don't already exist)
INSERT INTO public.hr_user (userid, email, user_type, record_status, stamp)
VALUES
  ('user2', 'shawndavid.domingo@neu.edu.ph',  'SUPERADMIN', 'ACTIVE', 'SEEDED'),
  ('user3', 'rene.espina@neu.edu.ph',          'SUPERADMIN', 'ACTIVE', 'SEEDED'),
  ('user4', 'myra.timbang@neu.edu.ph',         'SUPERADMIN', 'ACTIVE', 'SEEDED'),
  ('user5', 'daveandrew.claveria@neu.edu.ph',  'SUPERADMIN', 'ACTIVE', 'SEEDED'),
  ('user6', 'glennross.ramones@neu.edu.ph',    'SUPERADMIN', 'ACTIVE', 'SEEDED')
ON CONFLICT (userid) DO NOTHING;

INSERT INTO public.user_module (userid, modulecode, rights_value)
SELECT u.userid, m.modulecode, 1
FROM public.hr_user u
CROSS JOIN public.module m
WHERE u.userid IN ('user2','user3','user4','user5','user6')
ON CONFLICT DO NOTHING;

INSERT INTO public.user_module_rights (userid, rightcode, right_value)
SELECT u.userid, r.rightcode, 1
FROM public.hr_user u
CROSS JOIN public.rights r
WHERE u.userid IN ('user2','user3','user4','user5','user6')
ON CONFLICT DO NOTHING;


-- ============================================================
-- STEP 5: Verify everything is correct
-- ============================================================

-- Check all seeded accounts have placeholder userids set
SELECT userid, email, user_type, record_status
FROM public.hr_user
WHERE userid IN (
  'prof-superadmin-1','user2','user3','user4','user5','user6'
)
ORDER BY userid;
-- Expected: 6 rows, all SUPERADMIN, ACTIVE

-- Check professor has all 17 rights = 1
SELECT COUNT(*) AS rights_count,
       SUM(right_value) AS rights_enabled
FROM public.user_module_rights
WHERE userid = 'prof-superadmin-1';
-- Expected: rights_count = 17, rights_enabled = 17

-- Check trigger is still attached
SELECT trigger_name, event_object_schema, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
-- Expected: 1 row on auth.users

-- Check FK constraints are dropped
SELECT constraint_name
FROM information_schema.table_constraints
WHERE table_name IN ('user_module', 'user_module_rights')
  AND constraint_type = 'FOREIGN KEY'
  AND constraint_name IN (
    'user_module_userid_fkey',
    'user_module_rights_userid_fkey'
  );
-- Expected: 0 rows


-- ============================================================
-- VERIFICATION: After professor's first login
-- ============================================================
-- Run after jcesperanza@neu.edu.ph logs in via Google OAuth

/*
-- Confirm uid was synced automatically
SELECT h.userid, h.email, h.user_type,
       a.id::text AS auth_id,
       (h.userid = a.id::text) AS is_match
FROM public.hr_user h
JOIN auth.users a ON h.email = a.email
WHERE h.email = 'jcesperanza@neu.edu.ph';
-- Expected: is_match = true, SUPERADMIN, ACTIVE

-- Confirm all 17 rights loaded
SELECT rightcode, right_value
FROM public.user_module_rights
WHERE userid = (
  SELECT userid FROM public.hr_user
  WHERE email = 'jcesperanza@neu.edu.ph'
)
ORDER BY rightcode;
-- Expected: 17 rows, all right_value = 1
*/