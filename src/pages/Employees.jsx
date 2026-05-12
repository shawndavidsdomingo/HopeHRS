// src/pages/Employees.jsx
// Sprint 2 — M2 PR-01: feat/ui-employee-list
// M4 PR-02: feat/rights-employee-jh — migrated to hasRight() from UserRightsContext
// PR-03: fix/ui-final-polish — mobile responsive: overflow-x-auto, stacked header
// ─────────────────────────────────────────────────────────────────────────────

import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEmployees } from '../lib/employeeService';
import { useRights } from '../contexts/UserRightsContext';
import AddEmployeeModal from '../components/AddEmployeeModal';
import EditEmployeeModal from '../components/EditEmployeeModal';
import SoftDeleteConfirmDialog from '../components/SoftDeleteConfirmDialog';

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

const SepBadge = ({ date }) => {
  if (!date) return <span className="text-slate-300 text-xs">—</span>;
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-semibold">
      {date}
    </span>
  );
};

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

export default function Employees() {
  const { currentUser, hasRight, isAdminOrAbove } = useRights();

  const [data, setData]                 = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showAdd, setShowAdd]           = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    const { data: rows } = await getEmployees(currentUser?.user_type);
    setData(rows);
    setLoading(false);
  };

  useEffect(() => {
    if (currentUser) fetchData();
  }, [currentUser]);

  const cols = [
    { header: 'Emp No',      key: 'empno',     className: 'font-mono text-slate-400 text-xs' },
    { header: 'Last Name',   key: 'lastname',  className: 'font-semibold text-slate-800' },
    { header: 'First Name',  key: 'firstname', className: 'font-semibold text-slate-800' },
    { header: 'Gender',      render: (r) => <GenderPill g={r.gender} /> },
    { header: 'Current Job', key: 'job_title', className: 'text-slate-600 text-sm' },
    { header: 'Hire Date',   key: 'hiredate',  className: 'text-slate-500 font-mono text-xs' },
    { header: 'Separation',  render: (r) => <SepBadge date={r.sepdate} /> },
    { header: 'Status',      render: (r) => <StatusBadge status={r.record_status} /> },
    ...(isAdminOrAbove ? [{
      header: 'Stamp',
      key: 'stamp',
      className: 'text-slate-400 font-mono text-[10px]',
    }] : []),
    {
      header: '',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-4">
          <Link
            to={`/employees/${r.empno}`}
            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest transition-colors cursor-pointer"
          >
            View
          </Link>
          {hasRight('EMP_EDIT') && (
            <button
              onClick={() => setEditTarget(r)}
              className="text-[10px] font-bold text-slate-300 hover:text-indigo-600 uppercase tracking-widest transition-colors cursor-pointer"
            >
              Edit
            </button>
          )}
          {hasRight('EMP_DEL') && r.record_status === 'ACTIVE' && (
            <button
              onClick={() => setDeleteTarget(r)}
              className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-rose-500 uppercase tracking-widest transition-colors cursor-pointer"
            >
              <Trash2 size={12} /> Delete
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Header — stacks on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-5 border-b border-slate-200">
        <div>
          <h1 className="uppercase text-2xl font-bold text-slate-900 tracking-tight">Employee Directory</h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">All active personnel on record</p>
        </div>
        {hasRight('EMP_ADD') && (
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-widest rounded shadow-sm transition-all"
          >
            <Plus size={14} /> Add Employee
          </button>
        )}
      </div>

      <p className="text-xs text-slate-400 font-medium mb-3">
        {data.length} {data.length === 1 ? 'record' : 'records'} found
      </p>

      {/* Table — horizontal scroll on mobile */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg flex-1 overflow-hidden">
        <div className="overflow-x-auto h-full">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 shadow-[0_1px_0_0_#e2e8f0]">
              <tr className="border-b border-slate-100 bg-slate-50">
                {cols.map((col, idx) => (
                  <th
                    key={idx}
                    className={`px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] whitespace-nowrap ${col.align === 'right' ? 'text-right' : ''}`}
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
                        className={`px-6 py-4 text-sm whitespace-nowrap ${col.className || 'text-slate-600'} ${col.align === 'right' ? 'text-right' : ''}`}
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
      </div>

      {showAdd && <AddEmployeeModal onClose={() => setShowAdd(false)} onSuccess={fetchData} />}
      {editTarget && <EditEmployeeModal employee={editTarget} onClose={() => setEditTarget(null)} onSuccess={fetchData} />}
      {deleteTarget && <SoftDeleteConfirmDialog employee={deleteTarget} onClose={() => setDeleteTarget(null)} onSuccess={fetchData} />}
    </div>
  );
}