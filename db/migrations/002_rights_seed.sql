-- ============================================================
-- 002_rights_seed.sql
-- Create Rights Tables + Seed 5 modules + 17 rights + SUPERADMIN
-- ============================================================

DROP TABLE IF EXISTS user_module_rights CASCADE;
DROP TABLE IF EXISTS user_module CASCADE;
DROP TABLE IF EXISTS rights CASCADE;
DROP TABLE IF EXISTS module CASCADE;
DROP TABLE IF EXISTS hr_user CASCADE;

-- CREATE TABLES
CREATE TABLE module (
  moduleCode    VARCHAR(10) PRIMARY KEY,
  moduleDesc    VARCHAR(30),
  record_status VARCHAR(10) DEFAULT 'ACTIVE',
  stamp         VARCHAR(60)
);

CREATE TABLE rights (
  rightCode     VARCHAR(10) PRIMARY KEY,
  rightDesc     VARCHAR(40),
  right_value   INT DEFAULT 1,
  moduleCode    VARCHAR(10) REFERENCES module(moduleCode),
  record_status VARCHAR(10) DEFAULT 'ACTIVE',
  stamp         VARCHAR(60)
);

CREATE TABLE hr_user (
  userId        VARCHAR(10) PRIMARY KEY,
  email         VARCHAR(50),
  user_type     VARCHAR(15),
  record_status VARCHAR(10) DEFAULT 'ACTIVE',
  stamp         VARCHAR(60)
);

CREATE TABLE user_module (
  userId        VARCHAR(10) REFERENCES hr_user(userId),
  moduleCode    VARCHAR(10) REFERENCES module(moduleCode),
  rights_value  INT DEFAULT 0,
  PRIMARY KEY (userId, moduleCode)
);

CREATE TABLE user_module_rights (
  userId        VARCHAR(10) REFERENCES hr_user(userId),
  rightCode     VARCHAR(10) REFERENCES rights(rightCode),
  right_value   INT DEFAULT 0,
  PRIMARY KEY (userId, rightCode)
);

-- MODULES
INSERT INTO module VALUES ('Emp_Mod',  'Employee Module',    'ACTIVE', 'SEEDED');
INSERT INTO module VALUES ('JH_Mod',   'Job History Module', 'ACTIVE', 'SEEDED');
INSERT INTO module VALUES ('Job_Mod',  'Job Module',         'ACTIVE', 'SEEDED');
INSERT INTO module VALUES ('Dept_Mod', 'Department Module',  'ACTIVE', 'SEEDED');
INSERT INTO module VALUES ('Adm_Mod',  'Admin Module',       'ACTIVE', 'SEEDED');

-- RIGHTS
INSERT INTO rights VALUES ('EMP_VIEW',  'View Employees',          1, 'Emp_Mod',  'ACTIVE', 'SEEDED');
INSERT INTO rights VALUES ('EMP_ADD',   'Add Employee',            1, 'Emp_Mod',  'ACTIVE', 'SEEDED');
INSERT INTO rights VALUES ('EMP_EDIT',  'Edit Employee',           1, 'Emp_Mod',  'ACTIVE', 'SEEDED');
INSERT INTO rights VALUES ('EMP_DEL',   'Soft Delete Employee',    1, 'Emp_Mod',  'ACTIVE', 'SEEDED');
INSERT INTO rights VALUES ('JH_VIEW',   'View Job History',        1, 'JH_Mod',   'ACTIVE', 'SEEDED');
INSERT INTO rights VALUES ('JH_ADD',    'Add Job History',         1, 'JH_Mod',   'ACTIVE', 'SEEDED');
INSERT INTO rights VALUES ('JH_EDIT',   'Edit Job History',        1, 'JH_Mod',   'ACTIVE', 'SEEDED');
INSERT INTO rights VALUES ('JH_DEL',    'Soft Delete Job History', 1, 'JH_Mod',   'ACTIVE', 'SEEDED');
INSERT INTO rights VALUES ('JOB_VIEW',  'View Jobs',               1, 'Job_Mod',  'ACTIVE', 'SEEDED');
INSERT INTO rights VALUES ('JOB_ADD',   'Add Job',                 1, 'Job_Mod',  'ACTIVE', 'SEEDED');
INSERT INTO rights VALUES ('JOB_EDIT',  'Edit Job',                1, 'Job_Mod',  'ACTIVE', 'SEEDED');
INSERT INTO rights VALUES ('JOB_DEL',   'Soft Delete Job',         1, 'Job_Mod',  'ACTIVE', 'SEEDED');
INSERT INTO rights VALUES ('DEPT_VIEW', 'View Departments',        1, 'Dept_Mod', 'ACTIVE', 'SEEDED');
INSERT INTO rights VALUES ('DEPT_ADD',  'Add Department',          1, 'Dept_Mod', 'ACTIVE', 'SEEDED');
INSERT INTO rights VALUES ('DEPT_EDIT', 'Edit Department',         1, 'Dept_Mod', 'ACTIVE', 'SEEDED');
INSERT INTO rights VALUES ('DEPT_DEL',  'Soft Delete Department',  1, 'Dept_Mod', 'ACTIVE', 'SEEDED');
INSERT INTO rights VALUES ('ADM_USER',  'Admin Activate User',     1, 'Adm_Mod',  'ACTIVE', 'SEEDED');

-- SUPERADMIN USERS
INSERT INTO hr_user (userId, email, user_type, record_status, stamp)
VALUES
  ('user1', 'jcesperanza@neu.edu.ph',         'SUPERADMIN', 'ACTIVE', 'SEEDED'),
  -- the following 5 users are for development testing only, to be removed in production
  ('user2', 'shawndavid.domingo@neu.edu.ph',  'SUPERADMIN', 'ACTIVE', 'SEEDED'),
  ('user3', 'rene.espina@neu.edu.ph',         'SUPERADMIN', 'ACTIVE', 'SEEDED'),
  ('user4', 'myra.timbang@neu.edu.ph',        'SUPERADMIN', 'ACTIVE', 'SEEDED'),
  ('user5', 'daveandrew.claveria@neu.edu.ph', 'SUPERADMIN', 'ACTIVE', 'SEEDED'),
  ('user6', 'glennross.ramones@neu.edu.ph',   'SUPERADMIN', 'ACTIVE', 'SEEDED');

-- user_module seed for all 6 SUPERADMIN users (all 5 modules)
INSERT INTO user_module (userId, moduleCode, rights_value)
SELECT u.userId, m.moduleCode, 1
FROM hr_user u
CROSS JOIN module m
WHERE u.user_type = 'SUPERADMIN';

-- user_module_rights for all 6 SUPERADMIN users (all 17 rights = 1)
INSERT INTO user_module_rights (userId, rightCode, right_value)
SELECT u.userId, r.rightCode, 1
FROM hr_user u
CROSS JOIN rights r
WHERE u.user_type = 'SUPERADMIN';


-- ============================================================
-- WEEK 3 (Sprint 2) — uncomment when working on M3 RLS + triggers
-- ============================================================

-- ============================================================
-- TRIGGER: sync_user_rights
-- Fires when user_type is updated on hr_user.
-- Automatically assigns correct rights based on new user_type.
-- ============================================================
/*
CREATE OR REPLACE FUNCTION sync_user_rights()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- When promoted to ADMIN
  IF NEW.user_type = 'ADMIN' AND OLD.user_type != 'ADMIN' THEN

    -- Clear existing rights
    DELETE FROM user_module_rights WHERE userId = NEW.userId;
    DELETE FROM user_module WHERE userId = NEW.userId;

    -- Insert ADMIN module mapping (all 5 modules)
    INSERT INTO user_module (userId, moduleCode, rights_value)
    SELECT NEW.userId, m.moduleCode, 1
    FROM module m;

    -- Insert ADMIN rights:
    -- VIEW + ADD + EDIT = 1 for all 4 HR modules
    -- DEL rights = 0
    -- ADM_USER = 1
    INSERT INTO user_module_rights (userId, rightCode, right_value)
    SELECT NEW.userId, r.rightCode,
      CASE
        WHEN r.rightCode IN ('EMP_DEL','JH_DEL','JOB_DEL','DEPT_DEL') THEN 0
        ELSE 1
      END
    FROM rights r;

  -- When demoted back to USER
  ELSIF NEW.user_type = 'USER' AND OLD.user_type != 'USER' THEN

    -- Clear existing rights
    DELETE FROM user_module_rights WHERE userId = NEW.userId;
    DELETE FROM user_module WHERE userId = NEW.userId;

    -- Insert USER module mapping (4 HR modules only, not Adm_Mod)
    INSERT INTO user_module (userId, moduleCode, rights_value)
    SELECT NEW.userId, m.moduleCode, 0
    FROM module m
    WHERE m.moduleCode != 'Adm_Mod';

    -- Insert USER rights: VIEW only = 1, everything else = 0
    INSERT INTO user_module_rights (userId, rightCode, right_value)
    SELECT NEW.userId, r.rightCode,
      CASE
        WHEN r.rightCode IN ('EMP_VIEW','JH_VIEW','JOB_VIEW','DEPT_VIEW') THEN 1
        ELSE 0
      END
    FROM rights r
    WHERE r.moduleCode != 'Adm_Mod';

  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_user_rights
AFTER UPDATE OF user_type ON hr_user
FOR EACH ROW
EXECUTE FUNCTION sync_user_rights();
*/