-- ============================================================
-- db/migrations/013_fix_display_ids_and_rls_select.sql
-- fix/admin-display-id-rls-login
-- ============================================================
-- Two fixes:
--
-- FIX 1: hr_user SELECT policy was blocking regular users from
--   reading their own row — breaking checkLoginGuard and
--   UserRightsContext for all non-ADMIN/SUPERADMIN accounts.
--   Updated to allow any authenticated user to read their own
--   row while ADMIN/SUPERADMIN can still read all rows.
--
-- FIX 2: display_id values reassigned to match the team's
--   defined order (user1-user6 SUPERADMIN, user7-user11 ADMIN,
--   user12-user16 USER).
-- ============================================================


-- ============================================================
-- FIX 1: hr_user SELECT policy
-- ============================================================

DROP POLICY IF EXISTS hr_user_select ON hr_user;

-- Allow any authenticated user to read their own row
-- (required for checkLoginGuard + UserRightsContext on login)
-- AND allow ADMIN/SUPERADMIN to read all rows
-- (required for getUsers() in Admin module)
CREATE POLICY hr_user_select ON hr_user
  FOR SELECT
  TO authenticated
  USING (
    userid = auth.uid()::text
    OR
    is_admin_or_above()
  );


-- ============================================================
-- FIX 2: display_id assignments
-- ============================================================

UPDATE hr_user SET display_id = NULL;

-- SUPERADMIN
UPDATE hr_user SET display_id = 'user1'  WHERE email = 'jcesperanza@neu.edu.ph';
UPDATE hr_user SET display_id = 'user2'  WHERE email = 'shawndavid.domingo@neu.edu.ph';
UPDATE hr_user SET display_id = 'user3'  WHERE email = 'rene.espina@neu.edu.ph';
UPDATE hr_user SET display_id = 'user4'  WHERE email = 'myra.timbang@neu.edu.ph';
UPDATE hr_user SET display_id = 'user5'  WHERE email = 'daveandrew.claveria@neu.edu.ph';
UPDATE hr_user SET display_id = 'user6'  WHERE email = 'glennross.ramones@neu.edu.ph';

-- ADMIN
UPDATE hr_user SET display_id = 'user7'  WHERE email = 'shawndavidsobremontedomingo@gmail.com';
UPDATE hr_user SET display_id = 'user8'  WHERE email = 'reneespina0929@gmail.com';
UPDATE hr_user SET display_id = 'user9'  WHERE email = 'myratimbang10@gmail.com';
UPDATE hr_user SET display_id = 'user10' WHERE email = 'daveandrewclaveria15@gmail.com';
UPDATE hr_user SET display_id = 'user11' WHERE email = 'ramonesglenn67@gmail.com';

-- USER
UPDATE hr_user SET display_id = 'user12' WHERE email = 'kenji4dwin@gmail.com';
UPDATE hr_user SET display_id = 'user13' WHERE email = 'reneespina1199@gmail.com';
UPDATE hr_user SET display_id = 'user14' WHERE email = 'memoireee.29@gmail.com';
UPDATE hr_user SET display_id = 'user15' WHERE email = 'hakdogen692@gmail.com';
UPDATE hr_user SET display_id = 'user16' WHERE email = 'ramonesglenn68@gmail.com';


-- ============================================================
-- VERIFY
-- ============================================================

-- Confirm SELECT policy updated
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'hr_user' AND policyname = 'hr_user_select';
-- Expected: qual includes "userid = auth.uid()::text"

-- Confirm display_ids assigned correctly
SELECT display_id, email, user_type, record_status
FROM hr_user
ORDER BY CAST(SUBSTRING(display_id FROM 5) AS INTEGER);
-- Expected: user1-user6 SUPERADMIN, user7-user11 ADMIN,
--           user12-user16 USER