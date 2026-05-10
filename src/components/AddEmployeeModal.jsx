// src/components/AddEmployeeModal.jsx
// Sprint 2 — M2 PR-01: feat/ui-employee-list
// ─────────────────────────────────────────────────────────────────────────────
// Modal for adding a new employee.
// Gated by EMP_ADD right — only rendered when rights.EMP_ADD === 1
// Calls addEmployee() from employeeService.js on submit.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { addEmployee } from '../lib/employeeService';
import { useRights } from '../contexts/UserRightsContext';

export default function AddEmployeeModal({ onClose, onSuccess }) {
  const { currentUser } = useRights();
  const [form, setForm] = useState({
    empno: '', lastname: '', firstname: '',
    gender: 'M', birthdate: '', hiredate: '', sepdate: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.empno || !form.lastname || !form.firstname || !form.birthdate || !form.hiredate) {
      setError('Emp No, Last Name, First Name, Birthdate, and Hire Date are required.');
      return;
    }
    setSaving(true);
    setError('');
    const { error: err } = await addEmployee(
      { ...form, sepdate: form.sepdate || null },
      currentUser.email
    );
    setSaving(false);
    if (err) { setError(err.message); return; }
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white border border-slate-200 shadow-xl w-full max-w-lg mx-4">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Add Employee</h3>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-600 text-xl leading-none cursor-pointer">×</button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2">{error}</p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label="Emp No" name="empno" value={form.empno} onChange={handleChange} placeholder="00033" />
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange}
                className="w-full border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-indigo-400">
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Last Name" name="lastname" value={form.lastname} onChange={handleChange} />
            <Field label="First Name" name="firstname" value={form.firstname} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Birthdate" name="birthdate" value={form.birthdate} onChange={handleChange} type="date" />
            <Field label="Hire Date" name="hiredate" value={form.hiredate} onChange={handleChange} type="date" />
          </div>

          <Field label="Separation Date (leave blank if still employed)" name="sepdate" value={form.sepdate} onChange={handleChange} type="date" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-slate-800 cursor-pointer">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-widest disabled:opacity-50 cursor-pointer">
            {saving ? 'Saving...' : 'Add Employee'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-indigo-400" />
    </div>
  );
}