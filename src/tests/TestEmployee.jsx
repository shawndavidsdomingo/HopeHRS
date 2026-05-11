import { useEffect } from 'react';
import {
  getEmployees,
  addEmployee,
  updateEmployee,
  softDeleteEmployee,
  recoverEmployee
} from '../lib/employeeService';


export default function TestEmployee() {
  useEffect(() => {
    runTests();
  }, []);

  async function runTests() {
    console.group('=== PR-01: employeeService Tests ===');

    // Test 1: getEmployees as USER — ACTIVE only
    const { data: userView } = await getEmployees('USER');
    console.log('TEST 1 — getEmployees USER (expect all ACTIVE):',
      userView.every(r => r.record_status === 'ACTIVE') ? '✅ PASS' : '❌ FAIL',
      `| ${userView.length} rows`
    );

    // Test 2: getEmployees as SUPERADMIN — all rows
    const { data: adminView } = await getEmployees('SUPERADMIN');
    console.log('TEST 2 — getEmployees SUPERADMIN (expect >= USER count):',
      adminView.length >= userView.length ? '✅ PASS' : '❌ FAIL',
      `| ${adminView.length} rows`
    );

    // Test 3: addEmployee
    const { data: added, error: addErr } = await addEmployee({
      empno:     '00065',
      lastname:  'TestLast',
      firstname: 'TestFirst',
      gender:    'M',
      birthdate: '1990-01-01',
      hiredate:  '2024-01-01',
      sepdate:   null,
    }, 'test@email.com');
    console.log('TEST 3 — addEmployee:',
      !addErr && added?.empno === '00065' ? '✅ PASS' : '❌ FAIL',
      addErr?.message ?? ''
    );

    // Test 4: updateEmployee
    const { data: updated, error: updateErr } = await updateEmployee(
      '00065',
      { lastname: 'UpdatedLast' },
      'test@email.com'
    );
    console.log('TEST 4 — updateEmployee:',
      !updateErr && updated?.lastname === 'UpdatedLast' ? '✅ PASS' : '❌ FAIL',
      updateErr?.message ?? ''
    );

    // Test 5: softDeleteEmployee — check cascade
    const { error: delErr } = await softDeleteEmployee('00065', 'test@email.com');
    const { data: afterDel } = await getEmployees('USER');
    const stillVisible = afterDel.find(r => r.empno === '00065');
    console.log('TEST 5 — softDeleteEmployee (USER cannot see it):',
      !delErr && !stillVisible ? '✅ PASS' : '❌ FAIL',
      delErr?.message ?? ''
    );

    // Test 6: recoverEmployee
    const { error: recErr } = await recoverEmployee('00065', 'test@email.com');
    const { data: afterRec } = await getEmployees('USER');
    const isBack = afterRec.find(r => r.empno === '00065');
    console.log('TEST 6 — recoverEmployee (USER can see it again):',
      !recErr && isBack ? '✅ PASS' : '❌ FAIL',
      recErr?.message ?? ''
    );

    console.groupEnd();
  }

  return <div style={{ padding: 24 }}>Check browser console for PR-01 test results.</div>;
}