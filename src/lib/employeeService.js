// src/lib/employeeService.js
// Sprint 2 — M1 PR-01: feat/employee-api
// Sprint 3 fix: getEmployees now queries employee_current_job view so
//   the Current Job (jobdesc) column populates correctly in EmployeeListPage.
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from './supabaseClient';

// ── Stamp helper ──────────────────────────────────────────────────────────────
function makeStamp(action, userEmail) {
  return `${action} | ${userEmail} | ${new Date().toISOString()}`.slice(0, 60);
}

// ─────────────────────────────────────────────────────────────────────────────
// READ
// getEmployees(userType)
//
// FIX: Previously queried the employee table directly which has no jobdesc
// column — this caused the Current Job column to always show blank.
//
// Now:
//   USER              → employee_current_job view (ACTIVE employees + jobdesc)
//   ADMIN/SUPERADMIN  → employee table joined with employee_current_job so
//                       INACTIVE employees still appear, with jobdesc resolved
//                       where available
// ─────────────────────────────────────────────────────────────────────────────
export async function getEmployees(userType) {
  if (userType === 'USER') {
    // View returns ACTIVE employees only with resolved jobdesc and deptname
    const { data, error } = await supabase
      .from('employee_current_job')
      .select('empno, lastname, firstname, gender, hiredate, sepdate, emp_status, emp_stamp, jobdesc, deptname')
      .order('empno');

    if (error) console.error('[getEmployees USER]', error.message);

    // Remap view column names to match what Employees.jsx expects
    const mapped = (data ?? []).map(row => ({
      ...row,
      record_status: row.emp_status,
      stamp: row.emp_stamp,
    }));

    return { data: mapped, error };
  }

  // ADMIN / SUPERADMIN — query employee table for all rows including INACTIVE
  // Left join with employee_current_job to resolve jobdesc where available
  const { data, error } = await supabase
    .from('employee')
    .select('empno, lastname, firstname, gender, birthdate, hiredate, sepdate, record_status, stamp')
    .order('empno');

  if (error) console.error('[getEmployees ADMIN]', error.message);

  if (!data) return { data: [], error };

  // For each employee, fetch their current job from the view
  // We do a single view query and merge by empno to avoid N+1
  const { data: viewData } = await supabase
    .from('employee_current_job')
    .select('empno, jobdesc, deptname');

  const jobMap = {};
  (viewData ?? []).forEach(row => { jobMap[row.empno] = row; });

  const merged = data.map(emp => ({
    ...emp,
    jobdesc:  jobMap[emp.empno]?.jobdesc  ?? null,
    deptname: jobMap[emp.empno]?.deptname ?? null,
  }));

  return { data: merged, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE
// addEmployee(employeeData, userEmail)
// ─────────────────────────────────────────────────────────────────────────────
export async function addEmployee(employeeData, userEmail) {
  const stamp = makeStamp('ADDED', userEmail);

  const { data, error } = await supabase
    .from('employee')
    .insert([{
      empno:         employeeData.empno,
      lastname:      employeeData.lastname,
      firstname:     employeeData.firstname,
      gender:        employeeData.gender,
      birthdate:     employeeData.birthdate,
      hiredate:      employeeData.hiredate,
      sepdate:       employeeData.sepdate ?? null,
      record_status: 'ACTIVE',
      stamp,
    }])
    .select()
    .single();

  if (error) console.error('[addEmployee]', error.message);
  return { data, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE
// updateEmployee(empno, updates, userEmail)
// ─────────────────────────────────────────────────────────────────────────────
export async function updateEmployee(empno, updates, userEmail) {
  const stamp = makeStamp('UPDATED', userEmail);
  const { record_status: _ignored, ...safeUpdates } = updates;

  const { data, error } = await supabase
    .from('employee')
    .update({ ...safeUpdates, stamp })
    .eq('empno', empno)
    .select()
    .single();

  if (error) console.error('[updateEmployee]', error.message);
  return { data, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// SOFT DELETE
// softDeleteEmployee(empno, userEmail)
//   DB trigger cascades to jobHistory automatically
// ─────────────────────────────────────────────────────────────────────────────
export async function softDeleteEmployee(empno, userEmail) {
  const stamp = makeStamp('DEACTIVATED', userEmail);

  const { error } = await supabase
    .from('employee')
    .update({ record_status: 'INACTIVE', stamp })
    .eq('empno', empno);

  if (error) console.error('[softDeleteEmployee]', error.message);
  return { error };
}

// ─────────────────────────────────────────────────────────────────────────────
// RECOVER
// recoverEmployee(empno, userEmail)
//   DB trigger cascade-restores jobHistory automatically
// ─────────────────────────────────────────────────────────────────────────────
export async function recoverEmployee(empno, userEmail) {
  const stamp = makeStamp('REACTIVATED', userEmail);

  const { error } = await supabase
    .from('employee')
    .update({ record_status: 'ACTIVE', stamp })
    .eq('empno', empno);

  if (error) console.error('[recoverEmployee]', error.message);
  return { error };
}