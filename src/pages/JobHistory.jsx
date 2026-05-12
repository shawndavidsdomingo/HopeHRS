// src/pages/JobHistory.jsx
// PR-03: fix/ui-final-polish — skeleton rows, proper EmptyState, mobile responsive table
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRights } from '../contexts/UserRightsContext';
import { Trash2 } from 'lucide-react';
import { softDeleteJobHistory } from '../lib/jobHistoryService';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

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

export default function JobHistory() {
  const { currentUser } = useRights();
  const isAdmin   = currentUser?.user_type === 'ADMIN' || currentUser?.user_type === 'SUPERADMIN';
  const canDelete = currentUser?.user_type === 'SUPERADMIN';

  const [data, setData]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const colCount = canDelete ? 7 : 6;

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    const { data: historyData, error } = await supabase.from('jobhistory').select('*');
    if (error) {
      console.error('Database Error:', error.message);
    } else {
      const visibleData = isAdmin ? historyData : historyData.filter(r => r.record_status === 'ACTIVE');
      setData(visibleData || []);
    }
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const pk = { empno: deleteTarget.empno, jobcode: deleteTarget.jobcode, effdate: deleteTarget.effdate };
    const { error } = await softDeleteJobHistory(pk, currentUser?.email);
    if (!error) {
      fetchHistory();
      setDeleteTarget(null);
    } else {
      console.error('Failed to delete job history.');
      alert('Failed to delete job history. Check console.');
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Header — stacks on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-5 border-b border-slate-200">
        <div>
          <h1 className="uppercase text-2xl font-bold text-slate-900 tracking-tight">Job History</h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">Historical Employee Placements</p>
        </div>
      </div>

      <p className="text-xs text-slate-400 font-medium mb-3">
        {data.length} {data.length === 1 ? 'record' : 'records'} found
      </p>

      {/* Table — horizontal scroll on mobile */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg flex-1 overflow-hidden">
        <div className="overflow-x-auto h-full">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 shadow-[0_1px_0_0_#e2e8f0]">
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Emp No', 'Job Code', 'Department', 'Effective Date', 'Salary', 'Status'].map(h => (
                  <th key={h} className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] whitespace-nowrap">{h}</th>
                ))}
                {canDelete && (
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] text-right whitespace-nowrap">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows cols={colCount} />
              ) : data.length === 0 ? (
                <EmptyState cols={colCount} />
              ) : (
                data.map((r, i) => (
                  <tr key={i} className={`border-b border-slate-100 last:border-0 hover:bg-indigo-50/40 transition-colors duration-75 ${r.record_status === 'INACTIVE' ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4 font-mono text-slate-600 text-xs whitespace-nowrap">{r.empno}</td>
                    <td className="px-6 py-4 font-mono text-indigo-600 text-xs font-bold whitespace-nowrap">{r.jobcode}</td>
                    <td className="px-6 py-4 text-slate-600 text-sm whitespace-nowrap">{r.deptcode}</td>
                    <td className="px-6 py-4 font-mono text-slate-500 text-xs whitespace-nowrap">{r.effdate}</td>
                    <td className="px-6 py-4 font-mono text-slate-600 text-xs whitespace-nowrap">
                      {r.salary ? `$${Number(r.salary).toLocaleString()}` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={r.record_status || 'ACTIVE'} />
                    </td>
                    {canDelete && (
                      <td className="px-6 py-4 text-right">
                        {r.record_status !== 'INACTIVE' && (
                          <button
                            onClick={() => setDeleteTarget(r)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-rose-500 uppercase tracking-widest border border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer rounded"
                          >
                            <Trash2 size={10} /> Delete
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteTarget && (
        <DeleteConfirmModal
          title="Delete Job History"
          message={`Are you sure you want to delete the job history record for Employee ${deleteTarget.empno}?`}
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}