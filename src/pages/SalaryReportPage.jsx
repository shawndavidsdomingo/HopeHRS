// src/pages/SalaryReportPage.jsx
// Sprint 3 — M2 PR-02: feat/ui-reports
// ─────────────────────────────────────────────────────────────────────────────
// SalaryReportPage:
//   - Table showing min/max/avg salary per jobCode, linked to job.jobDesc
//   - Data from getSalarySummaryByJob() via reportsService.js
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { getSalarySummaryByJob } from '../lib/reportsService';

// ── Skeleton Rows ─────────────────────────────────────────────
const SkeletonRows = ({ cols, count = 6 }) => (
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

// ── Format currency ───────────────────────────────────────────
const fmt = (val) => `$${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ── Page ──────────────────────────────────────────────────────
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
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-6 pb-5 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Salary Report</h2>
          <p className="text-sm text-slate-400 mt-1 font-medium">Min / max / avg salary per job position</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 px-4 py-3 text-sm font-medium border bg-rose-50 border-rose-200 text-rose-700">
          {error}
        </div>
      )}

      {/* Record count */}
      {!loading && (
        <p className="text-xs text-slate-400 font-medium mb-3">
          {data.length} {data.length === 1 ? 'position' : 'positions'} found
        </p>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em]">Job Code</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em]">Job Description</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] text-right">Assignments</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] text-right">Min Salary</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] text-right">Max Salary</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] text-right">Avg Salary</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonRows cols={6} />
            ) : data.length > 0 ? (
              data.map((row) => (
                <tr key={row.jobcode} className="border-b border-slate-100 last:border-0 hover:bg-indigo-50/40 transition-colors duration-75">
                  <td className="px-6 py-4 font-mono text-xs text-indigo-500 font-bold">{row.jobcode}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-800">{row.jobdesc}</td>
                  <td className="px-6 py-4 text-right font-mono text-xs text-slate-500">{row.assignments}</td>
                  <td className="px-6 py-4 text-right font-mono text-sm text-slate-600">{fmt(row.minsalary)}</td>
                  <td className="px-6 py-4 text-right font-mono text-sm text-slate-600">{fmt(row.maxsalary)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono text-sm font-bold text-indigo-600">{fmt(row.avgsalary)}</span>
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
  );
}