// src/pages/Jobs.jsx
import { useEffect, useState, useCallback } from 'react';
import { Briefcase, Plus, Pencil, Trash2 } from 'lucide-react';
import { getJobs, softDeleteJob } from '../lib/jobService';
import { useRights } from '../contexts/UserRightsContext';
import AddJobModal from '../components/AddJobModal';
import EditJobModal from '../components/EditJobModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function Jobs() {
  const { currentUser, rights } = useRights();
  const isAdmin = currentUser?.user_type === 'ADMIN' || currentUser?.user_type === 'SUPERADMIN';
  const isSuperAdmin = currentUser?.user_type === 'SUPERADMIN';
  
  // STRICTER GATING: Only Superadmins can delete
  const canDelete = isSuperAdmin;
  const canEdit = isAdmin || rights?.JOB_EDIT === 1;
  const canAdd = isAdmin || rights?.JOB_ADD === 1;

  const [jobs, setJobs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showAdd, setShowAdd]     = useState(false);
  const [editTarget, setEditTarget] = useState(null);
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

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Jobs</h1>
          <p className="mt-1 text-xs text-slate-500 uppercase tracking-wide">Manage job codes & descriptions</p>
        </div>
        {canAdd && (
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-widest rounded shadow-sm transition-all"
          >
            <Plus size={14} /> Add Job
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-lg flex-1 overflow-auto">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 font-medium animate-pulse">Loading jobs...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <Th>Job Code</Th>
                <Th>Description</Th>
                <Th>Status</Th>
                {(canEdit || canDelete) && <Th align="right">Actions</Th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((job) => (
                <tr key={job.jobcode} className={`hover:bg-slate-50/50 transition-colors ${job.record_status === 'INACTIVE' ? 'opacity-50' : ''}`}>
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-indigo-50 flex items-center justify-center">
                        <Briefcase size={12} className="text-indigo-600" />
                      </div>
                      <span className="font-mono text-indigo-600 font-bold">{job.jobcode}</span>
                    </div>
                  </Td>
                  <Td>{job.jobdesc}</Td>
                  <Td><StatusBadge status={job.record_status || 'ACTIVE'} /></Td>
                  
                  {(canEdit || canDelete) && (
                    <Td align="right">
                      <div className="flex items-center justify-end gap-2">
                        {canEdit && job.record_status !== 'INACTIVE' && (
                          <button
                            onClick={() => setEditTarget(job)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer rounded"
                          >
                            <Pencil size={10} /> Edit
                          </button>
                        )}
                        {canDelete && job.record_status !== 'INACTIVE' && (
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
              ))}
            </tbody>
          </table>
        )}
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

function Th({ children, align = 'left' }) {
  return <th className={`px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-${align}`}>{children}</th>;
}

function Td({ children, align = 'left' }) {
  return <td className={`px-4 py-3 text-sm text-slate-700 text-${align}`}>{children}</td>;
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