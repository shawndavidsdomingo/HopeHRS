// src/lib/jobService.js
// Sprint 2 — M1 PR-03: feat/job-dept-api  (Job half)
// ─────────────────────────────────────────────────────────────────────────────
// Schema confirmed from 001_initial_schema.sql:
//   Table : job
//   PK    : jobcode (Postgres lowercases "jobCode")
//   Cols  : jobcode, jobdesc, record_status, stamp
//
//   Note: App.jsx Sprint 1 queried 'job' with columns jobtitle / highsal / lowsal
//   but those columns do NOT exist in 001_initial_schema.sql. The real columns
//   are jobcode and jobdesc. The Sprint 1 UI was placeholder — Sprint 2 uses
//   the correct schema.
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from './supabaseClient';

// ── Stamp helper ──────────────────────────────────────────────────────────────
function makeStamp(action, userEmail) {
  return `${action} | ${userEmail} | ${new Date().toISOString()}`.slice(0, 60);
}

// ─────────────────────────────────────────────────────────────────────────────
// READ
// getJobs(userType)
//   USER              → ACTIVE rows only
//   ADMIN/SUPERADMIN  → all rows
// ─────────────────────────────────────────────────────────────────────────────
export async function getJobs(userType) {
  let query = supabase
    .from('job')
    .select('jobcode, jobdesc, record_status, stamp')
    .order('jobcode');

  if (userType === 'USER') {
    query = query.eq('record_status', 'ACTIVE');
  }

  const { data, error } = await query;
  if (error) console.error('[getJobs]', error.message);
  return { data: data ?? [], error };
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE
// addJob(jobData, userEmail)
//   Gated by JOB_ADD right — only call when rights.JOB_ADD === 1
//
//   jobData shape:
//   { jobcode: string, jobdesc: string }
// ─────────────────────────────────────────────────────────────────────────────
export async function addJob(jobData, userEmail) {
  const stamp = makeStamp('ADDED', userEmail);

  const { data, error } = await supabase
    .from('job')
    .insert([{
      jobcode:       jobData.jobcode,
      jobdesc:       jobData.jobdesc,
      record_status: 'ACTIVE',
      stamp,
    }])
    .select()
    .single();

  if (error) console.error('[addJob]', error.message);
  return { data, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE
// updateJob(jobcode, updates, userEmail)
//   Gated by JOB_EDIT right — only call when rights.JOB_EDIT === 1
//   Only jobdesc is editable; jobcode is the PK and cannot change.
// ─────────────────────────────────────────────────────────────────────────────
export async function updateJob(jobcode, updates, userEmail) {
  const stamp = makeStamp('UPDATED', userEmail);
  const { record_status: _ignored, jobcode: _pk, ...safeUpdates } = updates;

  const { data, error } = await supabase
    .from('job')
    .update({ ...safeUpdates, stamp })
    .eq('jobcode', jobcode)
    .select()
    .single();

  if (error) console.error('[updateJob]', error.message);
  return { data, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// SOFT DELETE
// softDeleteJob(jobcode, userEmail)
//   Gated by JOB_DEL right — SUPERADMIN only per rights matrix
// ─────────────────────────────────────────────────────────────────────────────
export async function softDeleteJob(jobcode, userEmail) {
  const stamp = makeStamp('DEACTIVATED', userEmail);

  const { error } = await supabase
    .from('job')
    .update({ record_status: 'INACTIVE', stamp })
    .eq('jobcode', jobcode);

  if (error) console.error('[softDeleteJob]', error.message);
  return { error };
}

// ─────────────────────────────────────────────────────────────────────────────
// RECOVER
// recoverJob(jobcode, userEmail)
//   Accessible to ADMIN and SUPERADMIN only
// ─────────────────────────────────────────────────────────────────────────────
export async function recoverJob(jobcode, userEmail) {
  const stamp = makeStamp('REACTIVATED', userEmail);

  const { error } = await supabase
    .from('job')
    .update({ record_status: 'ACTIVE', stamp })
    .eq('jobcode', jobcode);

  if (error) console.error('[recoverJob]', error.message);
  return { error };
}