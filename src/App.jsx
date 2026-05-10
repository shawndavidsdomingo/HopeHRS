import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRights } from '../contexts/UserRightsContext';

// ── Status Badge ──────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    ACTIVE:   'bg-emerald-50 text-emerald-700 border border-emerald-200',
    INACTIVE: 'bg-slate-100 text-slate-400 border border-slate-200',
    PENDING:  'bg-amber-50 text-amber-700 border border-amber-200',
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
const EmptyState = ({ cols, label = 'No records found' }) => (
  <tr>
    <td colSpan={cols} className="px-6 py-24 text-center">
      <div className="flex flex-col items-center gap-2">
        <div className="w-10 h-10 border-2 border-dashed border-slate-200 flex items-center justify-center">
          <span className="text-slate-300 text-lg">∅</span>
        </div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
    </td>
  </tr>
);

// ── DataTable ─────────────────────────────────────────────────
const DataTable = ({ title, subtitle, columns, data, loading, actionLabel = 'New Entry', onAction }) => (
  <div>
    <div className="flex items-end justify-between mb-6 pb-5 border-b border-slate-200">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-slate-400 mt-1 font-medium">{subtitle}</p>}
      </div>
      <button
        onClick={onAction}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-xs font-bold tracking-[0.12em] uppercase transition-colors duration-150 cursor-pointer shadow-sm"
      >
        <span className="text-base leading-none">+</span> {actionLabel}
      </button>
    </div>

    {!loading && (
      <p className="text-xs text-slate-400 font-medium mb-3">
        {data.length} {data.length === 1 ? 'record' : 'records'} found
      </p>
    )}

    <div className="bg-white border border-slate-200 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {columns.map((col, idx) => (
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
            <SkeletonRows cols={columns.length} />
          ) : data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-slate-100 last:border-0 hover:bg-indigo-50/40 transition-colors duration-75"
              >
                {columns.map((col, colIndex) => (
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
            <EmptyState cols={columns.length} />
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// ── Employee List (PR-01) ─────────────────────────────────────
export default function Employees() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useRights();

  const isAdminOrSuper = ['ADMIN', 'SUPERADMIN'].includes(currentUser?.user_type);

  useEffect(() => {
    // INACTIVE rows hidden for USER; ADMIN/SUPERADMIN see all
    let query = supabase.from('employee').select('*');
    if (!isAdminOrSuper) {
      query = query.eq('record_status', 'ACTIVE');
    }

    query.then(({ data, error }) => {
      if (error) console.error('[Employees] Fetch error:', error.message);
      setData(data || []);
      setLoading(false);
    });
  }, [isAdminOrSuper]);

  const cols = [
    { header: 'Emp No',     key: 'empno',       className: 'font-mono text-slate-400 text-xs' },
    { header: 'Last Name',  key: 'lastname',     className: 'font-semibold text-slate-800 tracking-tight' },
    { header: 'First Name', key: 'firstname',    className: 'text-slate-700' },
    { header: 'Gender',     render: (r) => <GenderPill g={r.gender} /> },
    { header: 'Hire Date',  key: 'hiredate',     className: 'text-slate-500 font-mono text-xs' },
    { header: 'Sep Date',   render: (r) => <SepBadge date={r.sepdate} /> },
    { header: 'Current Job', key: 'current_job', className: 'text-slate-500 text-sm' },
    // Stamp column — ADMIN/SUPERADMIN only (PR-01 gating)
    ...(isAdminOrSuper
      ? [{ header: 'Stamp', key: 'stamp', className: 'font-mono text-slate-400 text-xs' }]
      : []
    ),
    { header: 'Status', render: (r) => <StatusBadge status={r.record_status} /> },
    {
      header: '',
      align: 'right',
      render: () => (
        <button className="text-[10px] font-bold text-slate-300 hover:text-indigo-600 uppercase tracking-widest transition-colors cursor-pointer">
          Edit
        </button>
      ),
    },
  ];

  return (
    <DataTable
      title="Employee Directory"
      subtitle="All personnel on record"
      columns={cols}
      data={data}
      loading={loading}
      actionLabel="Add Employee"
    />
  );
}