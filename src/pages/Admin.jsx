// src/pages/Admin.jsx
// Sprint 3 — M1 PR-01: feat/admin-api
// Sprint 3 — M3 PR-02: updated to show display_id instead of raw Auth UUID
// ─────────────────────────────────────────────────────────────────────────────
// UserManagementPage:
//   - Table of all users (display_id, email, user_type, record_status)
//   - Activate and Deactivate buttons per row
//   - SUPERADMIN rows fully disabled with tooltip
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { getUsers, activateUser, deactivateUser } from '../lib/adminService';
import { useRights } from '../contexts/UserRightsContext';

export default function Admin() {
  const { currentUser } = useRights();
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    const { data, error } = await getUsers();
    if (error) setMessage(`Error loading users: ${error.message}`);
    else setUsers(data);
    setLoading(false);
  }

  async function handleActivate(user) {
    setMessage('');
    const { error } = await activateUser(user.userid, user.user_type, currentUser.email);
    if (error) {
      setMessage(`Blocked: ${error.message}`);
    } else {
      setMessage(`${user.email} activated successfully.`);
      fetchUsers();
    }
  }

  async function handleDeactivate(user) {
    setMessage('');
    const { error } = await deactivateUser(user.userid, user.user_type, currentUser.email);
    if (error) {
      setMessage(`Blocked: ${error.message}`);
    } else {
      setMessage(`${user.email} deactivated successfully.`);
      fetchUsers();
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-end justify-between pb-5 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">User Management</h2>
          <p className="text-sm text-slate-400 mt-1 font-medium">Activate or deactivate HR system accounts</p>
        </div>
      </div>

      {/* Result message */}
      {message && (
        <div className={`px-4 py-3 text-sm font-medium border ${
          message.toLowerCase().includes('blocked') || message.toLowerCase().includes('error')
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          {message}
        </div>
      )}

      {/* Record count */}
      {!loading && (
        <p className="text-xs text-slate-400 font-medium">
          {users.length} {users.length === 1 ? 'user' : 'users'} found
        </p>
      )}

      {/* User table */}
      <div className="bg-white border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {/* display_id instead of raw Auth UUID */}
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em]">User ID</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em]">Email</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em]">Role</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em]">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Skeleton rows
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-100">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-3 bg-slate-100 animate-pulse" style={{ width: '60%' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : users.length > 0 ? (
              users.map((user) => {
                const isSuperAdmin = user.user_type === 'SUPERADMIN';
                const isActive     = user.record_status === 'ACTIVE';

                return (
                  <tr
                    key={user.userid}
                    className={`border-b border-slate-100 last:border-0 transition-colors ${
                      isSuperAdmin
                        ? 'bg-slate-50/60 opacity-70'
                        : 'hover:bg-indigo-50/40'
                    }`}
                  >
                    {/* display_id — human readable (user1, user2, ...) */}
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {user.display_id ?? user.userid.slice(0, 8) + '...'}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">{user.email}</td>

                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                        isSuperAdmin
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : user.user_type === 'ADMIN'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {user.user_type}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}>
                        {user.record_status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      {isSuperAdmin ? (
                        // SUPERADMIN rows — fully disabled with tooltip per spec
                        <span
                          title="SUPERADMIN accounts cannot be modified"
                          className="text-[10px] text-slate-300 font-bold uppercase tracking-widest cursor-not-allowed select-none"
                        >
                          Protected
                        </span>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          {!isActive && (
                            <button
                              onClick={() => handleActivate(user)}
                              className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
                            >
                              Activate
                            </button>
                          )}
                          {isActive && (
                            <button
                              onClick={() => handleDeactivate(user)}
                              className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">No users found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}