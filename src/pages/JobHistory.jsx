// src/pages/JobHistory.jsx
// Sprint 2 — M2 PR-03: feat/ui-job-dept
// ─────────────────────────────────────────────────────────────────────────────
// Moved from inline JobHistoryList in App.jsx (Sprint 1 placeholder).
// Displays all job history records — read-only view.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

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

const JobHistory = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      const { data, error } = await supabase.from('jobhistory').select('*');
      if (error) console.error('Database Error:', error.message);
      setData(data || []);
      setLoading(false);
    }
    fetchHistory();
  }, []);

  return (
    <div>
      <div className="flex items-end justify-between mb-6 pb-5 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Employment History</h2>
          <p className="text-sm text-slate-400 mt-1 font-medium">Complete job assignment records</p>
        </div>
      </div>

      {!loading && (
        <p className="text-xs text-slate-400 font-medium mb-3">
          {data.length} {data.length === 1 ? 'record' : 'records'} found
        </p>
      )}

      <div className="bg-white border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {['Emp No', 'Job Code', 'Department', 'Effective Date', 'Salary', 'Status'].map(h => (
                <th key={h} className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-xs text-slate-400 animate-pulse">Loading…</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-xs text-slate-400">No records found.</td></tr>
            ) : data.map((r, i) => (
              <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-indigo-50/40 transition-colors duration-75">
                <td className="px-6 py-4 font-mono text-slate-400 text-xs">{r.empno}</td>
                <td className="px-6 py-4 font-mono text-indigo-400 text-xs font-bold">{r.jobcode}</td>
                <td className="px-6 py-4 text-slate-500 text-sm">{r.deptcode}</td>
                <td className="px-6 py-4 font-mono text-slate-500 text-xs">{r.effdate}</td>
                <td className="px-6 py-4 font-mono text-sm text-slate-700 font-semibold">${Number(r.salary || 0).toLocaleString()}</td>
                <td className="px-6 py-4"><StatusBadge status={r.record_status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobHistory;