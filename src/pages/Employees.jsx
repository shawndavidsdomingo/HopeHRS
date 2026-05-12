// src/pages/Employees.jsx
// Sprint 2 — M2 PR-01: feat/ui-employee-list
// M4 PR-02: feat/rights-employee-jh — migrated to hasRight() from UserRightsContext
// PR-03: fix/ui-final-polish — mobile responsive
// Sprint 3 fix: search bar, sortable columns, fixed Current Job column
// ─────────────────────────────────────────────────────────────────────────────

import { Eye, Pencil, Plus, Trash2, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
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
      isMale ? 'bg-blue-50 text-blue-600 border border-blue-200'
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

const SortIcon = ({ col, sortKey, sortDir }) => {
  if (sortKey !== col) return <ChevronsUpDown size={11} className="text-slate-300 ml-1 inline" />;
  return sortDir === 'asc'
    ? <ChevronUp size={11} className="text-indigo-500 ml-1 inline" />
    : <ChevronDown size={11} className="text-indigo-500 ml-1 inline" />;
};

export default function Employees() {
  const { currentUser, hasRight, isAdminOrAbove } = useRights();

  const [data, setData]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [sortKey, setSortKey]       = useState('empno');
  const [sortDir, setSortDir]       = useState('asc');
  const [showAdd, setShowAdd]       = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    const { data: rows } = await getEmployees(currentUser?.user_type);
    setData(rows ?? []);
    setLoading(false);
  };

  useEffect(() => { if (currentUser) fetchData(); }, [currentUser]);

  const handleSort = (key) => {
    if (sortKey === key) {
      if (sortDir === 'asc') { setSortDir('desc'); }
      else { setSortKey('empno'); setSortDir('asc'); } // reset
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const displayed = useMemo(() => {
    const q = search.toLowerCase();
    let result = data.filter(r =>
      (r.empno      ?? '').toLowerCase().includes(q) ||
      (r.lastname   ?? '').toLowerCase().includes(q) ||
      (r.firstname  ?? '').toLowerCase().includes(q) ||
      (r.jobdesc    ?? '').toLowerCase().includes(q) ||
      (r.deptname   ?? '').toLowerCase().includes(q) ||
      (r.hiredate   ?? '').toLowerCase().includes(q)
    );
    if (sortKey && sortDir) {
      result = [...result].sort((a, b) => {
        const av = (a[sortKey] ?? '').toString().toLowerCase();
        const bv = (b[sortKey] ?? '').toString().toLowerCase();
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }
    return result;
  }, [data, search, sortKey, sortDir]);

  const SortTh = ({ label, colKey, align = 'left' }) => (
    <th onClick={() => handleSort(colKey)}
      className={`px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] whitespace-nowrap cursor-pointer select-none hover:text-slate-600 ${align === 'right' ? 'text-right' : ''}`}>
      {label}<SortIcon col={colKey} sortKey={sortKey} sortDir={sortDir} />
    </th>
  );

  const colCount = isAdminOrAbove ? 10 : 9;

  return (
    <div className="space-y-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="uppercase text-2xl font-bold text-slate-900 tracking-tight">Employee Directory</h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">All active personnel on record</p>
        </div>
        {hasRight('EMP_ADD') && (
          <button onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-widest rounded shadow-sm transition-all">
            <Plus size={14} /> Add Employee
          </button>
        )}
      </div>

      {/* Search + count */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Search Employees</label>
        <div className="w-full">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by emp no, name, job, department..."
            className="w-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-400" />
        </div>
        {!loading && (
          <p className="text-xs text-slate-400 font-medium">
            {displayed.length} {displayed.length === 1 ? 'record' : 'records'} found
          </p>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg flex-1 overflow-hidden">
        <div className="overflow-x-auto h-full">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 shadow-[0_1px_0_0_#e2e8f0]">
              <tr className="border-b border-slate-100 bg-slate-50">
                <SortTh label="Emp No"      colKey="empno" />
                <SortTh label="Last Name"   colKey="lastname" />
                <SortTh label="First Name"  colKey="firstname" />
                <SortTh label="Gender"      colKey="gender" />
                <SortTh label="Current Job" colKey="jobdesc" />
                <SortTh label="Hire Date"   colKey="hiredate" />
                <SortTh label="Separation"  colKey="sepdate" />
                <SortTh label="Status"      colKey="record_status" />
                {isAdminOrAbove && (
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] whitespace-nowrap">Stamp</th>
                )}
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows cols={colCount} />
              ) : displayed.length > 0 ? (
                displayed.map((r, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-indigo-50/40 transition-colors duration-75">
                    <td className="px-6 py-4 font-mono text-slate-400 text-xs whitespace-nowrap">{r.empno}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800 text-sm whitespace-nowrap">{r.lastname}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800 text-sm whitespace-nowrap">{r.firstname}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><GenderPill g={r.gender} /></td>
                    {/* FIX: jobdesc from employee_current_job view — was showing blank before */}
                    <td className="px-6 py-4 text-slate-600 text-sm whitespace-nowrap">{r.jobdesc ?? '—'}</td>
                    <td className="px-6 py-4 font-mono text-slate-500 text-xs whitespace-nowrap">{r.hiredate}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><SepBadge date={r.sepdate} /></td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={r.record_status} /></td>
                    {isAdminOrAbove && (
                      <td className="px-6 py-4 max-w-40 overflow-hidden">
                        <span className="block truncate font-mono text-[10px] text-slate-400" title={r.stamp ?? undefined}>
                          {r.stamp || '—'}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/employees/${r.empno}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer rounded">
                          <Eye size={10} /> View
                        </Link>
                        {hasRight('EMP_EDIT') && r.record_status !== 'INACTIVE' && (
                          <button type="button" onClick={() => setEditTarget(r)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer rounded">
                            <Pencil size={10} /> Edit
                          </button>
                        )}
                        {hasRight('EMP_DEL') && r.record_status === 'ACTIVE' && (
                          <button type="button" onClick={() => setDeleteTarget(r)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-rose-500 uppercase tracking-widest border border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer rounded">
                            <Trash2 size={10} /> Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyState cols={colCount} />
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