// src/tests/TestReports.jsx
// Sprint 3 — M1 PR-02: feat/reports-api
// Temporary test page for getHeadcountByDept, getSalarySummaryByJob,
// getEmployeeFullHistory
// Visit: http://localhost:5173/test-reports
// Remove before production deploy
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import {
  getHeadcountByDept,
  getSalarySummaryByJob,
  getEmployeeFullHistory,
} from '../lib/reportsService';

export default function TestReports() {
  const [headcount, setHeadcount]     = useState([]);
  const [salary, setSalary]           = useState([]);
  const [history, setHistory]         = useState({ employee: null, history: [] });
  const [empnoInput, setEmpnoInput]   = useState('00001');
  const [errors, setErrors]           = useState({});
  const [loading, setLoading]         = useState(false);

  // Run headcount and salary on mount
  useEffect(() => {
    runHeadcount();
    runSalary();
  }, []);

  // ── TEST 1: getHeadcountByDept ────────────────────────────────────────────
  async function runHeadcount() {
    const { data, error } = await getHeadcountByDept();
    if (error) {
      setErrors(prev => ({ ...prev, headcount: error.message }));
      console.error('[TestReports] getHeadcountByDept:', error.message);
    } else {
      setHeadcount(data);
      console.log('[TestReports] getHeadcountByDept:', data);
    }
  }

  // ── TEST 2: getSalarySummaryByJob ─────────────────────────────────────────
  async function runSalary() {
    const { data, error } = await getSalarySummaryByJob();
    if (error) {
      setErrors(prev => ({ ...prev, salary: error.message }));
      console.error('[TestReports] getSalarySummaryByJob:', error.message);
    } else {
      setSalary(data);
      console.log('[TestReports] getSalarySummaryByJob:', data);
    }
  }

  // ── TEST 3: getEmployeeFullHistory ────────────────────────────────────────
  async function runHistory() {
    setLoading(true);
    setErrors(prev => ({ ...prev, history: null }));
    const { employee, history: hist, error } = await getEmployeeFullHistory(empnoInput.trim());
    if (error) {
      setErrors(prev => ({ ...prev, history: error.message }));
      console.error('[TestReports] getEmployeeFullHistory:', error.message);
    } else {
      setHistory({ employee, history: hist });
      console.log('[TestReports] getEmployeeFullHistory:', { employee, history: hist });
    }
    setLoading(false);
  }

  return (
    <div className="p-8 space-y-10 max-w-5xl">

      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-800">HR Reports — API Test Page</h1>
        <p className="text-xs text-amber-600 font-semibold uppercase tracking-widest mt-1">
          ⚠ Temporary Test Page — remove before production deploy
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Requires headcount_by_dept and salary_summary_by_job views to be deployed (M3 PR-01).
        </p>
      </div>

      {/* ── TEST 1: Headcount by Dept ─────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest">
            Test 1 — getHeadcountByDept()
          </h2>
          <button
            onClick={runHeadcount}
            className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-600 hover:text-white transition-all rounded cursor-pointer"
          >
            Re-run
          </button>
        </div>

        {errors.headcount ? (
          <div className="bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700 rounded">
            ❌ Error: {errors.headcount}
            <p className="mt-1 text-red-500">
              The headcount_by_dept view may not be deployed yet. Run M3 PR-01 SQL first.
            </p>
          </div>
        ) : headcount.length === 0 ? (
          <p className="text-xs text-slate-400 animate-pulse">Loading...</p>
        ) : (
          <>
            <p className="text-xs text-emerald-600 font-bold">
              ✅ {headcount.length} departments returned
            </p>
            <table className="w-full text-left border-collapse text-xs bg-white border border-slate-200">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dept Code</th>
                  <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dept Name</th>
                  <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Active Headcount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {headcount.map(row => (
                  <tr key={row.deptcode} className="hover:bg-slate-50">
                    <td className="px-4 py-2 font-mono text-indigo-600 font-bold">{row.deptcode}</td>
                    <td className="px-4 py-2 text-slate-700">{row.deptname}</td>
                    <td className="px-4 py-2 text-right font-bold text-slate-800">{row.activeheadcount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>

      {/* ── TEST 2: Salary Summary by Job ────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest">
            Test 2 — getSalarySummaryByJob()
          </h2>
          <button
            onClick={runSalary}
            className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-600 hover:text-white transition-all rounded cursor-pointer"
          >
            Re-run
          </button>
        </div>

        {errors.salary ? (
          <div className="bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700 rounded">
            ❌ Error: {errors.salary}
            <p className="mt-1 text-red-500">
              The salary_summary_by_job view may not be deployed yet. Run M3 PR-01 SQL first.
            </p>
          </div>
        ) : salary.length === 0 ? (
          <p className="text-xs text-slate-400 animate-pulse">Loading...</p>
        ) : (
          <>
            <p className="text-xs text-emerald-600 font-bold">
              ✅ {salary.length} jobs returned
            </p>
            <table className="w-full text-left border-collapse text-xs bg-white border border-slate-200">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Job Code</th>
                  <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</th>
                  <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Assignments</th>
                  <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Min</th>
                  <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Max</th>
                  <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Avg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {salary.map(row => (
                  <tr key={row.jobcode} className="hover:bg-slate-50">
                    <td className="px-4 py-2 font-mono text-indigo-600 font-bold">{row.jobcode}</td>
                    <td className="px-4 py-2 text-slate-700">{row.jobdesc}</td>
                    <td className="px-4 py-2 text-right text-slate-600">{row.assignments}</td>
                    <td className="px-4 py-2 text-right font-mono text-slate-600">${Number(row.minsalary).toLocaleString()}</td>
                    <td className="px-4 py-2 text-right font-mono text-slate-600">${Number(row.maxsalary).toLocaleString()}</td>
                    <td className="px-4 py-2 text-right font-mono font-bold text-slate-800">${Number(row.avgsalary).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>

      {/* ── TEST 3: Employee Full History ─────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest">
          Test 3 — getEmployeeFullHistory(empno)
        </h2>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={empnoInput}
            onChange={e => setEmpnoInput(e.target.value)}
            placeholder="Enter empno e.g. 00001"
            className="border border-slate-200 px-3 py-2 text-sm text-slate-700 rounded w-48 focus:outline-none focus:border-indigo-400"
          />
          <button
            onClick={runHistory}
            disabled={loading}
            className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-all rounded cursor-pointer"
          >
            {loading ? 'Loading...' : 'Run'}
          </button>
        </div>

        {errors.history && (
          <div className="bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700 rounded">
            ❌ Error: {errors.history}
          </div>
        )}

        {history.employee && (
          <div className="space-y-3">
            {/* Employee info */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded text-xs space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Employee</p>
              <p><span className="text-slate-400">empno:</span> <span className="font-mono text-slate-700">{history.employee.empno}</span></p>
              <p><span className="text-slate-400">name:</span> <span className="text-slate-700">{history.employee.lastname}, {history.employee.firstname}</span></p>
              <p><span className="text-slate-400">status:</span>
                <span className={`ml-2 px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                  history.employee.record_status === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {history.employee.record_status}
                </span>
              </p>
            </div>

            {/* Job history */}
            <p className="text-xs text-emerald-600 font-bold">
              ✅ {history.history.length} job history rows returned (ACTIVE + INACTIVE)
            </p>
            <table className="w-full text-left border-collapse text-xs bg-white border border-slate-200">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Job Code</th>
                  <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Job Desc</th>
                  <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dept</th>
                  <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Eff Date</th>
                  <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Salary</th>
                  <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.history.map((row, i) => (
                  <tr key={i} className={`hover:bg-slate-50 ${row.record_status === 'INACTIVE' ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-2 font-mono text-indigo-600 font-bold">{row.jobcode}</td>
                    <td className="px-4 py-2 text-slate-700">{row.job?.jobdesc ?? '—'}</td>
                    <td className="px-4 py-2 text-slate-600">{row.department?.deptname ?? row.deptcode}</td>
                    <td className="px-4 py-2 font-mono text-slate-500">{row.effdate}</td>
                    <td className="px-4 py-2 text-right font-mono text-slate-700">${Number(row.salary).toLocaleString()}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                        row.record_status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-400'
                      }`}>
                        {row.record_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
}