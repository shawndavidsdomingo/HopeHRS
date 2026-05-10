// src/pages/Departments.jsx
// Sprint 2 — M2 PR-03: feat/ui-job-dept
// ─────────────────────────────────────────────────────────────────────────────
// DeptListPage
//   Columns : deptCode, deptName, record_status (ADMIN/SUPERADMIN only)
//   Add     : gated by DEPT_ADD
//   Edit    : gated by DEPT_EDIT (per-row button)
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from 'react';
import { Building, Plus, Pencil } from 'lucide-react';
import { getDepts } from '../lib/departmentService';
import { useRights } from '../contexts/UserRightsContext';
import AddDeptModal from '../components/AddDeptModal';
import EditDeptModal from '../components/EditDeptModal';

export default function Departments() {
  const { userType, rights } = useRights();
  const isAdmin = userType === 'ADMIN' || userType === 'SUPERADMIN';

  const [depts, setDepts]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showAdd, setShowAdd]       = useState(false);
  const [editTarget, setEditTarget] = useState(null); // dept row being edited

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await getDepts(userType);
    setDepts(data);
    setLoading(false);
  }, [userType]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 flex items-center justify-center shadow-sm">
            <Building size={15} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Departments</h1>
            <p className="text-[10px] text-slate-400 mt-0.5">{depts.length} record{depts.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {rights?.DEPT_ADD === 1 && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
          >
            <Plus size={13} />
            Add Department
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-xs text-slate-400 uppercase tracking-widest animate-pulse">Loading…</p>
          </div>
        ) : depts.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-xs text-slate-400">No departments found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <Th>Dept Code</Th>
                <Th>Department Name</Th>
                {isAdmin && <Th>Status</Th>}
                {rights?.DEPT_EDIT === 1 && <Th align="right">Actions</Th>}
              </tr>
            </thead>
            <tbody>
              {depts.map((dept) => (
                <tr
                  key={dept.deptcode}
                  className={`border-b border-slate-100 hover:bg-slate-50/60 transition-colors ${
                    dept.record_status === 'INACTIVE' ? 'opacity-50' : ''
                  }`}
                >
                  <Td>
                    <span className="font-mono text-xs font-semibold text-slate-700">{dept.deptcode}</span>
                  </Td>
                  <Td>{dept.deptname}</Td>
                  {isAdmin && (
                    <Td>
                      <StatusBadge status={dept.record_status} />
                    </Td>
                  )}
                  {rights?.DEPT_EDIT === 1 && (
                    <Td align="right">
                      <button
                        onClick={() => setEditTarget(dept)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 transition-colors cursor-pointer"
                      >
                        <Pencil size={10} />
                        Edit
                      </button>
                    </Td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modals ── */}
      {showAdd && (
        <AddDeptModal onClose={() => setShowAdd(false)} onSuccess={load} />
      )}
      {editTarget && (
        <EditDeptModal dept={editTarget} onClose={() => setEditTarget(null)} onSuccess={load} />
      )}
    </div>
  );
}

/* ── Small layout helpers ── */
function Th({ children, align = 'left' }) {
  return (
    <th className={`px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-${align}`}>
      {children}
    </th>
  );
}

function Td({ children, align = 'left' }) {
  return (
    <td className={`px-4 py-3 text-sm text-slate-700 text-${align}`}>
      {children}
    </td>
  );
}

function StatusBadge({ status }) {
  const active = status === 'ACTIVE';
  return (
    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
      active
        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
        : 'bg-slate-100 text-slate-400 border border-slate-200'
    }`}>
      {status}
    </span>
  );
}