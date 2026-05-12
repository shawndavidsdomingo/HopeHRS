// src/App.jsx
import { useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import { UserRightsProvider } from './contexts/UserRightsContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AppShell from './components/AppShell';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import Employees from './pages/Employees';
import Jobs from './pages/Jobs';
import Departments from './pages/Departments';
import JobHistory from './pages/JobHistory';
import DeletedItems from './pages/DeletedItems';
import EmployeeDetailPage from './pages/EmployeeDetailPage'
import Admin from './pages/Admin';
import HeadcountByDeptPage from './pages/HeadcountByDeptPage';
import SalaryReportPage from './pages/SalaryReportPage';
import EmployeeHistoryReportPage from './pages/EmployeeHistoryReportPage';

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

// ── Gender pill ───────────────────────────────────────────────
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

// ── APP ROOT ──────────────────────────────────────────────────
function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingError, setPendingError] = useState('');
  
  // FIX: This stops the app from refreshing the database every time you switch tabs
  const activeUserId = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      checkLoginGuard(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Ignore background refreshes
      if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') return;
      checkLoginGuard(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkLoginGuard = async (session) => {
    if (!session) {
      activeUserId.current = null;
      setSession(null);
      setLoading(false);
      return;
    }

    // If we already verified this exact user, don't run the DB query again
    if (activeUserId.current === session.user.id) {
      setSession(session);
      setLoading(false);
      return;
    }

    // FIX: Use maybeSingle() instead of single()
    // .single() throws an error when 0 rows are found — this caused new users
    // to be signed out immediately before provision_new_user() could finish.
    // .maybeSingle() returns null when no row exists — allowing us to show
    // the correct "pending activation" message instead of signing out silently.
    const { data: userRow, error } = await supabase
      .from('hr_user')
      .select('record_status, user_type')
      .eq('email', session.user.email)
      .maybeSingle();

    if (error) {
      console.error('[checkLoginGuard] Query error:', error.message);
    }

    if (userRow?.record_status === 'ACTIVE') {
      // User exists and is ACTIVE — allow through
      setPendingError('');
      setSession(session);
      activeUserId.current = session.user.id;
    } else {
      // User is INACTIVE (pending activation) OR not found in hr_user yet
      await supabase.auth.signOut();
      activeUserId.current = null;
      setPendingError(
        // No row found — provision_new_user() may not have run yet, or
        // the email doesn't match any hr_user row
        !userRow
          ? 'Your account is pending activation by an HR administrator.'
          // Row found but INACTIVE — normal pending state
          : 'Your account is pending activation by an HR administrator.'
      );
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

            {/* M2 PR-01: Full EmployeeListPage with rights gating */}
            <Route path="/employees" element={<Employees />} />

            <Route path="/employees/:empno" element={<EmployeeDetailPage />} />

            {/* M2 PR-03: Full JobListPage + DeptListPage with rights gating */}
            <Route path="/departments" element={<Departments />} />
            <Route path="/jobs" element={<Jobs />} />
            {/* M2 PR-03: Moved JobHistoryList out of App.jsx into its own page */}
            <Route path="/jobhistory" element={<JobHistory />} />

            {/* PR-04: adminOnly route guard */}
            <Route path="/deleted-items" element={<ProtectedRoute adminOnly><DeletedItems /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
            <Route path="/reports/headcount" element={<ProtectedRoute adminOnly><HeadcountByDeptPage /></ProtectedRoute>} />
            <Route path="/reports/salary" element={<ProtectedRoute adminOnly><SalaryReportPage /></ProtectedRoute>} />
            <Route path="/reports/employee-history" element={<ProtectedRoute adminOnly><EmployeeHistoryReportPage /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </UserRightsProvider>
  );
}

export default App;