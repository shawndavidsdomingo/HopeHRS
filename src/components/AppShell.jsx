// src/components/AppShell.jsx
// Sprint 3 fix: Deleted Items and Admin links now visible to ADMIN and SUPERADMIN
// Root cause: AppShell was checking currentUser?.user_type === 'SUPERADMIN'
// (SUPERADMIN only) instead of using isAdminOrAbove from UserRightsContext.
// Per spec: ADMIN can recover deleted items and access the Admin module.
// ─────────────────────────────────────────────────────────────────────────────

import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Users, Briefcase, Building, History, LogOut, ChevronRight, Trash2, Shield } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useRights } from '../contexts/UserRightsContext';

export default function AppShell() {
  const navigate  = useNavigate();
  const location  = useLocation();

  // FIX: destructure isAdminOrAbove so ADMIN also sees Deleted Items + Admin
  // Previously: const { currentUser } = useRights() then checked user_type === 'SUPERADMIN'
  // Now: isAdminOrAbove is true for both ADMIN and SUPERADMIN
  const { currentUser, isAdminOrAbove } = useRights();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Base items — visible to all authenticated users (USER, ADMIN, SUPERADMIN)
  const baseMenuItems = [
    { path: '/employees',   label: 'Employees',     icon: <Users size={15} /> },
    { path: '/jobhistory',  label: 'Job History',   icon: <History size={15} /> },
    { path: '/jobs',        label: 'Job Catalogue', icon: <Briefcase size={15} /> },
    { path: '/departments', label: 'Departments',   icon: <Building size={15} /> },
  ];

  // Deleted Items and Admin — visible to ADMIN and SUPERADMIN only
  // Route guard in ProtectedRoute.jsx still blocks USER even if they type the URL directly
  const menuItems = [...baseMenuItems];
  if (isAdminOrAbove) {
    menuItems.push({ path: '/deleted-items', label: 'Deleted Items', icon: <Trash2 size={15} /> });
    menuItems.push({ path: '/admin',         label: 'Admin',         icon: <Shield size={15} /> });
  }

  const currentPage = menuItems.find(i => location.pathname.startsWith(i.path))?.label || 'Dashboard';

  return (
    <div className="flex h-screen w-screen bg-slate-50 font-sans text-slate-900">

      {/* ── Sidebar ── */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="h-14 flex items-center px-6 border-b border-slate-200">
          <span className="text-sm font-black text-slate-900 tracking-[0.2em] uppercase">HR Portal</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded transition-all duration-150 ${
                location.pathname.startsWith(item.path)
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {item.icon}
              <span className="tracking-wide">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Sign Out */}
        <div className="px-3 pb-5 pt-2 border-t border-slate-200 space-y-1">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-xs font-semibold text-slate-400 border-l-2 border-transparent hover:bg-white hover:text-red-500 hover:border-red-400 hover:shadow-sm transition-all duration-100 cursor-pointer"
          >
            <LogOut size={15} />
            <span className="tracking-wide">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>Portal</span>
            <ChevronRight size={11} className="text-slate-300" />
            <span className="text-slate-700 font-semibold">{currentPage}</span>
          </div>
          <div className="w-7 h-7 bg-slate-900 flex items-center justify-center text-white rounded-full text-xs font-bold uppercase">
            {currentUser?.email?.charAt(0) || 'U'}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
          <Outlet />
        </main>
      </div>

    </div>
  );
}