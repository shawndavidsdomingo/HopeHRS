// src/pages/HeadcountByDeptPage.jsx
// Sprint 3 — M2 PR-02: feat/ui-reports
// PR-03: fix/ui-final-polish — mobile responsive table and bar chart
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { getHeadcountByDept } from '../lib/reportsService';

const SkeletonRows = ({ cols, count = 6 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <tr key={i} className="border-b border-slate-100">
        {Array.from({ length: cols }).map((_, j) => (
          <td key={j} className="px-6 py-4">
            <div className="h-3 bg-slate-100 animate-pulse" style={{ width: `${50 + ((i * j + j) % 4) * 12}%`, animationDelay: `${i * 60}ms` }} />
          </td>
        ))}
      </tr>
    ))}
  </>
);

const EmptyState = ({ cols }) => (
  <tr>
    <td colSpan={cols} className="px-6 py-24 text-center">
      <div className="flex flex-col items-center gap-2">
        <div className="w-10 h-10 border-2 border-dashed border-slate-200 flex items-center justify-center">
          <span className="text-slate-300 text-lg">∅</span>
        </div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">No records found</p>
      </div>
    </td>
  </tr>
);

const HeadcountBarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.activeheadcount), 1);
  return (
    <div className="bg-white border border-slate-200 p-4 sm:p-6 mb-8">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.18em] mb-6">
        Active Headcount by Department
      </h3>
      <div className="space-y-3">
        {data.map((row) => (
          <div key={row.deptcode} className="flex items-center gap-2 sm:gap-4">
            <span className="text-xs font-mono text-slate-400 w-12 sm:w-16 shrink-0 text-right">
              {row.deptcode}
            </span>
            <div className="flex-1 bg-slate-100 h-6 overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-500 flex items-center justify-end pr-2"
                style={{ width: `${(row.activeheadcount / max) * 100}%` }}
              >
                <span className="text-[10px] font-bold text-white">{row.activeheadcount}</span>
              </div>
            </div>
            <span className="text-xs text-slate-500 w-24 sm:w-40 shrink-0 truncate hidden sm:block">
              {row.deptname}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function HeadcountByDeptPage() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    getHeadcountByDept().then(({ data, error }) => {
      if (error) setError(`Failed to load report: ${error.message}`);
      else setData(data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <div className="flex items-end justify-between mb-6 pb-5 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Headcount by Department</h2>
          <p className="text-sm text-slate-400 mt-1 font-medium">Active employee count per department</p>
        </div>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 text-sm font-medium border bg-rose-50 border-rose-200 text-rose-700">{error}</div>
      )}

      {!loading && data.length > 0 && <HeadcountBarChart data={data} />}

      {!loading && (
        <p className="text-xs text-slate-400 font-medium mb-3">
          {data.length} {data.length === 1 ? 'department' : 'departments'} found
        </p>
      )}

      <div className="bg-white border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] whitespace-nowrap">Dept Code</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] whitespace-nowrap">Department Name</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] text-right whitespace-nowrap">Active Headcount</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows cols={3} />
              ) : data.length > 0 ? (
                data.map((row) => (
                  <tr key={row.deptcode} className="border-b border-slate-100 last:border-0 hover:bg-indigo-50/40 transition-colors duration-75">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400 whitespace-nowrap">{row.deptcode}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800 whitespace-nowrap">{row.deptname}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-mono text-sm font-bold text-indigo-600">{row.activeheadcount}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyState cols={3} />
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}