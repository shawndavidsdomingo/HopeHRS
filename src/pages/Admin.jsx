// src/pages/Admin.jsx
// Sprint 3 — M1 PR-01: feat/admin-api
// ─────────────────────────────────────────────────────────────────────────────
// TEMPORARY TEST PAGE — replace with full UserManagementPage in M2 PR-01
//
// Purpose: allows testing of adminService.js functions (getUsers,
// activateUser, deactivateUser) before M2 builds the full UI.
//
// Remove the test buttons and console.log calls before M2 PR-01 is merged.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { getUsers, activateUser, deactivateUser } from '../lib/adminService';
import { useRights } from '../contexts/UserRightsContext';

export default function Admin() {
  const { currentUser } = useRights();
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // ── Load all users on mount ───────────────────────────────────────────────
  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    const { data, error } = await getUsers();
    if (error) {
      setMessage(`getUsers error: ${error.message}`);
    } else {
      setUsers(data);
      console.log('[Admin TEST] getUsers result:', data);
    }
    setLoading(false);
  }

  // ── Test activateUser ─────────────────────────────────────────────────────
  async function handleActivate(user) {
    setMessage('');
    const { data, error } = await activateUser(
      user.userid,
      user.user_type,
      currentUser.email
    );
    if (error) {
      const msg = `activateUser BLOCKED: ${error.message}`;
      setMessage(msg);
      console.error('[Admin TEST]', msg);
    } else {
      const msg = `activateUser SUCCESS: ${user.email} → ACTIVE`;
      setMessage(msg);
      console.log('[Admin TEST]', msg, data);
      fetchUsers(); // Refresh list
    }
  }

  // ── Test deactivateUser ───────────────────────────────────────────────────
  async function handleDeactivate(user) {
    setMessage('');
    const { data, error } = await deactivateUser(
      user.userid,
      user.user_type,
      currentUser.email
    );
    if (error) {
      const msg = `deactivateUser BLOCKED: ${error.message}`;
      setMessage(msg);
      console.error('[Admin TEST]', msg);
    } else {
      const msg = `deactivateUser SUCCESS: ${user.email} → INACTIVE`;
      setMessage(msg);
      console.log('[Admin TEST]', msg, data);
      fetchUsers(); // Refresh list
    }
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Admin Module
        </h1>
        <p className="text-xs text-amber-600 font-semibold uppercase tracking-widest mt-1">
          ⚠ Temporary Test Page — M2 PR-01 will replace this with full UI
        </p>
      </div>

      {/* Result message */}
      {message && (
        <div className={`px-4 py-3 text-sm font-medium border ${
          message.includes('BLOCKED') || message.includes('error')
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          {message}
        </div>
      )}

      {/* User table */}
      {loading ? (
        <p className="text-sm text-slate-400 animate-pulse">Loading users...</p>
      ) : (
        <div className="bg-white border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">User Type</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stamp</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                  Test Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => {
                const isSuperAdmin = user.user_type === 'SUPERADMIN';
                const isActive     = user.record_status === 'ACTIVE';

                return (
                  <tr
                    key={user.userid}
                    className={`transition-colors ${
                      isSuperAdmin ? 'bg-slate-50 opacity-60' : 'hover:bg-slate-50/50'
                    }`}
                  >
                    <td className="px-4 py-3 text-slate-700">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded ${
                        isSuperAdmin
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : user.user_type === 'ADMIN'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {user.user_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}>
                        {user.record_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-slate-400">
                      {user.stamp ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isSuperAdmin ? (
                        // SUPERADMIN rows — buttons disabled with tooltip
                        <span
                          title="SUPERADMIN accounts cannot be modified"
                          className="text-[10px] text-slate-300 font-bold uppercase tracking-widest cursor-not-allowed"
                        >
                          Protected
                        </span>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          {/* Activate button — only show if INACTIVE */}
                          {!isActive && (
                            <button
                              onClick={() => handleActivate(user)}
                              className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer rounded"
                            >
                              Activate
                            </button>
                          )}
                          {/* Deactivate button — only show if ACTIVE */}
                          {isActive && (
                            <button
                              onClick={() => handleDeactivate(user)}
                              className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-600 hover:text-white transition-all cursor-pointer rounded"
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Test instructions */}
      <div className="bg-amber-50 border border-amber-200 px-4 py-4 text-xs text-amber-800 space-y-1">
        <p className="font-bold uppercase tracking-widest">Test Instructions</p>
        <p>1. Confirm all users load in the table above — check DevTools Console for getUsers() result</p>
        <p>2. Click Activate on an INACTIVE user — confirm status changes to ACTIVE</p>
        <p>3. Click Deactivate on an ACTIVE user — confirm status changes to INACTIVE</p>
        <p>4. Confirm SUPERADMIN rows show "Protected" with no action buttons</p>
        <p>5. Confirm clicking Activate/Deactivate on a SUPERADMIN (force via console) is blocked</p>
      </div>

    </div>
  );
}