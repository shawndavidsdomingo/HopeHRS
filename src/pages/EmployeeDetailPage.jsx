// src/pages/EmployeeDetailPage.jsx
// Sprint 2 — M2 PR-02: feat/ui-employee-detail-jh
// M4 PR-02: feat/rights-employee-jh — migrated to hasRight() from UserRightsContext
// ─────────────────────────────────────────────────────────────────────────────
// Features:
//   - Profile view for a single employee (fetched by empno from URL params)
//   - Embedded JobHistoryPanel showing all job history rows sorted by effDate desc
//   - jobCode → jobDesc and deptCode → deptName resolved via lookup maps
//   - AddJobHistoryForm embedded in page (JH_ADD gated via hasRight)
//   - EditJobHistoryModal per row (JH_EDIT gated via hasRight)
//   - Soft-delete button per row (JH_DEL gated via hasRight)
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRights } from '../contexts/UserRightsContext';
import { supabase } from '../lib/supabaseClient';
import { getJobHistory, addJobHistory, updateJobHistory, softDeleteJobHistory } from '../lib/jobHistoryService';
import { getJobs } from '../lib/jobService';
import { getDepts } from '../lib/departmentService';

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

// ── Skeleton Rows ─────────────────────────────────────────────
const SkeletonRows = ({ cols, count = 5 }) => (
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
    <td colSpan={cols} className="px-6 py-16 text-center">
      <div className="flex flex-col items-center gap-2">
        <div className="w-10 h-10 border-2 border-dashed border-slate-200 flex items-center justify-center">
          <span className="text-slate-300 text-lg">∅</span>
        </div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">No job history found</p>
      </div>
    </td>
  </tr>
);

// ── Add Job History Form ──────────────────────────────────────
// M4 PR-02: hasRight check moved to parent — this form only renders when JH_ADD is granted
const AddJobHistoryForm = ({ empno, jobs, depts, onSuccess }) => {
  const { currentUser } = useRights();
  const [form, setForm] = useState({ jobcode: '', effdate: '', salary: '', deptcode: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.jobcode || !form.effdate || !form.salary || !form.deptcode) {
      setError('All fields are required.');
      return;
    }
    setSaving(true);
    setError('');
    const { error: err } = await addJobHistory(
      { empno, ...form, salary: Number(form.salary) },
      currentUser.email
    );
    setSaving(false);
    if (err) {
      setError(err.message);
    } else {
      setForm({ jobcode: '', effdate: '', salary: '', deptcode: '' });
      onSuccess();
    }
  };

  return (
    <div className="border border-slate-200 bg-slate-50 p-5 mt-6">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.18em] mb-4">Add Job History Entry</h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Job</label>
          <select
            value={form.jobcode}
            onChange={(e) => setForm(f => ({ ...f, jobcode: e.target.value }))}
            className="border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-indigo-400"
          >
            <option value="">Select job...</option>
            {jobs.map(j => (
              <option key={j.jobcode} value={j.jobcode}>{j.jobcode} — {j.jobdesc}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department</label>
          <select
            value={form.deptcode}
            onChange={(e) => setForm(f => ({ ...f, deptcode: e.target.value }))}
            className="border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-indigo-400"
          >
            <option value="">Select dept...</option>
            {depts.map(d => (
              <option key={d.deptcode} value={d.deptcode}>{d.deptcode} — {d.deptname}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Effective Date</label>
          <input
            type="date"
            value={form.effdate}
            onChange={(e) => setForm(f => ({ ...f, effdate: e.target.value }))}
            className="border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-indigo-400"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Salary</label>
          <input
            type="number"
            value={form.salary}
            onChange={(e) => setForm(f => ({ ...f, salary: e.target.value }))}
            placeholder="0"
            className="border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-indigo-400"
          />
        </div>
      </div>
      {error && <p className="text-xs text-rose-500 mt-3">{error}</p>}
      <div className="mt-4">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2 text-xs font-bold tracking-[0.12em] uppercase transition-colors cursor-pointer"
        >
          {saving ? 'Saving...' : 'Add Entry'}
        </button>
      </div>
    </div>
  );
};

// ── Edit Job History Modal ────────────────────────────────────
// M4 PR-02: hasRight check moved to parent — this modal only renders when JH_EDIT is granted
const EditJobHistoryModal = ({ row, depts, onClose, onSuccess }) => {
  const { currentUser } = useRights();
  const [form, setForm] = useState({ salary: row.salary, deptcode: row.deptcode });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    const pk = { empno: row.empno, jobcode: row.jobcode, effdate: row.effdate };
    const { error: err } = await updateJobHistory(
      pk,
      { salary: Number(form.salary), deptcode: form.deptcode },
      currentUser.email
    );
    setSaving(false);
    if (err) {
      setError(err.message);
    } else {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white border border-slate-200 w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Edit Job History</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-600 text-lg font-bold cursor-pointer">✕</button>
        </div>

        <div className="text-xs text-slate-400 font-mono mb-4 space-y-1">
          <p>Emp No: <span className="text-slate-600">{row.empno}</span></p>
          <p>Job Code: <span className="text-slate-600">{row.jobcode}</span></p>
          <p>Eff Date: <span className="text-slate-600">{row.effdate}</span></p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department</label>
            <select
              value={form.deptcode}
              onChange={(e) => setForm(f => ({ ...f, deptcode: e.target.value }))}
              className="border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-indigo-400"
            >
              {depts.map(d => (
                <option key={d.deptcode} value={d.deptcode}>{d.deptcode} — {d.deptname}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Salary</label>
            <input
              type="number"
              value={form.salary}
              onChange={(e) => setForm(f => ({ ...f, salary: e.target.value }))}
              className="border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-indigo-400"
            />
          </div>
        </div>

        {error && <p className="text-xs text-rose-500 mt-3">{error}</p>}

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest cursor-pointer">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2 text-xs font-bold tracking-[0.12em] uppercase transition-colors cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Employee Detail Page ──────────────────────────────────────
export default function EmployeeDetailPage() {
  const { empno } = useParams();
  const navigate = useNavigate();

  // M4 PR-02: destructure hasRight instead of raw rights map
  const { currentUser, hasRight } = useRights();

  const [employee, setEmployee]       = useState(null);
  const [history, setHistory]         = useState([]);
  const [jobs, setJobs]               = useState([]);
  const [depts, setDepts]             = useState([]);
  const [loadingEmp, setLoadingEmp]   = useState(true);
  const [loadingJH, setLoadingJH]     = useState(true);
  const [editTarget, setEditTarget]   = useState(null);
  const [deletingPk, setDeletingPk]   = useState(null);

  const jobMap  = Object.fromEntries(jobs.map(j => [j.jobcode, j.jobdesc]));
  const deptMap = Object.fromEntries(depts.map(d => [d.deptcode, d.deptname]));

  const userType = currentUser?.user_type;

  // Fetch employee profile
  useEffect(() => {
    if (!empno) return;
    supabase
      .from('employee')
      .select('empno, lastname, firstname, gender, birthdate, hiredate, sepdate, record_status, stamp')
      .eq('empno', empno)
      .single()
      .then(({ data, error }) => {
        if (error) console.error('[EmployeeDetailPage] employee fetch:', error.message);
        setEmployee(data ?? null);
        setLoadingEmp(false);
      });
  }, [empno]);

  // Fetch job history
  const fetchHistory = async () => {
    setLoadingJH(true);
    const { data } = await getJobHistory(empno, userType);
    setHistory(data);
    setLoadingJH(false);
  };

  // Fetch jobs + depts for lookup maps and form dropdowns
  useEffect(() => {
    if (!userType) return;
    getJobs(userType).then(({ data }) => setJobs(data));
    getDepts(userType).then(({ data }) => setDepts(data));
    fetchHistory();
  }, [userType, empno]);

  // Soft delete a job history row
  const handleSoftDelete = async (row) => {
    const pk = { empno: row.empno, jobcode: row.jobcode, effdate: row.effdate };
    setDeletingPk(pk);
    await softDeleteJobHistory(pk, currentUser.email);
    setDeletingPk(null);
    fetchHistory();
  };

  // M4 PR-02: hasRight('JH_EDIT') and hasRight('JH_DEL') replace rights.JH_EDIT === 1 etc.
  const jhCols = [
    { header: 'Job Code',  render: (r) => <span className="font-mono text-xs text-indigo-500 font-bold">{r.jobcode}</span> },
    { header: 'Job Desc',  render: (r) => <span className="text-slate-700">{jobMap[r.jobcode] ?? '—'}</span> },
    { header: 'Dept Code', render: (r) => <span className="font-mono text-xs text-slate-400">{r.deptcode}</span> },
    { header: 'Dept Name', render: (r) => <span className="text-slate-700">{deptMap[r.deptcode] ?? '—'}</span> },
    { header: 'Eff Date',  render: (r) => <span className="font-mono text-xs text-slate-500">{r.effdate}</span> },
    { header: 'Salary',    render: (r) => <span className="font-mono text-sm font-semibold text-slate-700">${Number(r.salary || 0).toLocaleString()}</span> },
    { header: 'Status',    render: (r) => <StatusBadge status={r.record_status} /> },

    // Actions column — only rendered if user has at least one of JH_EDIT or JH_DEL
    ...(hasRight('JH_EDIT') || hasRight('JH_DEL') ? [{
      header: '',
      align: 'right',
      render: (r) => {
        const pk = { empno: r.empno, jobcode: r.jobcode, effdate: r.effdate };
        const isDeleting = deletingPk &&
          deletingPk.empno === pk.empno &&
          deletingPk.jobcode === pk.jobcode &&
          deletingPk.effdate === pk.effdate;
        return (
          <div className="flex items-center justify-end gap-3">
            {/* M4 PR-02: hasRight('JH_EDIT') replaces rights.JH_EDIT === 1 */}
            {hasRight('JH_EDIT') && (
              <button
                onClick={() => setEditTarget(r)}
                className="text-[10px] font-bold text-slate-300 hover:text-indigo-600 uppercase tracking-widest transition-colors cursor-pointer"
              >
                Edit
              </button>
            )}
            {/* M4 PR-02: hasRight('JH_DEL') replaces rights.JH_DEL === 1 */}
            {hasRight('JH_DEL') && r.record_status === 'ACTIVE' && (
              <button
                onClick={() => handleSoftDelete(r)}
                disabled={isDeleting}
                className="text-[10px] font-bold text-slate-300 hover:text-rose-500 uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-40"
              >
                {isDeleting ? '...' : 'Delete'}
              </button>
            )}
          </div>
        );
      },
    }] : []),
  ];

  if (loadingEmp) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm text-slate-400 font-medium">Employee not found.</p>
        <button onClick={() => navigate('/employees')} className="mt-4 text-xs font-bold text-indigo-500 hover:text-indigo-700 uppercase tracking-widest cursor-pointer">
          ← Back to Employees
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Back link */}
      <button
        onClick={() => navigate('/employees')}
        className="text-xs font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors cursor-pointer mb-6 inline-flex items-center gap-1"
      >
        ← Back to Employees
      </button>

      {/* Employee Profile Card */}
      <div className="border border-slate-200 bg-white p-6 mb-8">
        <div className="flex items-start justify-between mb-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {employee.lastname}, {employee.firstname}
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-1">{employee.empno}</p>
          </div>
          <StatusBadge status={employee.record_status} />
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4 text-sm">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Gender</p>
            <p className="text-slate-700">{employee.gender === 'M' ? 'Male' : 'Female'}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Birthdate</p>
            <p className="font-mono text-slate-700">{employee.birthdate ?? '—'}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Hire Date</p>
            <p className="font-mono text-slate-700">{employee.hiredate ?? '—'}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Sep Date</p>
            <p className="font-mono text-slate-700">{employee.sepdate ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* Job History Panel */}
      <div>
        <div className="flex items-end justify-between mb-4 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Job History</h3>
            {!loadingJH && (
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {history.length} {history.length === 1 ? 'record' : 'records'} found
              </p>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {jhCols.map((col, idx) => (
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
              {loadingJH ? (
                <SkeletonRows cols={jhCols.length} />
              ) : history.length > 0 ? (
                history.map((row, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-indigo-50/40 transition-colors duration-75">
                    {jhCols.map((col, j) => (
                      <td
                        key={j}
                        className={`px-6 py-4 text-sm ${col.className || 'text-slate-600'} ${col.align === 'right' ? 'text-right' : ''}`}
                      >
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <EmptyState cols={jhCols.length} />
              )}
            </tbody>
          </table>
        </div>

        {/* Add Job History Form — M4 PR-02: hasRight('JH_ADD') replaces rights.JH_ADD === 1 */}
        {hasRight('JH_ADD') && (
          <AddJobHistoryForm
            empno={empno}
            jobs={jobs}
            depts={depts}
            onSuccess={fetchHistory}
          />
        )}
      </div>

      {/* Edit Modal — only mounts when editTarget is set, already gated by hasRight('JH_EDIT') above */}
      {editTarget && (
        <EditJobHistoryModal
          row={editTarget}
          depts={depts}
          onClose={() => setEditTarget(null)}
          onSuccess={fetchHistory}
        />
      )}
    </div>
  );
}
