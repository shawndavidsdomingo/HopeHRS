// src/pages/Employees.jsx
// Sprint 2 — M2 PR-01: feat/ui-employee-list
// ─────────────────────────────────────────────────────────────────────────────
// Full EmployeeListPage replacing the Sprint 1 placeholder.
//
// Features:
//   - Fetches employees via getEmployees(userType) from employeeService.js
//   - Stamp column visible to ADMIN and SUPERADMIN only
//   - INACTIVE rows hidden for USER (enforced by service + RLS)
//   - Add button gated by rights.EMP_ADD === 1
//   - Edit button gated by rights.EMP_EDIT === 1
//   - Delete button gated by rights.EMP_DEL === 1 (SUPERADMIN only)
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { getEmployees } from '../lib/employeeService';
import { useRights } from '../contexts/UserRightsContext';
import AddEmployeeModal from '../components/AddEmployeeModal';
import EditEmployeeModal from '../components/EditEmployeeModal';
import SoftDeleteConfirmDialog from '../components/SoftDeleteConfirmDialog';

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

// ── Separation Badge ──────────────────────────────────────────
const SepBadge = ({ date }) => {
  if (!date) return <span className="text-slate-300 text-xs">—</span>;
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-semibold">
      {date}
    </span>
  );
};

// ── Gender Pill ───────────────────────────────────────────────
const GenderPill = ({ g }) => {
  const isMale = g === 'M';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-wide ${
      isMale
        ? 'bg-blue-50 text-blue-600 border border-blue-200'
        : 'bg-pink-50 text-pink-600 border border-pink-200'
    }`}>
      {isMale ? 'Male' : 'Female'}
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

// ── Employees Page ────────────────────────────────────────────
export default function Employees() {
  const { currentUser, rights } = useRights();
  const [data, setData]                 = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showAdd, setShowAdd]           = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const isAdmin = currentUser?.user_type === 'ADMIN' || currentUser?.user_type === 'SUPERADMIN';

  const fetchData = async () => {
    setLoading(true);
    const { data: rows } = await getEmployees(currentUser?.user_type);
    setData(rows);
    setLoading(false);
  };

  useEffect(() => {
    if (currentUser) fetchData();
  }, [currentUser]);

  // Build columns dynamically based on user type and rights
  const cols = [
    { header: 'Emp No',     key: 'empno',     className: 'font-mono text-slate-400 text-xs' },
    { header: 'Full Name',  render: (r) => <span className="font-semibold text-slate-800 tracking-tight">{r.lastname}, {r.firstname}</span> },
    { header: 'Gender',     render: (r) => <GenderPill g={r.gender} /> },
    { header: 'Birthdate',  key: 'birthdate', className: 'text-slate-500 font-mono text-xs' },
    { header: 'Hire Date',  key: 'hiredate',  className: 'text-slate-500 font-mono text-xs' },
    { header: 'Separation', render: (r) => <SepBadge date={r.sepdate} /> },
    { header: 'Status',     render: (r) => <StatusBadge status={r.record_status} /> },
    // Stamp column — ADMIN and SUPERADMIN only
    ...(isAdmin ? [{
      header: 'Stamp',
      key: 'stamp',
      className: 'text-slate-400 font-mono text-[10px]',
    }] : []),
    // Actions column — shown when user has at least one action right
    ...((rights.EMP_EDIT === 1 || rights.EMP_DEL === 1) ? [{
      header: '',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-3">
          {rights.EMP_EDIT === 1 && (
            <button
              onClick={() => setEditTarget(r)}
              className="text-[10px] font-bold text-slate-300 hover:text-indigo-600 uppercase tracking-widest transition-colors cursor-pointer"
            >
              Edit
            </button>
          )}
          {rights.EMP_DEL === 1 && r.record_status === 'ACTIVE' && (
            <button
              onClick={() => setDeleteTarget(r)}
              className="text-[10px] font-bold text-slate-300 hover:text-rose-500 uppercase tracking-widest transition-colors cursor-pointer"
            >
              Delete
            </button>
          )}
        </div>
      ),
    }] : []),
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-6 pb-5 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Employee Directory</h2>
          <p className="text-sm text-slate-400 mt-1 font-medium">All active personnel on record</p>
        </div>
        {rights.EMP_ADD === 1 && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-xs font-bold tracking-[0.12em] uppercase transition-colors duration-150 cursor-pointer shadow-sm"
          >
            <span className="text-base leading-none">+</span> Add Employee
          </button>
        )}
      </div>

      {/* Record count */}
      {!loading && (
        <p className="text-xs text-slate-400 font-medium mb-3">
          {data.length} {data.length === 1 ? 'record' : 'records'} found
        </p>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {cols.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] ${col.align === 'right' ? 'text-right' : ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonRows cols={cols.length} />
            ) : data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-slate-100 last:border-0 hover:bg-indigo-50/40 transition-colors duration-75"
                >
                  {cols.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-6 py-4 text-sm ${col.className || 'text-slate-600'} ${col.align === 'right' ? 'text-right' : ''}`}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <EmptyState cols={cols.length} />
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showAdd && (
        <AddEmployeeModal
          onClose={() => setShowAdd(false)}
          onSuccess={fetchData}
        />
      )}
      {editTarget && (
        <EditEmployeeModal
          employee={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={fetchData}
        />
      )}
      {deleteTarget && (
        <SoftDeleteConfirmDialog
          employee={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}