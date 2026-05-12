// src/components/AppShell.jsx
// Sprint 3 — PR-03: fix/ui-final-polish
// M4 PR-01: feat/rights-admin-module — Admin sidebar link gated by hasRight('ADM_USER')
// M4: Admin link positioned below Deleted Items per sidebar order requirement
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Users, Briefcase, Building, History, LogOut, ChevronRight, Trash2, Shield, BarChart2, Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useRights } from '../contexts/UserRightsContext';

export default function AppShell() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { currentUser, isAdminOrAbove, hasRight } = useRights();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const baseMenuItems = [
    { path: '/employees',   label: 'Employees',     icon: <Users size={15} /> },
    { path: '/jobhistory',  label: 'Job History',   icon: <History size={15} /> },
    { path: '/jobs',        label: 'Job Catalogue', icon: <Briefcase size={15} /> },
    { path: '/departments', label: 'Departments',   icon: <Building size={15} /> },
  ];

  const menuItems = [...baseMenuItems];

  if (isAdminOrAbove) {
    // M4: Deleted Items comes first, then Admin (if ADM_USER right), then reports
    menuItems.push({ path: '/deleted-items', label: 'Deleted Items', icon: <Trash2 size={15} /> });
  }

  // M4 PR-01: Admin link gated by ADM_USER right, positioned directly below Deleted Items
  if (hasRight('ADM_USER')) {
    menuItems.push({ path: '/admin', label: 'Admin', icon: <Shield size={15} /> });
  }

  if (isAdminOrAbove) {
    menuItems.push({ path: '/reports/headcount',        label: 'Headcount Report', icon: <BarChart2 size={15} /> });
    menuItems.push({ path: '/reports/salary',           label: 'Salary Report',    icon: <BarChart2 size={15} /> });
    menuItems.push({ path: '/reports/employee-history', label: 'History Report',   icon: <BarChart2 size={15} /> });
  }

  const currentPage = menuItems.find(i => location.pathname.startsWith(i.path))?.label || 'Dashboard';

  const NavLinks = () => (
    <>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
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
      <div className="px-3 pb-5 pt-2 border-t border-slate-200 space-y-1">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-xs font-semibold text-slate-400 border-l-2 border-transparent hover:bg-white hover:text-red-500 hover:border-red-400 hover:shadow-sm transition-all duration-100 cursor-pointer"
        >
          <LogOut size={15} />
          <span className="tracking-wide">Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen w-screen bg-slate-50 font-sans text-slate-900">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0">
        <div className="h-14 flex items-center px-6 border-b border-slate-200">
          <span className="text-sm font-black text-slate-900 tracking-[0.2em] uppercase">HR Portal</span>
        </div>
        <NavLinks />
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`fixed top-0 left-0 h-full w-64 z-50 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-200 ease-in-out md:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-14 flex items-center justify-between px-6 border-b border-slate-200">
          <span className="text-sm font-black text-slate-900 tracking-[0.2em] uppercase">HR Portal</span>
          <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <NavLinks />
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span>Portal</span>
              <ChevronRight size={11} className="text-slate-300" />
              <span className="text-slate-700 font-semibold">{currentPage}</span>
            </div>
          </div>
          <div className="w-7 h-7 bg-slate-900 flex items-center justify-center text-white rounded-full text-xs font-bold uppercase">
            {currentUser?.email?.charAt(0) || 'U'}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
