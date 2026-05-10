import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import { UserRightsProvider } from './contexts/UserRightsContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AppShell from './components/AppShell';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import DeletedItems from './pages/DeletedItems';
import Admin from './pages/Admin';
import Employees from './pages/Employees';
import TestEmployee from './tests/TestEmployee';
import TestJobHistory from './tests/TestJobHistory';
import TestJobDept from './tests/TestJobDept';
import TestRights from './tests/TestRights';

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

// ── Skeleton Row ──────────────────────────────────────────────
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

// ── JOBS ──────────────────────────────────────────────────────
const JobList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      const { data, error } = await supabase.from('job').select('*').eq('record_status', 'ACTIVE');
      if (error) console.error('Job Fetch Error:', error.message);
      setData(data || []);
      setLoading(false);
    }
    fetchJobs();
  }, []);

  const cols = [
    { header: 'Code', key: 'jobcode', className: 'font-mono text-slate-400 text-xs' },
    { header: 'Position Title', render: (r) => <span className="font-semibold text-slate-800 tracking-tight">{r.jobtitle}</span> },
    {
      header: 'Salary Range',
      render: (r) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-slate-500">${Number(r.lowsal || 0).toLocaleString()}</span>
          <span className="text-slate-300 text-xs">—</span>
          <span className="font-mono text-xs text-slate-500">${Number(r.highsal || 0).toLocaleString()}</span>
        </div>
      ),
    },
    { header: 'Status', render: (r) => <StatusBadge status={r.record_status} /> },
    { header: '', align: 'right', render: () => <button className="text-[10px] font-bold text-slate-300 hover:text-indigo-600 uppercase tracking-widest transition-colors cursor-pointer">Edit</button> },
  ];

  return <DataTable title="Job Catalogue" subtitle="Approved positions and compensation bands" columns={cols} data={data} loading={loading} />;
};

// ── DEPARTMENTS ───────────────────────────────────────────────
const DepartmentList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('department').select('*').eq('record_status', 'ACTIVE').then(({ data }) => {
      setData(data || []);
      setLoading(false);
    });
  }, []);

  const cols = [
    { header: 'Dept Code', key: 'deptno', className: 'font-mono text-slate-400 text-xs' },
    { header: 'Department Name', render: (r) => <span className="font-semibold text-slate-800">{r.deptname}</span> },
    { header: 'Location', key: 'location', className: 'text-slate-500 text-sm' },
    { header: 'Status', render: (r) => <StatusBadge status={r.record_status} /> },
    { header: '', align: 'right', render: () => <button className="text-[10px] font-bold text-slate-300 hover:text-indigo-600 uppercase tracking-widest transition-colors cursor-pointer">Edit</button> },
  ];

  return <DataTable title="Departments" subtitle="Organizational units and locations" columns={cols} data={data} loading={loading} />;
};

// ── JOB HISTORY ───────────────────────────────────────────────
const JobHistoryList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      const { data, error } = await supabase.from('jobhistory').select('*');
      if (error) console.error('Database Error:', error.message);
      setData(data || []);
      setLoading(false);
    }
    fetchHistory();
  }, []);

  const cols = [
    { header: 'Emp No', key: 'empno', className: 'font-mono text-slate-400 text-xs' },
    { header: 'Job Code', key: 'jobcode', className: 'font-mono text-indigo-400 text-xs font-bold' },
    { header: 'Department', key: 'deptcode', className: 'text-slate-500 text-sm' },
    { header: 'Effective Date', key: 'effdate', className: 'font-mono text-slate-500 text-xs' },
    { header: 'Salary', render: (r) => <span className="font-mono text-sm text-slate-700 font-semibold">${Number(r.salary || 0).toLocaleString()}</span> },
    { header: 'Status', render: (r) => <StatusBadge status={r.record_status} /> },
  ];

  return <DataTable title="Employment History" subtitle="Complete job assignment records across all departments" columns={cols} data={data} loading={loading} />;
};

// ── APP ROOT ──────────────────────────────────────────────────
function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingError, setPendingError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      checkLoginGuard(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      checkLoginGuard(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkLoginGuard = async (session) => {
    if (session) {
      const { data: userRow, error } = await supabase
        .from('hr_user')
        .select('record_status, user_type')
        .eq('email', session.user.email)
        .single();

      if (error) {
        console.error('[checkLoginGuard] Query error:', error.message, '| hint:', error.hint, '| details:', error.details);
      } else {
        console.log('[checkLoginGuard] Found user row:', userRow);
      }

      if (userRow?.record_status === 'ACTIVE') {
        setPendingError('');
        setSession(session);
      } else {
        await supabase.auth.signOut();
        setPendingError(
          error
            ? 'Unable to verify your account. Please contact your HR administrator.'
            : 'Your account is pending activation by an HR administrator.'
        );
        setSession(null);
      }
    } else {
      setSession(null);
    }
    setLoading(false);
  };

  if (loading) return null;

  return (
    <UserRightsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={
            !session
              ? <Login pendingError={pendingError} />
              : <Navigate to="/employees" replace />
          } />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          <Route element={session ? <AppShell /> : <Navigate to="/login" replace />}>
            <Route path="/" element={<Navigate to="/employees" replace />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/departments" element={<DepartmentList />} />
            <Route path="/jobs" element={<JobList />} />
            <Route path="/jobhistory" element={<JobHistoryList />} />

            {/* PR-04: adminOnly route guard — USER accounts redirected to /employees */}
            <Route path="/deleted-items" element={<ProtectedRoute adminOnly><DeletedItems /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />

          {/* [TESTING ONLY - REMOVE BEFORE PUSH] */}
          <Route path="/test-employee" element={<TestEmployee />} />
          <Route path="/test-jobhistory" element={<TestJobHistory />} />
          <Route path="/test-jobdept" element={<TestJobDept />} />
          <Route path="/test-rights" element={<TestRights />} />

        </Routes>
      </BrowserRouter>
    </UserRightsProvider>
  );
}

export default App;