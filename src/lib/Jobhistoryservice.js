// src/lib/jobHistoryService.js
// Sprint 2 — M1 PR-02: feat/jobhistory-api
// ─────────────────────────────────────────────────────────────────────────────
// Schema confirmed from 001_initial_schema.sql:
//   Table : jobhistory  (Postgres lowercases "jobHistory")
//   PK    : (empno, jobcode, effdate)  — composite, all 3 columns lowercase
//   Cols  : empno, jobcode, effdate, salary, deptcode, record_status, stamp
//
// Composite PK note: because effDate is part of the PK, the same employee
// can have multiple rows for the same jobCode on different dates (promotions).
// Soft-delete sets record_status on the specific (empno, jobcode, effdate) row.
// Cascade from employee soft-delete is handled by DB trigger — NOT here.
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from './supabaseClient';

// ── Stamp helper ──────────────────────────────────────────────────────────────
function makeStamp(action, userEmail) {
  return `${action} | ${userEmail} | ${new Date().toISOString()}`.slice(0, 60);
}

// ─────────────────────────────────────────────────────────────────────────────
// READ
// getJobHistory(empno, userType)
//   Returns all job history rows for a given employee, sorted newest first.
//   USER              → ACTIVE rows only
//   ADMIN/SUPERADMIN  → all rows (ACTIVE + INACTIVE)
//
//   Use on EmployeeDetailPage to populate the JobHistoryPanel.
//   Join resolution (jobcode → jobDesc, deptcode → deptName) is done in the
//   M2 UI via the employee_current_job view for the list, or here via a
//   select with join syntax if needed — kept simple here, UI handles labels.
// ─────────────────────────────────────────────────────────────────────────────
export async function getJobHistory(empno, userType) {
  let query = supabase
    .from('jobhistory')
    .select('empno, jobcode, effdate, salary, deptcode, record_status, stamp')
    .eq('empno', empno)
    .order('effdate', { ascending: false });

  if (userType === 'USER') {
    query = query.eq('record_status', 'ACTIVE');
  }

  const { data, error } = await query;
  if (error) console.error('[getJobHistory]', error.message);
  return { data: data ?? [], error };
}

// ─────────────────────────────────────────────────────────────────────────────
// READ (all — for DeletedItems tab and admin views)
// getAllJobHistory(userType)
//   Returns job history across all employees.
//   USER              → ACTIVE rows only
//   ADMIN/SUPERADMIN  → all rows
// ─────────────────────────────────────────────────────────────────────────────
export async function getAllJobHistory(userType) {
  let query = supabase
    .from('jobhistory')
    .select('empno, jobcode, effdate, salary, deptcode, record_status, stamp')
    .order('empno')
    .order('effdate', { ascending: false });

  if (userType === 'USER') {
    query = query.eq('record_status', 'ACTIVE');
  }

  const { data, error } = await query;
  if (error) console.error('[getAllJobHistory]', error.message);
  return { data: data ?? [], error };
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE
// addJobHistory(jobHistoryData, userEmail)
//   Gated by JH_ADD right — only call when rights.JH_ADD === 1
//
//   jobHistoryData shape:
//   {
//     empno:    string   — FK → employee.empno
//     jobcode:  string   — FK → job.jobcode  (e.g. 'PR1', 'MGR')
//     effdate:  string   — 'YYYY-MM-DD'
//     salary:   number   — must be >= 0
//     deptcode: string   — FK → department.deptcode
//   }
// ─────────────────────────────────────────────────────────────────────────────
export async function addJobHistory(jobHistoryData, userEmail) {
  const stamp = makeStamp('ADDED', userEmail);

  const { data, error } = await supabase
    .from('jobhistory')
    .insert([{
      empno:         jobHistoryData.empno,
      jobcode:       jobHistoryData.jobcode,
      effdate:       jobHistoryData.effdate,
      salary:        jobHistoryData.salary,
      deptcode:      jobHistoryData.deptcode,
      record_status: 'ACTIVE',
      stamp,
    }])
    .select()
    .single();

  if (error) console.error('[addJobHistory]', error.message);
  return { data, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE
// updateJobHistory(pk, updates, userEmail)
//   Gated by JH_EDIT right — only call when rights.JH_EDIT === 1
//   NEVER touches record_status — use softDelete/recover for that
//
//   pk shape (all 3 parts of composite PK required to identify the row):
//   { empno: string, jobcode: string, effdate: string }
//
//   updates shape (only salary and deptcode are editable; PK cols are fixed):
//   { salary?: number, deptcode?: string }
// ─────────────────────────────────────────────────────────────────────────────
export async function updateJobHistory(pk, updates, userEmail) {
  const stamp = makeStamp('UPDATED', userEmail);

  // Strip record_status defensively
  const { record_status: _ignored, ...safeUpdates } = updates;

  const { data, error } = await supabase
    .from('jobhistory')
    .update({ ...safeUpdates, stamp })
    .eq('empno', pk.empno)
    .eq('jobcode', pk.jobcode)
    .eq('effdate', pk.effdate)
    .select()
    .single();

  if (error) console.error('[updateJobHistory]', error.message);
  return { data, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// SOFT DELETE
// softDeleteJobHistory(pk, userEmail)
//   Gated by JH_DEL right — SUPERADMIN only per rights matrix
//
//   Sets record_status = 'INACTIVE' on this specific job history row.
//   Does NOT affect the parent employee row (one-way only).
// ─────────────────────────────────────────────────────────────────────────────
export async function softDeleteJobHistory(pk, userEmail) {
  const stamp = makeStamp('DEACTIVATED', userEmail);

  const { error } = await supabase
    .from('jobhistory')
    .update({ record_status: 'INACTIVE', stamp })
    .eq('empno', pk.empno)
    .eq('jobcode', pk.jobcode)
    .eq('effdate', pk.effdate);

  if (error) console.error('[softDeleteJobHistory]', error.message);
  return { error };
}

// ─────────────────────────────────────────────────────────────────────────────
// RECOVER
// recoverJobHistory(pk, userEmail)
//   Accessible to ADMIN and SUPERADMIN only (RLS + route guard)
//
//   Sets record_status = 'ACTIVE' on this specific job history row.
// ─────────────────────────────────────────────────────────────────────────────
export async function recoverJobHistory(pk, userEmail) {
  const stamp = makeStamp('REACTIVATED', userEmail);

  const { error } = await supabase
    .from('jobhistory')
    .update({ record_status: 'ACTIVE', stamp })
    .eq('empno', pk.empno)
    .eq('jobcode', pk.jobcode)
    .eq('effdate', pk.effdate);

  if (error) console.error('[recoverJobHistory]', error.message);
  return { error };
}