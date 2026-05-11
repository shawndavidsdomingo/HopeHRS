// src/lib/reportsService.js
// Sprint 3 — M1 PR-02: feat/reports-api
// ─────────────────────────────────────────────────────────────────────────────
// HR Reports API — three report queries:
//
//   getHeadcountByDept()      — from headcount_by_dept view (M3 PR-01)
//   getSalarySummaryByJob()   — from salary_summary_by_job view (M3 PR-01)
//   getEmployeeFullHistory()  — direct query joining employee + jobhistory
//                               + job + department for one employee
//
// Views confirmed from 007_view_employee_current_job.sql pattern and
// Sprint 2 M3 PR-04 deliverables. View names match the spec exactly.
//
// Auth pattern matches existing service files:
//   - No userType filter needed — reports are ADMIN/SUPERADMIN only
//   - Gated by ADM_USER right in the UI (M2 PR-02)
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from './supabaseClient';

// ─────────────────────────────────────────────────────────────────────────────
// REPORT 1: Headcount by Department
// getHeadcountByDept()
//   Queries the headcount_by_dept view created by M3 PR-01.
//   Returns active employee count per department, sorted descending
//   by headcount.
//
//   View columns (from M3 Sprint 3 PR-01):
//     deptcode, deptname, activeheadcount
// ─────────────────────────────────────────────────────────────────────────────
export async function getHeadcountByDept() {
  const { data, error } = await supabase
    .from('headcount_by_dept')
    .select('deptcode, deptname, activeheadcount')
    .order('activeheadcount', { ascending: false });

  if (error) console.error('[getHeadcountByDept]', error.message);
  return { data: data ?? [], error };
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORT 2: Salary Summary by Job
// getSalarySummaryByJob()
//   Queries the salary_summary_by_job view created by M3 PR-01.
//   Returns min/max/avg salary per active job, sorted descending
//   by average salary.
//
//   View columns (from M3 Sprint 3 PR-01):
//     jobcode, jobdesc, assignments, minsalary, maxsalary, avgsalary
// ─────────────────────────────────────────────────────────────────────────────
export async function getSalarySummaryByJob() {
  const { data, error } = await supabase
    .from('salary_summary_by_job')
    .select('jobcode, jobdesc, assignments, minsalary, maxsalary, avgsalary')
    .order('avgsalary', { ascending: false });

  if (error) console.error('[getSalarySummaryByJob]', error.message);
  return { data: data ?? [], error };
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORT 3: Employee Full History
// getEmployeeFullHistory(empno)
//   Returns complete job history for one employee, joined with job
//   description and department name, sorted by effdate descending.
//
//   Includes ALL jobhistory rows (ACTIVE + INACTIVE) — this is a
//   full audit report for ADMIN/SUPERADMIN, not a visibility-filtered view.
//
//   Returns both employee info and each job history row in one call
//   using Supabase's embedded select syntax.
//
//   Shape of each returned row:
//   {
//     empno, jobcode, effdate, salary, deptcode, record_status, stamp,
//     job: { jobdesc },
//     department: { deptname }
//   }
// ─────────────────────────────────────────────────────────────────────────────
export async function getEmployeeFullHistory(empno) {
  // Step 1: Get employee info
  const { data: employee, error: empError } = await supabase
    .from('employee')
    .select('empno, lastname, firstname, gender, birthdate, hiredate, sepdate, record_status')
    .eq('empno', empno)
    .maybeSingle();

  if (empError) {
    console.error('[getEmployeeFullHistory] employee query:', empError.message);
    return { employee: null, history: [], error: empError };
  }

  if (!employee) {
    return { employee: null, history: [], error: new Error(`Employee ${empno} not found`) };
  }

  // Step 2: Get full job history with job + department joined
  const { data: history, error: histError } = await supabase
    .from('jobhistory')
    .select(`
      empno,
      jobcode,
      effdate,
      salary,
      deptcode,
      record_status,
      stamp,
      job ( jobdesc ),
      department ( deptname )
    `)
    .eq('empno', empno)
    .order('effdate', { ascending: false });

  if (histError) {
    console.error('[getEmployeeFullHistory] history query:', histError.message);
    return { employee, history: [], error: histError };
  }

  return { employee, history: history ?? [], error: null };
}