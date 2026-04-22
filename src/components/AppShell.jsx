import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Users, Briefcase, Building, History, LogOut, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    // await supabase.auth.signOut();
    navigate('/login');
  };

  // const menuItems = [
  //   { path: '/employees',   label: 'Employees',     icon: <Users size={15} /> },
  //   { path: '/jobhistory',  label: 'Job History',   icon: <History size={15} /> },
  //   { path: '/jobs',        label: 'Job Catalogue', icon: <Briefcase size={15} /> },
  //   { path: '/departments', label: 'Departments',   icon: <Building size={15} /> },
  // ];

  const currentPage = menuItems.find(i => i.path === location.pathname)?.label ?? '';

  return (
    <div className="flex h-screen bg-[#f0f2f5] overflow-hidden" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside className="w-60 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-slate-900 flex items-center justify-center shadow-md">
              <span className="text-white text-xs font-black">H</span>
            </div>
            <div>
              <p className="text-slate-900 text-sm font-bold tracking-tight leading-none">HOPE, INC.</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">HR Management</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          <p className="px-2 mb-3 text-[9px] font-bold text-slate-400 uppercase tracking-[0.18em]">Menu</p>

          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 text-xs font-semibold transition-all duration-100 border-l-2 ${
                  active
                    ? 'bg-white text-indigo-600 border-indigo-500 shadow-sm shadow-indigo-100/80'
                    : 'bg-transparent text-slate-500 border-transparent hover:bg-white hover:text-slate-700 hover:shadow-sm hover:border-slate-200'
                }`}
              >
                <span className={active ? 'text-indigo-500' : 'text-slate-400'}>{item.icon}</span>
                <span className="tracking-wide">{item.label}</span>
                {active && <ChevronRight size={11} className="ml-auto text-indigo-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Divider + User zone */}
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
          <div className="w-7 h-7 bg-slate-900 flex items-center justify-center text-white text-[10px] font-black shadow-sm">
            A
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}