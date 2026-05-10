// src/pages/JobHistory.jsx
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRights } from '../contexts/UserRightsContext';
import { Trash2 } from 'lucide-react';
import { softDeleteJobHistory } from '../lib/Jobhistoryservice';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

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

export default function JobHistory() {
  const { currentUser, rights } = useRights();
  const isAdmin = currentUser?.user_type === 'ADMIN' || currentUser?.user_type === 'SUPERADMIN';
  const canDelete = isAdmin || rights?.JOBHIST_DEL === 1;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

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

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const pk = {
      empno: deleteTarget.empno,
      jobcode: deleteTarget.jobcode,
      effdate: deleteTarget.effdate
    };

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
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Job History</h1>
        <p className="mt-1 text-xs text-slate-500 uppercase tracking-wide">Historical Employee Placements</p>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm overflow-auto rounded-lg flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Emp No', 'Job Code', 'Department', 'Effective Date', 'Salary', 'Status'].map(h => (
                <th key={h} className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em]">{h}</th>
              ))}
              {canDelete && <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={canDelete ? 7 : 6} className="px-6 py-12 text-center text-xs text-slate-400 animate-pulse">Loading…</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={canDelete ? 7 : 6} className="px-6 py-12 text-center text-xs text-slate-400">No records found.</td></tr>
            ) : data.map((r, i) => (
              <tr key={i} className={`border-b border-slate-100 last:border-0 hover:bg-indigo-50/40 transition-colors duration-75 ${r.record_status === 'INACTIVE' ? 'opacity-50' : ''}`}>
                <td className="px-6 py-4 font-mono text-slate-600 text-xs">{r.empno}</td>
                <td className="px-6 py-4 font-mono text-indigo-600 text-xs font-bold">{r.jobcode}</td>
                <td className="px-6 py-4 text-slate-600 text-sm">{r.deptcode}</td>
                <td className="px-6 py-4 font-mono text-slate-500 text-xs">{r.effdate}</td>
                <td className="px-6 py-4 font-mono text-slate-600 text-xs">
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
            ))}
          </tbody>
        </table>
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