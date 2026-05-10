import { useEffect } from 'react';
import { getJobs, addJob, updateJob, softDeleteJob, recoverJob } from '../lib/jobService';
import { getDepts, addDept, updateDept, softDeleteDept, recoverDept } from '../lib/departmentService';

export default function TestJobDept() {
  useEffect(() => { runTests(); }, []);

  async function runTests() {
    console.group('=== PR-03: jobService + departmentService Tests ===');

    // ── JOB TESTS ──────────────────────────────────────────────────────
    const { data: jobsUser } = await getJobs('USER');
    console.log('TEST 1 — getJobs USER (expect 14 ACTIVE):',
      jobsUser.length === 14 && jobsUser.every(r => r.record_status === 'ACTIVE')
        ? '✅ PASS' : '❌ FAIL',
      `| ${jobsUser.length} rows`
    );

    const { data: addedJob, error: addJobErr } = await addJob(
      { jobcode: 'TST1', jobdesc: 'Test Job' }, 'test@email.com'
    );
    console.log('TEST 2 — addJob:',
      !addJobErr && addedJob?.jobcode === 'TST1' ? '✅ PASS' : '❌ FAIL',
      addJobErr?.message ?? ''
    );

    const { data: updatedJob, error: updateJobErr } = await updateJob(
      'TST1', { jobdesc: 'Updated Job' }, 'test@email.com'
    );
    console.log('TEST 3 — updateJob:',
      !updateJobErr && updatedJob?.jobdesc === 'Updated Job' ? '✅ PASS' : '❌ FAIL',
      updateJobErr?.message ?? ''
    );

    const { error: delJobErr } = await softDeleteJob('TST1', 'test@email.com');
    const { data: jobsAfterDel } = await getJobs('USER');
    const testJobGone = !jobsAfterDel.find(r => r.jobcode === 'TST1');
    console.log('TEST 4 — softDeleteJob (USER cannot see TST1):',
      !delJobErr && testJobGone ? '✅ PASS' : '❌ FAIL',
      delJobErr?.message ?? ''
    );

    const { error: recJobErr } = await recoverJob('TST1', 'test@email.com');
    const { data: jobsAfterRec } = await getJobs('USER');
    const testJobBack = jobsAfterRec.find(r => r.jobcode === 'TST1');
    console.log('TEST 5 — recoverJob (USER can see TST1 again):',
      !recJobErr && testJobBack ? '✅ PASS' : '❌ FAIL',
      recJobErr?.message ?? ''
    );

    // ── DEPARTMENT TESTS ───────────────────────────────────────────────
    const { data: deptsUser } = await getDepts('USER');
    console.log('TEST 6 — getDepts USER (expect 8 ACTIVE):',
      deptsUser.length === 8 && deptsUser.every(r => r.record_status === 'ACTIVE')
        ? '✅ PASS' : '❌ FAIL',
      `| ${deptsUser.length} rows`
    );

    const { data: addedDept, error: addDeptErr } = await addDept(
      { deptcode: 'TST', deptname: 'Test Dept' }, 'test@email.com'
    );
    console.log('TEST 7 — addDept:',
      !addDeptErr && addedDept?.deptcode === 'TST' ? '✅ PASS' : '❌ FAIL',
      addDeptErr?.message ?? ''
    );

    const { data: updatedDept, error: updateDeptErr } = await updateDept(
      'TST', { deptname: 'Updated Dept' }, 'test@email.com'
    );
    console.log('TEST 8 — updateDept:',
      !updateDeptErr && updatedDept?.deptname === 'Updated Dept' ? '✅ PASS' : '❌ FAIL',
      updateDeptErr?.message ?? ''
    );

    const { error: delDeptErr } = await softDeleteDept('TST', 'test@email.com');
    const { data: deptsAfterDel } = await getDepts('USER');
    const testDeptGone = !deptsAfterDel.find(r => r.deptcode === 'TST');
    console.log('TEST 9 — softDeleteDept (USER cannot see TST):',
      !delDeptErr && testDeptGone ? '✅ PASS' : '❌ FAIL',
      delDeptErr?.message ?? ''
    );

    const { error: recDeptErr } = await recoverDept('TST', 'test@email.com');
    const { data: deptsAfterRec } = await getDepts('USER');
    const testDeptBack = deptsAfterRec.find(r => r.deptcode === 'TST');
    console.log('TEST 10 — recoverDept (USER can see TST again):',
      !recDeptErr && testDeptBack ? '✅ PASS' : '❌ FAIL',
      recDeptErr?.message ?? ''
    );

    console.groupEnd();
  }

  return <div style={{ padding: 24 }}>Check browser console for PR-03 test results.</div>;
}