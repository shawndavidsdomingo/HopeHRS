// src/pages/Jobs.jsx
import { useEffect, useState, useCallback } from 'react';
import { Briefcase, Plus, Pencil, Trash2 } from 'lucide-react';
import { getJobs, softDeleteJob } from '../lib/jobService';
import { useRights } from '../contexts/UserRightsContext';
import AddJobModal from '../components/AddJobModal';
import EditJobModal from '../components/EditJobModal';

export default function Jobs() {
  const { currentUser, userType, rights } = useRights();
  const isAdmin = userType === 'ADMIN' || userType === 'SUPERADMIN';

  const [jobs, setJobs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showAdd, setShowAdd]     = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await getJobs(userType);
    setJobs(data || []);
    setLoading(false);
  }, [userType]);

  useEffect(() => { load(); }, [load]);

  // NEW: Handle Delete
  const handleDelete = async (job) => {
    if (window.confirm(`Are you sure you want to delete job ${job.jobcode}?`)) {
      const { error } = await softDeleteJob(job.jobcode, currentUser?.email);
      if (!error) {
        load(); // Refresh the list after successful delete
      } else {
        alert('Failed to delete job. Check console.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 flex items-center justify-center shadow-sm">
            <Briefcase size={15} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Job Catalogue</h1>
            <p className="text-[10px] text-slate-400 mt-0.5">{jobs.length} record{jobs.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {rights?.JOB_ADD === 1 && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
          >
            <Plus size={13} />
            Add Job
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-xs text-slate-400 uppercase tracking-widest animate-pulse">Loading…</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-xs text-slate-400">No jobs found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <Th>Job Code</Th>
                <Th>Job Description</Th>
                {isAdmin && <Th>Status</Th>}
                {(rights?.JOB_EDIT === 1 || rights?.JOB_DEL === 1) && <Th align="right">Actions</Th>}
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr
                  key={job.jobcode}
                  className={`border-b border-slate-100 hover:bg-slate-50/60 transition-colors ${
                    job.record_status === 'INACTIVE' ? 'opacity-50' : ''
                  }`}
                >
                  <Td>
                    <span className="font-mono text-xs font-semibold text-slate-700">{job.jobcode}</span>
                  </Td>
                  <Td>{job.jobdesc}</Td>
                  {isAdmin && (
                    <Td><StatusBadge status={job.record_status} /></Td>
                  )}
                  {(rights?.JOB_EDIT === 1 || rights?.JOB_DEL === 1) && (
                    <Td align="right">
                      <div className="flex justify-end gap-2">
                        {rights?.JOB_EDIT === 1 && (
                          <button
                            onClick={() => setEditTarget(job)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 transition-colors cursor-pointer"
                          >
                            <Pencil size={10} /> Edit
                          </button>
                        )}
                        {rights?.JOB_DEL === 1 && job.record_status === 'ACTIVE' && (
                          <button
                            onClick={() => handleDelete(job)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-rose-500 uppercase tracking-widest border border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
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

      {/* ── Modals ── */}
      {showAdd && <AddJobModal onClose={() => setShowAdd(false)} onSuccess={load} />}
      {editTarget && <EditJobModal job={editTarget} onClose={() => setEditTarget(null)} onSuccess={load} />}
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
    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
      active ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-400 border border-slate-200'
    }`}>
      {status}
    </span>
  );
}