// src/components/EditDeptModal.jsx
// Sprint 2 — M2 PR-03: feat/ui-job-dept
// ─────────────────────────────────────────────────────────────────────────────
// Modal for editing an existing department.
// Gated by DEPT_EDIT right — only rendered when rights.DEPT_EDIT === 1
// deptcode (PK) is read-only; only deptname is editable.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { updateDept } from '../lib/departmentService';
import { useRights } from '../contexts/UserRightsContext';

export default function EditDeptModal({ dept, onClose, onSuccess }) {
  const { currentUser } = useRights();
  const [deptname, setDeptname] = useState(dept.deptname ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!deptname.trim()) {
      setError('Department Name is required.');
      return;
    }
    setSaving(true);
    setError('');
    const { error: err } = await updateDept(dept.deptcode, { deptname: deptname.trim() }, currentUser.email);
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
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Edit Department</h3>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-600 text-xl leading-none cursor-pointer">×</button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2">{error}</p>
          )}

          {/* Read-only PK */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Department Code</label>
            <input
              type="text" value={dept.deptcode} disabled
              className="w-full border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-400 cursor-not-allowed"
            />
          </div>

          {/* Editable field */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Department Name</label>
            <input
              type="text" value={deptname} onChange={e => setDeptname(e.target.value)}
              className="w-full border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-indigo-400"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-slate-800 cursor-pointer">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-widest disabled:opacity-50 cursor-pointer">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}