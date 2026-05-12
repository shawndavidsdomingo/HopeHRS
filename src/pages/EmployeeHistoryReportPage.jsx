// src/pages/EmployeeHistoryReportPage.jsx
// Sprint 3 — M2 PR-02: feat/ui-reports
// ─────────────────────────────────────────────────────────────────────────────
// EmployeeHistoryReportPage:
//   - Searchable employee selector (by empno, lastname, firstname)
//   - Shows complete job history chronologically (job, dept, salary, effDate)
//   - Data from getEmployeeFullHistory(empno) via reportsService.js
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { getEmployeeFullHistory } from '../lib/reportsService';
import { getEmployees } from '../lib/employeeService';
import { useRights } from '../contexts/UserRightsContext';

// ── Status Badge ──────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    ACTIVE:   'bg-emerald-50 text-emerald-700 border border-emerald-200',
    INACTIVE: 'bg-slate-100 text-slate-400 border border-slate-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase ${map[status] ?? map.INACTIVE}`}>
      {status}
    </span>
  );
};

// ── Skeleton Rows ─────────────────────────────────────────────
const SkeletonRows = ({ cols, count = 5 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <tr key={i} className="border-b border-slate-100">
        {Array.from({ length: cols }).map((_, j) => (
          <td key={j} className="px-6 py-4">
            <div
              className="h-3 bg-slate-100 animate-pulse"
              style={{ width: `${50 + ((i * j + j) % 4) * 12}%`, animationDelay: `${i * 60}ms` }}
            />
          </td>
        ))}
      </tr>
    ))}
  </>
);

// ── Empty State ───────────────────────────────────────────────
const EmptyState = ({ cols, label = 'No records found' }) => (
  <tr>
    <td colSpan={cols} className="px-6 py-16 text-center">
      <div className="flex flex-col items-center gap-2">
        <div className="w-10 h-10 border-2 border-dashed border-slate-200 flex items-center justify-center">
          <span className="text-slate-300 text-lg">∅</span>
        </div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
    </td>
  </tr>
);

// ── Format currency ───────────────────────────────────────────
const fmt = (val) => `$${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ── Page ──────────────────────────────────────────────────────
export default function EmployeeHistoryReportPage() {
  const { currentUser } = useRights();

  const [employees, setEmployees]   = useState([]);
  const [search, setSearch]         = useState('');
  const [selectedEmpno, setSelected] = useState('');
  const [employee, setEmployee]     = useState(null);
  const [history, setHistory]       = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError]           = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Load employee list for selector
  useEffect(() => {
    getEmployees(currentUser?.user_type).then(({ data }) => {
      setEmployees(data);
      setLoadingList(false);
    });
  }, [currentUser]);

  // Filter employees by search
  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.empno.toLowerCase().includes(q) ||
      e.lastname.toLowerCase().includes(q) ||
      e.firstname.toLowerCase().includes(q)
    );
  }).slice(0, 10);

  // Load report when employee is selected
  const handleSelect = async (emp) => {
    setSearch(`${emp.empno} — ${emp.lastname}, ${emp.firstname}`);
    setSelected(emp.empno);
    setShowDropdown(false);
    setLoadingReport(true);
    setError('');

    const { employee, history, error } = await getEmployeeFullHistory(emp.empno);
    if (error) setError(`Failed to load history: ${error.message}`);
    else {
      setEmployee(employee);
      setHistory(history);
    }
    setLoadingReport(false);
  };

  const handleClear = () => {
    setSearch('');
    setSelected('');
    setEmployee(null);
    setHistory([]);
    setError('');
  };

  const cols = 5;

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-6 pb-5 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Employee History Report</h2>
          <p className="text-sm text-slate-400 mt-1 font-medium">Complete job history for a selected employee</p>
        </div>
      </div>

      {/* Employee Selector */}
      <div className="mb-6 relative">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
          Select Employee
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowDropdown(true);
                if (!e.target.value) handleClear();
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search by emp no, last name, or first name..."
              className="w-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-400"
              disabled={loadingList}
            />
            {/* Dropdown */}
            {showDropdown && search && filtered.length > 0 && (
              <div className="absolute z-10 top-full left-0 right-0 bg-white border border-slate-200 shadow-lg max-h-60 overflow-y-auto">
                {filtered.map((emp) => (
                  <button
                    key={emp.empno}
                    onClick={() => handleSelect(emp)}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-indigo-50 border-b border-slate-100 last:border-0 cursor-pointer"
                  >
                    <span className="font-mono text-xs text-slate-400 mr-3">{emp.empno}</span>
                    <span className="font-semibold text-slate-800">{emp.lastname}, {emp.firstname}</span>
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-slate-300">{emp.record_status}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {selectedEmpno && (
            <button
              onClick={handleClear}
              className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 px-4 py-3 text-sm font-medium border bg-rose-50 border-rose-200 text-rose-700">
          {error}
        </div>
      )}

      {/* Employee Profile Card */}
      {employee && !loadingReport && (
        <div className="border border-slate-200 bg-white p-5 mb-6">
          <div className="flex items-start justify-between mb-3 pb-3 border-b border-slate-100">
            <div>
              <p className="text-lg font-bold text-slate-900 tracking-tight">
                {employee.lastname}, {employee.firstname}
              </p>
              <p className="text-xs font-mono text-slate-400 mt-0.5">{employee.empno}</p>
            </div>
            <StatusBadge status={employee.record_status} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-2 text-sm">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Gender</p>
              <p className="text-slate-700">{employee.gender === 'M' ? 'Male' : 'Female'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Birthdate</p>
              <p className="font-mono text-slate-700">{employee.birthdate ?? '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Hire Date</p>
              <p className="font-mono text-slate-700">{employee.hiredate ?? '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Sep Date</p>
              <p className="font-mono text-slate-700">{employee.sepdate ?? '—'}</p>
            </div>
          </div>
        </div>
      )}

      {/* History Table */}
      {(selectedEmpno || loadingReport) && (
        <>
          {!loadingReport && (
            <p className="text-xs text-slate-400 font-medium mb-3">
              {history.length} {history.length === 1 ? 'record' : 'records'} found
            </p>
          )}
          <div className="bg-white border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em]">Job Code</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em]">Job Description</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em]">Department</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] text-right">Salary</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em]">Eff Date</th>
                </tr>
              </thead>
              <tbody>
                {loadingReport ? (
                  <SkeletonRows cols={cols} />
                ) : history.length > 0 ? (
                  history.map((row, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-indigo-50/40 transition-colors duration-75">
                      <td className="px-6 py-4 font-mono text-xs text-indigo-500 font-bold">{row.jobcode}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{row.job?.jobdesc ?? '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{row.department?.deptname ?? '—'}</td>
                      <td className="px-6 py-4 text-right font-mono text-sm font-semibold text-slate-700">{fmt(row.salary)}</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{row.effdate}</td>
                    </tr>
                  ))
                ) : (
                  <EmptyState cols={cols} label="No job history found" />
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Prompt if nothing selected yet */}
      {!selectedEmpno && !loadingReport && (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-slate-200">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Search for an employee above to view their history
          </p>
        </div>
      )}
    </div>
  );
}