// src/pages/Admin.jsx
// Sprint 3 — M2 PR-01: feat/ui-admin-users
// PR-03: fix/ui-final-polish — mobile responsive table, stacked header
// M4 PR-01: feat/rights-admin-module — canManage gated by isSuperAdmin
// M4 PR-02: feat/rights-superadmin-guard — SUPERADMIN rows: buttons disabled + tooltip
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { getUsers, activateUser, deactivateUser } from '../lib/adminService';
import { useRights } from '../contexts/UserRightsContext';

const UserTypeBadge = ({ type }) => {
  const map = {
    SUPERADMIN: 'bg-purple-50 text-purple-700 border border-purple-200',
    ADMIN:      'bg-blue-50 text-blue-700 border border-blue-200',
    USER:       'bg-slate-100 text-slate-500 border border-slate-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase ${map[type] ?? map.USER}`}>
      {type}
    </span>
  );
};

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


const SkeletonRows = ({ cols, count = 6 }) => (
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
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">No users found</p>
      </div>
    </td>
  </tr>
);

export default function Admin() {
  const { currentUser, isSuperAdmin } = useRights();
  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [toast, setToast]             = useState(null);
  const [actingOn, setActingOn]       = useState(null);

  // M4 PR-01: only SUPERADMIN can perform activate/deactivate actions
  const canManage = isSuperAdmin;
  const cols = 5;

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await getUsers();
    if (error) showToast('error', `Failed to load users: ${error.message}`);
    else setUsers(data);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleActivate = async (user) => {
    setActingOn(user.userid);
    const { error } = await activateUser(user.userid, user.user_type, currentUser.email);
    if (error) showToast('error', `Activate failed: ${error.message}`);
    else { showToast('success', `${user.email} has been activated.`); fetchUsers(); }
    setActingOn(null);
  };

  const handleDeactivate = async (user) => {
    setActingOn(user.userid);
    const { error } = await deactivateUser(user.userid, user.user_type, currentUser.email);
    if (error) showToast('error', `Deactivate failed: ${error.message}`);
    else { showToast('success', `${user.email} has been deactivated.`); fetchUsers(); }
    setActingOn(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Area</h1>
          {/* M4 PR-01: view-only notice for ADMIN users */}
          {!canManage && (
            <p className="mt-1 text-xs text-slate-400 font-medium">
              View only — activate/deactivate requires SUPERADMIN access.
            </p>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`mb-5 px-4 py-3 text-sm font-medium border ${
          toast.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-700'
            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          {toast.message}
        </div>
      )}

      {!loading && (
        <p className="text-xs text-slate-400 font-medium mb-3">
          {users.length} {users.length === 1 ? 'user' : 'users'} found
        </p>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] whitespace-nowrap">User ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] whitespace-nowrap">Email</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] whitespace-nowrap">User Type</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] whitespace-nowrap">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows cols={cols} />
              ) : users.length > 0 ? (
                users.map((user) => {
                  // M4 PR-02: SUPERADMIN guard — checked per-row, regardless of who is logged in
                  const isSuper  = user.user_type === 'SUPERADMIN';
                  const isActive = user.record_status === 'ACTIVE';
                  const isActing = actingOn === user.userid;

                  return (
                    <tr
                      key={user.userid}
                      className={`border-b border-slate-100 last:border-0 transition-colors duration-75 ${
                        isSuper ? 'bg-slate-50/60' : 'hover:bg-indigo-50/40'
                      }`}
                    >
                      <td className="px-6 py-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {user.display_id ?? user.userid.slice(0, 8) + '...'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><UserTypeBadge type={user.user_type} /></td>
                      <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={user.record_status} /></td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">

                                        {/* M4 PR-02: SUPERADMIN rows — always protected, regardless of who is logged in */}
                        {isSuper ? (
                          <span
                            title="SUPERADMIN accounts cannot be modified"
                            className="text-[10px] text-slate-300 font-bold uppercase tracking-widest cursor-not-allowed select-none"
                          >
                            Protected
                          </span>

                        ) : canManage ? (
                          /* SUPERADMIN logged in — active action buttons */
                          <div className="flex items-center justify-end gap-2">
                            {!isActive && (
                              <button
                                onClick={() => handleActivate(user)}
                                disabled={isActing}
                                className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer disabled:opacity-40"
                              >
                                {isActing ? '...' : 'Activate'}
                              </button>
                            )}
                            {isActive && (
                              <button
                                onClick={() => handleDeactivate(user)}
                                disabled={isActing}
                                className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-600 hover:text-white transition-all cursor-pointer disabled:opacity-40"
                              >
                                {isActing ? '...' : 'Deactivate'}
                              </button>
                            )}
                          </div>

                        ) : (
                          /* ADMIN logged in — no action access */
                          <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">—</span>
                        )}

                      </td>
                    </tr>
                  );
                })
              ) : (
                <EmptyState cols={cols} />
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
