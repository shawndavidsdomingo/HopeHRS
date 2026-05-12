-- ============================================================
-- db/migrations/009_trigger_sync_seeded_uid.sql
-- Hotfix: fix/sync-seeded-uid-on-login
-- ============================================================
-- Problem:
--   Seeded SUPERADMIN accounts were inserted with placeholder
--   userids ('user1' through 'user6'). When these accounts log
--   in via Google OAuth for the first time, auth.uid() returns
--   their real Supabase Auth UUID which does not match the
--   placeholder — causing all RLS policies to fail silently
--   and returning no data to the logged-in user.
--
-- Solution:
--   A trigger on auth.users INSERT that fires whenever any user
--   logs in via Google OAuth for the first time. If their email
--   already exists in hr_user with a non-matching userid, the
--   trigger updates hr_user + user_module + user_module_rights
--   to use the real Auth UUID.
--
-- Affected accounts:

-- Safe to re-run: DROP TRIGGER IF EXISTS + CREATE OR REPLACE
-- Run in Supabase SQL Editor before Sprint 3 begins.
-- ============================================================


-- ============================================================
-- STEP 1: Drop existing trigger and function (safe re-run)
-- ============================================================

DROP TRIGGER IF EXISTS on_auth_user_created_sync_uid ON auth.users;
DROP FUNCTION IF EXISTS sync_seeded_user_uid();


-- ============================================================
-- STEP 2: Create the sync function
-- ============================================================
-- Fires AFTER INSERT on auth.users (i.e. first Google OAuth login).
-- Checks if the new user's email exists in hr_user with a different
-- userid. If so, updates all 3 tables atomically.
--
-- SECURITY DEFINER: runs with the privileges of the function owner
-- (postgres) so it can update hr_user even when called from the
-- auth schema context.

CREATE OR REPLACE FUNCTION sync_seeded_user_uid()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_uid TEXT;
BEGIN
  -- Find the current userid for this email in hr_user
  SELECT userid INTO old_uid
  FROM hr_user
  WHERE email = NEW.email;

  -- Only sync if:
  --   1. The email exists in hr_user (it's a seeded or provisioned account)
  --   2. The stored userid does NOT match the new Auth UUID
  IF old_uid IS NOT NULL AND old_uid != NEW.id::text THEN

    -- Update child tables FIRST (FK references hr_user.userid)
    UPDATE user_module_rights
    SET userid = NEW.id::text
    WHERE userid = old_uid;

    UPDATE user_module
    SET userid = NEW.id::text
    WHERE userid = old_uid;

    -- Update parent table LAST
    UPDATE hr_user
    SET userid = NEW.id::text
    WHERE userid = old_uid;

  END IF;

  RETURN NEW;
END;
$$;


-- ============================================================
-- STEP 3: Attach trigger to auth.users
-- ============================================================
-- Fires AFTER INSERT — meaning after Google OAuth creates the
-- auth.users row for the first login. Subsequent logins do not
-- insert a new auth.users row, so the trigger only fires once
-- per account — exactly when we need it.

CREATE TRIGGER on_auth_user_created_sync_uid
  AFTER INSERT
  ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_seeded_user_uid();


-- ============================================================
-- STEP 4: Confirm trigger is attached
-- ============================================================

SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_orientation
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created_sync_uid';

-- Expected:
-- trigger_name                   | on_auth_user_created_sync_uid
-- event_manipulation             | INSERT
-- event_object_table             | users
-- action_timing                  | AFTER
-- action_orientation             | ROW


-- ============================================================
-- STEP 5: Manual sync for accounts already in auth.users
-- ============================================================
-- If any seeded account has ALREADY logged in before this trigger
-- was deployed, their auth.users row already exists — the trigger
-- will NOT fire again for them. Run this manual sync for those cases.
--
-- Check first:
/*
SELECT h.userid, h.email, h.user_type,
       a.id::text AS auth_id,
       (h.userid = a.id::text) AS is_match
FROM hr_user h
LEFT JOIN auth.users a ON h.email = a.email
ORDER BY is_match;
*/
--
-- If any row shows is_match = false, run the manual sync below:
/*
BEGIN;

ALTER TABLE user_module        DROP CONSTRAINT IF EXISTS user_module_userid_fkey;
ALTER TABLE user_module_rights DROP CONSTRAINT IF EXISTS user_module_rights_userid_fkey;

CREATE TEMP TABLE uid_map AS
SELECT h.userid AS old_id, a.id::text AS new_id
FROM hr_user h
JOIN auth.users a ON h.email = a.email
WHERE h.userid != a.id::text;

UPDATE user_module_rights
SET userid = m.new_id
FROM uid_map m
WHERE user_module_rights.userid = m.old_id;

UPDATE user_module
SET userid = m.new_id
FROM uid_map m
WHERE user_module.userid = m.old_id;

UPDATE hr_user
SET userid = m.new_id
FROM uid_map m
WHERE hr_user.userid = m.old_id;

ALTER TABLE user_module
  ADD CONSTRAINT user_module_userid_fkey
  FOREIGN KEY (userid) REFERENCES hr_user(userid);

ALTER TABLE user_module_rights
  ADD CONSTRAINT user_module_rights_userid_fkey
  FOREIGN KEY (userid) REFERENCES hr_user(userid);

COMMIT;
*/


-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- ── TEST 1: Trigger exists and is attached ────────────────────
/*
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created_sync_uid';
-- Expected: 1 row
*/

-- ── TEST 2: After professor logs in, confirm uid is synced ────
-- Run this AFTER -- logs in via Google OAuth
/*
SELECT
  h.userid,
  h.email,
  h.user_type,
  h.record_status,
  a.id::text   AS auth_id,
  (h.userid = a.id::text) AS is_match
FROM hr_user h
JOIN auth.users a ON h.email = a.email
WHERE h.email = '--';
-- Expected: is_match = true, user_type = SUPERADMIN, record_status = ACTIVE
*/

-- ── TEST 3: All 17 rights loaded for professor ────────────────
-- Run after login and uid sync
/*
SELECT rightcode, right_value
FROM user_module_rights
WHERE userid = (
  SELECT userid FROM hr_user WHERE email = '--'
)
ORDER BY rightcode;
-- Expected: 17 rows, all right_value = 1
*/

-- ── TEST 4: Full team uid check ───────────────────────────────
/*
SELECT
  h.userid,
  h.email,
  h.user_type,
  a.id::text   AS auth_id,
  (h.userid = a.id::text) AS is_match
FROM hr_user h
LEFT JOIN auth.users a ON h.email = a.email
ORDER BY is_match, h.user_type;
-- Expected: all registered accounts show is_match = true
-- Accounts with NULL auth_id have not logged in yet — that is fine
*/