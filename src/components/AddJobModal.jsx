// src/components/AddJobModal.jsx
// Sprint 2 — M2 PR-03: feat/ui-job-dept
// ─────────────────────────────────────────────────────────────────────────────
// Modal for adding a new job.
// Gated by JOB_ADD right — only rendered when rights.JOB_ADD === 1
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { addJob } from '../lib/jobService';
import { useRights } from '../contexts/UserRightsContext';

export default function AddJobModal({ onClose, onSuccess }) {
  const { currentUser } = useRights();
  const [form, setForm] = useState({ jobcode: '', jobdesc: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.jobcode.trim() || !form.jobdesc.trim()) {
      setError('Job Code and Job Description are required.');
      return;
    }
    setSaving(true);
    setError('');
    const { error: err } = await addJob(
      { jobcode: form.jobcode.trim().toUpperCase(), jobdesc: form.jobdesc.trim() },
      currentUser.email
    );
    setSaving(false);
    if (err) { setError(err.message); return; }
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white border border-slate-200 shadow-xl w-full max-w-md mx-4">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Add Job</h3>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-600 text-xl leading-none cursor-pointer">×</button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2">{error}</p>
          )}
          <Field label="Job Code" name="jobcode" value={form.jobcode} onChange={handleChange} placeholder="e.g. DEV01" />
          <Field label="Job Description" name="jobdesc" value={form.jobdesc} onChange={handleChange} placeholder="e.g. Software Developer" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-slate-800 cursor-pointer">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-widest disabled:opacity-50 cursor-pointer">
            {saving ? 'Saving...' : 'Add Job'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, placeholder = '' }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</label>
      <input
        type="text" name={name} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-indigo-400"
      />
    </div>
  );
}