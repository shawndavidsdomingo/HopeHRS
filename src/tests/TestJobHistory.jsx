import { useEffect } from 'react';
import {
  getJobHistory,
  getAllJobHistory,
  addJobHistory,
  updateJobHistory,
  softDeleteJobHistory,
  recoverJobHistory
} from '../lib/jobHistoryService';

export default function TestJobHistory() {
  useEffect(() => { runTests(); }, []);

  async function runTests() {
    console.group('=== PR-02: jobHistoryService Tests ===');

    // Test 1: getJobHistory for one employee as USER
    const { data: emp1User } = await getJobHistory('00001', 'USER');
    console.log('TEST 1 — getJobHistory USER (all ACTIVE):',
      emp1User.every(r => r.record_status === 'ACTIVE') ? '✅ PASS' : '❌ FAIL',
      `| ${emp1User.length} rows`
    );

    // Test 2: getJobHistory as SUPERADMIN
    const { data: emp1SA } = await getJobHistory('00001', 'SUPERADMIN');
    console.log('TEST 2 — getJobHistory SUPERADMIN (>= USER rows):',
      emp1SA.length >= emp1User.length ? '✅ PASS' : '❌ FAIL',
      `| ${emp1SA.length} rows`
    );

    // Test 3: getAllJobHistory
    const { data: all } = await getAllJobHistory('SUPERADMIN');
    console.log('TEST 3 — getAllJobHistory SUPERADMIN (expect 54+):',
      all.length >= 54 ? '✅ PASS' : '❌ FAIL',
      `| ${all.length} rows`
    );

    // Test 4: addJobHistory
    const { data: added, error: addErr } = await addJobHistory({
      empno:    '00001',
      jobcode:  'HRS',
      effdate:  '2024-06-01',
      salary:   52000,
      deptcode: 'HRD',
    }, 'test@email.com');
    console.log('TEST 4 — addJobHistory:',
      !addErr && added?.jobcode === 'HRS' ? '✅ PASS' : '❌ FAIL',
      addErr?.message ?? ''
    );

    // Test 5: updateJobHistory
    const pk = { empno: '00001', jobcode: 'HRS', effdate: '2024-06-01' };
    const { data: updated, error: updateErr } = await updateJobHistory(
      pk, { salary: 55000 }, 'test@email.com'
    );
    console.log('TEST 5 — updateJobHistory:',
      !updateErr && Number(updated?.salary) === 55000 ? '✅ PASS' : '❌ FAIL',
      updateErr?.message ?? ''
    );

    // Test 6: softDeleteJobHistory — only that row goes INACTIVE
    const { error: delErr } = await softDeleteJobHistory(pk, 'test@email.com');
    const { data: afterDel } = await getJobHistory('00001', 'USER');
    const testRowGone = !afterDel.find(
      r => r.jobcode === 'HRS' && r.effdate === '2024-06-01'
    );
    const otherRowsStillActive = afterDel.every(r => r.record_status === 'ACTIVE');
    console.log('TEST 6 — softDeleteJobHistory (only test row gone, others intact):',
      !delErr && testRowGone && otherRowsStillActive ? '✅ PASS' : '❌ FAIL',
      delErr?.message ?? ''
    );

    // Test 7: recoverJobHistory
    const { error: recErr } = await recoverJobHistory(pk, 'test@email.com');
    const { data: afterRec } = await getJobHistory('00001', 'USER');
    const testRowBack = afterRec.find(
      r => r.jobcode === 'HRS' && r.effdate === '2024-06-01'
    );
    console.log('TEST 7 — recoverJobHistory:',
      !recErr && testRowBack ? '✅ PASS' : '❌ FAIL',
      recErr?.message ?? ''
    );

    console.groupEnd();
  }

  return <div style={{ padding: 24 }}>Check browser console for PR-02 test results.</div>;
}