// src/lib/employeeService.js
// Sprint 2 — M1 PR-01: feat/employee-api
// ─────────────────────────────────────────────────────────────────────────────
// Schema confirmed from 001_initial_schema.sql:
//   Table : employee
//   PK    : empno (VARCHAR 5)
//   Cols  : lastname, firstname, gender, birthdate, hiredate, sepdate (Postgres
//           lowercases "sepDate"), record_status, stamp
//
// Auth pattern confirmed from App.jsx:
//   - hr_user is queried by session.user.email (not userId)
//   - stamp uses email as the actor identifier
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from './supabaseClient';

// ── Stamp helper ──────────────────────────────────────────────────────────────
// "ACTION | email | ISO-timestamp"  — trimmed to 60 chars (column max)
function makeStamp(action, userEmail) {
  return `${action} | ${userEmail} | ${new Date().toISOString()}`.slice(0, 60);
}

// ─────────────────────────────────────────────────────────────────────────────
// READ
// getEmployees(userType)
//   USER              → ACTIVE rows only   (mirrors RLS policy added by M3)
//   ADMIN/SUPERADMIN  → all rows (ACTIVE + INACTIVE)
// ─────────────────────────────────────────────────────────────────────────────
export async function getEmployees(userType) {
  let query = supabase
    .from('employee')
    .select(
      'empno, lastname, firstname, gender, birthdate, hiredate, sepdate, record_status, stamp'
    )
    .order('empno');

  if (userType === 'USER') {
    query = query.eq('record_status', 'ACTIVE');
  }

  const { data, error } = await query;
  if (error) console.error('[getEmployees]', error.message);
  return { data: data ?? [], error };
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE
// addEmployee(employeeData, userEmail)
//   Gated by EMP_ADD right — only call when rights.EMP_ADD === 1
//
//   employeeData shape:
//   {
//     empno:     string        — '00032' (5-char zero-padded)
//     lastname:  string
//     firstname: string
//     gender:    'M' | 'F'
//     birthdate: string        — 'YYYY-MM-DD'
//     hiredate:  string        — 'YYYY-MM-DD'
//     sepdate:   string | null — null if still employed
//   }
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
//   Gated by EMP_EDIT right — only call when rights.EMP_EDIT === 1
//   NEVER touches record_status — use softDeleteEmployee/recoverEmployee for that
//
//   updates shape (only changed fields needed):
//   {
//     lastname?:  string
//     firstname?: string
//     gender?:    'M' | 'F'
//     birthdate?: string
//     hiredate?:  string
//     sepdate?:   string | null
//   }
// ─────────────────────────────────────────────────────────────────────────────
export async function updateEmployee(empno, updates, userEmail) {
  const stamp = makeStamp('UPDATED', userEmail);

  // Defensive: strip record_status if accidentally passed — never edit via this fn
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
// SOFT DELETE   ← DB trigger cascades to jobHistory automatically
// softDeleteEmployee(empno, userEmail)
//   Gated by EMP_DEL right — SUPERADMIN only per rights matrix
//
//   Sets employee record_status = 'INACTIVE'
//   DB trigger on_employee_status_change → cascade_employee_soft_delete()
//   automatically sets all jobHistory rows for this empno to INACTIVE.
//   No manual jobHistory update needed.
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
// RECOVER   ← DB trigger cascade-restores jobHistory automatically
// recoverEmployee(empno, userEmail)
//   Accessible to ADMIN and SUPERADMIN only (RLS + /deleted-items route guard)
//
//   Sets employee record_status = 'ACTIVE'
//   DB trigger on_employee_status_change → cascade_employee_soft_delete()
//   automatically restores all jobHistory rows for this empno back to ACTIVE.
//   No manual jobHistory update needed.
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