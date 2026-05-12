// src/pages/Jobs.jsx
// Sprint 2 — M2 PR-03: feat/ui-job-dept
// M4 PR-03: feat/rights-job-dept — migrated to hasRight() from UserRightsContext
// PR-03: fix/ui-final-polish — skeleton rows, mobile responsive table
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from 'react';
import { Briefcase, Plus, Pencil, Trash2 } from 'lucide-react';
import { getJobs, softDeleteJob } from '../lib/jobService';
import { useRights } from '../contexts/UserRightsContext';
import AddJobModal from '../components/AddJobModal';
import EditJobModal from '../components/EditJobModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

// ── Skeleton Rows ─────────────────────────────────────────────
const SkeletonRows = ({ cols, count = 6 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <tr key={i} className="border-b border-slate-100">
        {Array.from({ length: cols }).map((_, j) => (
          <td key={j} className="px-4 py-3">
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

function Th({ children, align = 'left' }) {
  return <th className={`px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap text-${align}`}>{children}</th>;
}

function Td({ children, align = 'left' }) {
  return <td className={`px-4 py-3 text-sm text-slate-700 whitespace-nowrap text-${align}`}>{children}</td>;
}

function StatusBadge({ status }) {
  const active = status === 'ACTIVE';
  return (
    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded ${
      active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400 border border-slate-200'
    }`}>
      {status || 'ACTIVE'}
    </span>
  );
}

export default function Jobs() {
  const { currentUser, hasRight } = useRights();

  const [jobs, setJobs]                 = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showAdd, setShowAdd]           = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await getJobs(currentUser?.user_type);
    setJobs(data || []);
    setLoading(false);
  }, [currentUser]);

  useEffect(() => { load(); }, [load]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await softDeleteJob(deleteTarget.jobcode, currentUser?.email);
    if (!error) {
      load();
      setDeleteTarget(null);
    } else {
      console.error('Failed to delete job.');
      alert('Failed to delete job. Check console.');
    }
  };

  const hasActions = hasRight('JOB_EDIT') || hasRight('JOB_DEL');
  const colCount = hasActions ? 4 : 3;

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Header — stacks on mobile */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Jobs</h1>
          <p className="mt-1 text-xs text-slate-500 uppercase tracking-wide">Manage job codes & descriptions</p>
        </div>
        {hasRight('JOB_ADD') && (
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-widest rounded shadow-sm transition-all"
          >
            <Plus size={14} /> Add Job
          </button>
        )}
      </div>

      {/* Table — horizontal scroll on mobile */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg flex-1 overflow-hidden">
        <div className="overflow-x-auto h-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <Th>Job Code</Th>
                <Th>Description</Th>
                <Th>Status</Th>
                {hasActions && <Th align="right">Actions</Th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <SkeletonRows cols={colCount} />
              ) : jobs.length > 0 ? (
                jobs.map((job) => (
                  <tr key={job.jobcode} className={`hover:bg-slate-50/50 transition-colors ${job.record_status === 'INACTIVE' ? 'opacity-50' : ''}`}>
                    <Td>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-indigo-50 flex items-center justify-center shrink-0">
                          <Briefcase size={12} className="text-indigo-600" />
                        </div>
                        <span className="font-mono text-indigo-600 font-bold">{job.jobcode}</span>
                      </div>
                    </Td>
                    <Td>{job.jobdesc}</Td>
                    <Td><StatusBadge status={job.record_status || 'ACTIVE'} /></Td>
                    {hasActions && (
                      <Td align="right">
                        <div className="flex items-center justify-end gap-2">
                          {hasRight('JOB_EDIT') && job.record_status !== 'INACTIVE' && (
                            <button
                              onClick={() => setEditTarget(job)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer rounded"
                            >
                              <Pencil size={10} /> Edit
                            </button>
                          )}
                          {hasRight('JOB_DEL') && job.record_status !== 'INACTIVE' && (
                            <button
                              onClick={() => setDeleteTarget(job)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-rose-500 uppercase tracking-widest border border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer rounded"
                            >
                              <Trash2 size={10} /> Delete
                            </button>
                          )}
                        </div>
                      </Td>
                    )}
                  </tr>
                ))
              ) : (
                <EmptyState cols={colCount} />
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && <AddJobModal onClose={() => setShowAdd(false)} onSuccess={load} />}
      {editTarget && <EditJobModal job={editTarget} onClose={() => setEditTarget(null)} onSuccess={load} />}
      {deleteTarget && (
        <DeleteConfirmModal
          title="Delete Job"
          message={`Are you sure you want to deactivate job ${deleteTarget.jobcode}?`}
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}