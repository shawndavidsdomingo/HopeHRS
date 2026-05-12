// src/pages/Departments.jsx
// Sprint 2 — M2 PR-03: feat/ui-job-dept
// M4 PR-03: feat/rights-job-dept — migrated to hasRight() from UserRightsContext
// PR-03: fix/ui-final-polish — mobile responsive
// Sprint 3: search bar, sortable columns
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback, useMemo } from 'react';
import { PiggyBank, BadgeDollarSign, BriefcaseBusiness, Scale, Computer, HandCoins, Warehouse, Building, Plus, Pencil, Trash2, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

const DEPT_ICONS = {
  ACT: PiggyBank,
  BR1: BadgeDollarSign,
  BR2: BadgeDollarSign,
  EXC: BriefcaseBusiness,
  HRD: Scale,
  IT:  Computer,
  PAY: HandCoins,
  WHS: Warehouse,
};
const DeptIcon = ({ code }) => {
  const Icon = DEPT_ICONS[code] ?? Building;
  return <Icon size={12} className="text-indigo-600" />;
};
import { getDepts, softDeleteDept } from '../lib/departmentService';
import { useRights } from '../contexts/UserRightsContext';
import AddDeptModal from '../components/AddDeptModal';
import EditDeptModal from '../components/EditDeptModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

const SkeletonRows = ({ cols, count = 7 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <tr key={i} className="border-b border-slate-100">
        {Array.from({ length: cols }).map((_, j) => (
          <td key={j} className="px-6 py-4">
            <div className="h-3 bg-slate-100 animate-pulse"
              style={{ width: `${50 + ((i * j + j) % 4) * 12}%`, animationDelay: `${i * 60}ms` }} />
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

function StatusBadge({ status }) {
  const map = { ACTIVE: 'bg-emerald-50 text-emerald-700 border border-emerald-200', INACTIVE: 'bg-slate-100 text-slate-400 border border-slate-200' };
  const s = status || 'ACTIVE';
  return <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase ${map[s] ?? map.INACTIVE}`}>{s}</span>;
}

const SortIcon = ({ col, sortKey, sortDir }) => {
  if (sortKey !== col) return <ChevronsUpDown size={11} className="text-slate-300 ml-1 inline" />;
  return sortDir === 'asc' ? <ChevronUp size={11} className="text-indigo-500 ml-1 inline" /> : <ChevronDown size={11} className="text-indigo-500 ml-1 inline" />;
};

export default function Departments() {
  const { currentUser, hasRight } = useRights();

  const [depts, setDepts]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [sortKey, setSortKey]           = useState('deptcode');
  const [sortDir, setSortDir]           = useState('asc');
  const [showAdd, setShowAdd]           = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await getDepts(currentUser?.user_type);
    setDepts(data || []);
    setLoading(false);
  }, [currentUser]);

  useEffect(() => { load(); }, [load]);

  const handleSort = (key) => {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else { setSortKey('deptcode'); setSortDir('asc'); }
    } else { setSortKey(key); setSortDir('asc'); }
  };

  const displayed = useMemo(() => {
    const q = search.toLowerCase();
    let result = depts.filter(r =>
      (r.deptcode ?? '').toLowerCase().includes(q) ||
      (r.deptname ?? '').toLowerCase().includes(q)
    );
    if (sortKey && sortDir) {
      result = [...result].sort((a, b) => {
        const av = (a[sortKey] ?? '').toString().toLowerCase();
        const bv = (b[sortKey] ?? '').toString().toLowerCase();
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }
    return result;
  }, [depts, search, sortKey, sortDir]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await softDeleteDept(deleteTarget.deptcode, currentUser?.email);
    if (!error) { load(); setDeleteTarget(null); }
    else { console.error('Failed to delete department.'); alert('Failed to delete department. Check console.'); }
  };

  const hasActions = hasRight('DEPT_EDIT') || hasRight('DEPT_DEL');
  const colCount = hasActions ? 4 : 3;

  const SortTh = ({ label, colKey, align = 'left' }) => (
    <th onClick={() => handleSort(colKey)}
      className={`px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] whitespace-nowrap cursor-pointer select-none hover:text-slate-600 ${align === 'right' ? 'text-right' : ''}`}>
      {label}<SortIcon col={colKey} sortKey={sortKey} sortDir={sortDir} />
    </th>
  );

  return (
    <div className="space-y-4 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="uppercase text-2xl font-bold text-slate-900 tracking-tight">Departments</h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">Manage company departments</p>
        </div>
        {hasRight('DEPT_ADD') && (
          <button onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-widest rounded shadow-sm transition-all">
            <Plus size={14} /> Add Department
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Search Departments</label>
        <div className="w-full">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by dept code or name..."
            className="w-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-400" />
        </div>
        {!loading && (
          <p className="text-xs text-slate-400 font-medium">
            {displayed.length} {displayed.length === 1 ? 'record' : 'records'} found
          </p>
        )}
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-lg flex-1 overflow-hidden">
        <div className="overflow-x-auto h-full">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 shadow-[0_1px_0_0_#e2e8f0]">
              <tr className="border-b border-slate-100 bg-slate-50">
                <SortTh label="Dept Code"       colKey="deptcode" />
                <SortTh label="Department Name" colKey="deptname" />
                <SortTh label="Status"          colKey="record_status" />
                {hasActions && <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] whitespace-nowrap text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows cols={colCount} />
              ) : displayed.length > 0 ? (
                displayed.map((dept) => (
                  <tr key={dept.deptcode} className={`border-b border-slate-100 last:border-0 hover:bg-indigo-50/40 transition-colors duration-75 ${dept.record_status === 'INACTIVE' ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-indigo-50 flex items-center justify-center shrink-0">
                          <DeptIcon code={dept.deptcode} />
                        </div>
                        <span className="font-mono text-xs font-semibold text-slate-700">{dept.deptcode}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{dept.deptname}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={dept.record_status} /></td>
                    {hasActions && (
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {hasRight('DEPT_EDIT') && dept.record_status !== 'INACTIVE' && (
                            <button onClick={() => setEditTarget(dept)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer rounded">
                              <Pencil size={10} /> Edit
                            </button>
                          )}
                          {hasRight('DEPT_DEL') && dept.record_status !== 'INACTIVE' && (
                            <button onClick={() => setDeleteTarget(dept)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-rose-500 uppercase tracking-widest border border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer rounded">
                              <Trash2 size={10} /> Delete
                            </button>
                          )}
                        </div>
                      </td>
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

      {showAdd && <AddDeptModal onClose={() => setShowAdd(false)} onSuccess={load} />}
      {editTarget && <EditDeptModal dept={editTarget} onClose={() => setEditTarget(null)} onSuccess={load} />}
      {deleteTarget && (
        <DeleteConfirmModal title="Delete Department" message={`Are you sure you want to deactivate department ${deleteTarget.deptcode}?`}
          onConfirm={confirmDelete} onClose={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}