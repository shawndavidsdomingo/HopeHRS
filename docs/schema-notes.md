# HopeHRS Database Schema Notes

## HR Tables

### employee
- PK: empno (VARCHAR 5)
- record_status: ACTIVE / INACTIVE (soft delete)
- stamp: audit trail string, hidden from USER

### jobHistory
- Composite PK: (empNo, jobCode, effDate)
- FK: empNo → employee, jobCode → job, deptCode → department
- record_status: ACTIVE / INACTIVE (soft delete)
- stamp: audit trail string, hidden from USER

### job
- PK: jobCode (VARCHAR 4)
- record_status: ACTIVE / INACTIVE (soft delete)
- stamp: audit trail string, hidden from USER

### department
- PK: deptCode (VARCHAR 3)
- record_status: ACTIVE / INACTIVE (soft delete)
- stamp: audit trail string, hidden from USER

## Rights Tables

### module
- PK: moduleCode (VARCHAR 10)
- 5 modules: Emp_Mod, JH_Mod, Job_Mod, Dept_Mod, Adm_Mod

### rights
- PK: rightCode (VARCHAR 10)
- FK: moduleCode → module
- 17 rights seeded across 5 modules

### hr_user
- PK: userId (VARCHAR 10)
- user_type: SUPERADMIN / ADMIN / USER
- record_status: ACTIVE / INACTIVE

### user_module
- Composite PK: (userId, moduleCode)
- FK: userId → hr_user, moduleCode → module
- rights_value: 0 or 1

### user_module_rights
- Composite PK: (userId, rightCode)
- FK: userId → hr_user, rightCode → rights
- right_value: 0 or 1

## Key Rules
- No hard deletes — all removals set record_status = 'INACTIVE'
- INACTIVE records invisible to USER in all views
- Only ADMIN and SUPERADMIN can see and recover INACTIVE records
- Stamp columns hidden from USER accounts
- SUPERADMIN cannot be modified by any other user