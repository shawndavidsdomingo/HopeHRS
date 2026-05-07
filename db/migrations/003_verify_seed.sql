-- ============================================================
-- 003_verify_seed.sql
-- Verification queries confirming row counts and FK integrity
-- Run in Supabase SQL Editor to verify seed data is correct
-- ============================================================

-- ============================================================
-- SECTION 1: ROW COUNTS
-- ============================================================

-- HR Tables
SELECT 'employee'   AS table_name, COUNT(*) AS row_count FROM employee
UNION ALL
SELECT 'jobHistory' AS table_name, COUNT(*) AS row_count FROM jobHistory
UNION ALL
SELECT 'job'        AS table_name, COUNT(*) AS row_count FROM job
UNION ALL
SELECT 'department' AS table_name, COUNT(*) AS row_count FROM department;

-- Expected results:
-- employee   → 32 rows
-- jobHistory → 54 rows
-- job        → 14 rows
-- department →  8 rows

-- Rights Tables
SELECT 'module'             AS table_name, COUNT(*) AS row_count FROM module
UNION ALL
SELECT 'rights'             AS table_name, COUNT(*) AS row_count FROM rights
UNION ALL
SELECT 'hr_user'            AS table_name, COUNT(*) AS row_count FROM hr_user
UNION ALL
SELECT 'user_module'        AS table_name, COUNT(*) AS row_count FROM user_module
UNION ALL
SELECT 'user_module_rights' AS table_name, COUNT(*) AS row_count FROM user_module_rights;

-- Expected results:
-- module             →  5 rows
-- rights             → 17 rows
-- hr_user            →  6 rows
-- user_module        → 30 rows (6 users × 5 modules)
-- user_module_rights → 102 rows (6 users × 17 rights)

-- ============================================================
-- SECTION 2: record_status CHECKS
-- ============================================================

-- Verify all HR records are ACTIVE
SELECT 'employee'   AS table_name, record_status, COUNT(*) FROM employee   GROUP BY record_status
UNION ALL
SELECT 'jobHistory' AS table_name, record_status, COUNT(*) FROM jobHistory GROUP BY record_status
UNION ALL
SELECT 'job'        AS table_name, record_status, COUNT(*) FROM job         GROUP BY record_status
UNION ALL
SELECT 'department' AS table_name, record_status, COUNT(*) FROM department  GROUP BY record_status;

-- Verify all SUPERADMIN users are ACTIVE
SELECT userId, email, user_type, record_status
FROM hr_user
WHERE user_type = 'SUPERADMIN';

-- ============================================================
-- SECTION 3: FK INTEGRITY CHECKS
-- ============================================================

-- jobHistory.empNo → employee.empno (orphan check)
SELECT jh.empNo
FROM jobHistory jh
LEFT JOIN employee e ON jh.empNo = e.empno
WHERE e.empno IS NULL;
-- Expected: 0 rows (no orphans)

-- jobHistory.jobCode → job.jobCode (orphan check)
SELECT jh.jobCode
FROM jobHistory jh
LEFT JOIN job j ON jh.jobCode = j.jobCode
WHERE j.jobCode IS NULL;
-- Expected: 0 rows (no orphans)

-- jobHistory.deptCode → department.deptCode (orphan check)
SELECT jh.deptCode
FROM jobHistory jh
LEFT JOIN department d ON jh.deptCode = d.deptCode
WHERE d.deptCode IS NULL;
-- Expected: 0 rows (no orphans)

-- rights.moduleCode → module.moduleCode (orphan check)
SELECT r.rightCode, r.moduleCode
FROM rights r
LEFT JOIN module m ON r.moduleCode = m.moduleCode
WHERE m.moduleCode IS NULL;
-- Expected: 0 rows (no orphans)

-- user_module.userId → hr_user.userId (orphan check)
SELECT um.userId
FROM user_module um
LEFT JOIN hr_user u ON um.userId = u.userId
WHERE u.userId IS NULL;
-- Expected: 0 rows (no orphans)

-- user_module_rights.userId → hr_user.userId (orphan check)
SELECT umr.userId
FROM user_module_rights umr
LEFT JOIN hr_user u ON umr.userId = u.userId
WHERE u.userId IS NULL;
-- Expected: 0 rows (no orphans)

-- user_module_rights.rightCode → rights.rightCode (orphan check)
SELECT umr.rightCode
FROM user_module_rights umr
LEFT JOIN rights r ON umr.rightCode = r.rightCode
WHERE r.rightCode IS NULL;
-- Expected: 0 rows (no orphans)

-- ============================================================
-- SECTION 4: SUPERADMIN RIGHTS CHECK
-- ============================================================

-- Verify all 6 SUPERADMIN users have all 17 rights = 1
SELECT u.email, r.rightCode, umr.right_value
FROM hr_user u
JOIN user_module_rights umr ON u.userId = umr.userId
JOIN rights r ON umr.rightCode = r.rightCode
WHERE u.user_type = 'SUPERADMIN'
ORDER BY u.email, r.rightCode;

-- Expected: 102 rows, all right_value = 1

-- Verify no SUPERADMIN is missing any right
SELECT u.email, COUNT(*) AS rights_count
FROM hr_user u
JOIN user_module_rights umr ON u.userId = umr.userId
WHERE u.user_type = 'SUPERADMIN'
GROUP BY u.email;

-- Expected: 6 rows, each with rights_count = 17