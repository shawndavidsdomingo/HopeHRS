// src/components/SoftDeleteConfirmDialog.jsx
// Sprint 2 — M2 PR-01: feat/ui-employee-list
// ─────────────────────────────────────────────────────────────────────────────
// Confirmation dialog before soft-deleting an employee.
// Gated by EMP_DEL right — only rendered when rights.EMP_DEL === 1
// (SUPERADMIN only per rights matrix)
// Calls softDeleteEmployee() from employeeService.js on confirm.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { softDeleteEmployee } from '../lib/employeeService';
import { useRights } from '../contexts/UserRightsContext';

export default function SoftDeleteConfirmDialog({ employee, onClose, onSuccess }) {
  const { currentUser } = useRights();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setDeleting(true);
    setError('');
    const { error: err } = await softDeleteEmployee(employee.empno, currentUser.email);
    setDeleting(false);
    if (err) { setError(err.message); return; }
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white border border-slate-200 shadow-xl w-full max-w-md mx-4">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Confirm Soft Delete</h3>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-600 text-xl leading-none cursor-pointer">×</button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-3">
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2">{error}</p>
          )}
          <p className="text-sm text-slate-600">
            Are you sure you want to deactivate{' '}
            <span className="font-bold text-slate-900">
              {employee.lastname}, {employee.firstname}
            </span>{' '}
            <span className="font-mono text-slate-400 text-xs">({employee.empno})</span>?
          </p>
          <p className="text-xs text-slate-400">
            This will set the employee to INACTIVE and hide them from USER accounts.
            All job history rows for this employee will also be set to INACTIVE
            via the cascade trigger. This action can be reversed from the Deleted Items panel.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-slate-800 cursor-pointer">
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={deleting}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-widest disabled:opacity-50 cursor-pointer">
            {deleting ? 'Deactivating...' : 'Confirm Deactivate'}
          </button>
        </div>
      </div>
    </div>
  );
}