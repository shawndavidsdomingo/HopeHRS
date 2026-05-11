// src/lib/departmentService.js
// Sprint 2 — M1 PR-03: feat/job-dept-api  (Department half)
// ─────────────────────────────────────────────────────────────────────────────
// Schema confirmed from 001_initial_schema.sql:
//   Table : department
//   PK    : deptcode (Postgres lowercases "deptCode")
//   Cols  : deptcode, deptname (lowercased "deptName"), record_status, stamp
//
//   Note: App.jsx Sprint 1 queried columns deptno / deptname / location —
//   'deptno' and 'location' do NOT exist in schema. Real PK is deptcode.
//   Sprint 2 uses the correct column names.
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from './supabaseClient';

// ── Stamp helper ──────────────────────────────────────────────────────────────
function makeStamp(action, userEmail) {
  return `${action} | ${userEmail} | ${new Date().toISOString()}`.slice(0, 60);
}

// ─────────────────────────────────────────────────────────────────────────────
// READ
// getDepts(userType)
//   USER              → ACTIVE rows only
//   ADMIN/SUPERADMIN  → all rows
// ─────────────────────────────────────────────────────────────────────────────
export async function getDepts(userType) {
  let query = supabase
    .from('department')
    .select('deptcode, deptname, record_status, stamp')
    .order('deptcode');

  if (userType === 'USER') {
    query = query.eq('record_status', 'ACTIVE');
  }

  const { data, error } = await query;
  if (error) console.error('[getDepts]', error.message);
  return { data: data ?? [], error };
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE
// addDept(deptData, userEmail)
//   Gated by DEPT_ADD right — only call when rights.DEPT_ADD === 1
//
//   deptData shape:
//   { deptcode: string, deptname: string }
// ─────────────────────────────────────────────────────────────────────────────
export async function addDept(deptData, userEmail) {
  const stamp = makeStamp('ADDED', userEmail);

  const { data, error } = await supabase
    .from('department')
    .insert([{
      deptcode:      deptData.deptcode,
      deptname:      deptData.deptname,
      record_status: 'ACTIVE',
      stamp,
    }])
    .select()
    .single();

  if (error) console.error('[addDept]', error.message);
  return { data, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE
// updateDept(deptcode, updates, userEmail)
//   Gated by DEPT_EDIT right — only call when rights.DEPT_EDIT === 1
//   Only deptname is editable; deptcode is the PK and cannot change.
// ─────────────────────────────────────────────────────────────────────────────
export async function updateDept(deptcode, updates, userEmail) {
  const stamp = makeStamp('UPDATED', userEmail);
  const { record_status: _ignored, deptcode: _pk, ...safeUpdates } = updates;

  const { data, error } = await supabase
    .from('department')
    .update({ ...safeUpdates, stamp })
    .eq('deptcode', deptcode)
    .select()
    .single();

  if (error) console.error('[updateDept]', error.message);
  return { data, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// SOFT DELETE
// softDeleteDept(deptcode, userEmail)
//   Gated by DEPT_DEL right — SUPERADMIN only per rights matrix
// ─────────────────────────────────────────────────────────────────────────────
export async function softDeleteDept(deptcode, userEmail) {
  const stamp = makeStamp('DEACTIVATED', userEmail);

  const { error } = await supabase
    .from('department')
    .update({ record_status: 'INACTIVE', stamp })
    .eq('deptcode', deptcode);

  if (error) console.error('[softDeleteDept]', error.message);
  return { error };
}

// ─────────────────────────────────────────────────────────────────────────────
// RECOVER
// recoverDept(deptcode, userEmail)
//   Accessible to ADMIN and SUPERADMIN only
// ─────────────────────────────────────────────────────────────────────────────
export async function recoverDept(deptcode, userEmail) {
  const stamp = makeStamp('REACTIVATED', userEmail);

  const { error } = await supabase
    .from('department')
    .update({ record_status: 'ACTIVE', stamp })
    .eq('deptcode', deptcode);

  if (error) console.error('[recoverDept]', error.message);
  return { error };
}