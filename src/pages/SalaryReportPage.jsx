// src/pages/SalaryReportPage.jsx
// Sprint 3 — M2 PR-02: feat/ui-reports
// PR-03: fix/ui-final-polish — mobile responsive table
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { getSalarySummaryByJob } from '../lib/reportsService';

const SkeletonRows = ({ cols, count = 7 }) => (
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

const fmt = (val) => `$${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function SalaryReportPage() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    getSalarySummaryByJob().then(({ data, error }) => {
      if (error) setError(`Failed to load report: ${error.message}`);
      else setData(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-5 border-b border-slate-200">
        <div>
          <h1 className="uppercase text-2xl font-bold text-slate-900 tracking-tight">Salary Report</h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">Min / max / avg salary per job position</p>
        </div>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 text-sm font-medium border bg-rose-50 border-rose-200 text-rose-700">{error}</div>
      )}

      <p className="text-xs text-slate-400 font-medium mb-3">
        {data.length} {data.length === 1 ? 'position' : 'positions'} found
      </p>

      <div className="bg-white border border-slate-200 shadow-sm rounded-lg flex-1 overflow-hidden">
        <div className="overflow-x-auto h-full">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 shadow-[0_1px_0_0_#e2e8f0]">
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] whitespace-nowrap">Job Code</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] whitespace-nowrap">Job Description</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] text-right whitespace-nowrap">Assignments</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] text-right whitespace-nowrap">Min Salary</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] text-right whitespace-nowrap">Max Salary</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] text-right whitespace-nowrap">Avg Salary</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows cols={6} />
              ) : data.length > 0 ? (
                data.map((row) => (
                  <tr key={row.jobcode} className="border-b border-slate-100 last:border-0 hover:bg-indigo-50/40 transition-colors duration-75">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400 whitespace-nowrap">{row.jobcode}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800 whitespace-nowrap">{row.jobdesc}</td>
                    <td className="px-6 py-4 text-right font-mono text-xs text-slate-500 whitespace-nowrap">{row.assignments}</td>
                    <td className="px-6 py-4 text-right font-mono text-sm text-slate-600 whitespace-nowrap">{fmt(row.minsalary)}</td>
                    <td className="px-6 py-4 text-right font-mono text-sm text-slate-600 whitespace-nowrap">{fmt(row.maxsalary)}</td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <span className="font-mono text-sm font-bold text-slate-800">{fmt(row.avgsalary)}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyState cols={6} />
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}