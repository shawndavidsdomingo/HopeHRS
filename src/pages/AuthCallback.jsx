import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient'; 

export default function AuthCallback() {
  const navigate = useNavigate();

// M4 – Sprint 1: Replaced fake timer with real getSession() check
// Redirects to /employees if session exists, /login if not
  useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) navigate('/employees');
    else navigate('/login');
  });
}, [navigate]);

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center p-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="bg-white p-12 rounded-3xl shadow-xl border border-slate-200 flex flex-col items-center max-w-sm w-full">
        
        {/* Branding - Matches your Sidebar logo */}
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 bg-slate-900 flex items-center justify-center shadow-md">
            <span className="text-white text-xs font-black">H</span>
          </div>
          <div>
            <p className="text-slate-900 text-sm font-bold tracking-tight leading-none">HOPE, INC.</p>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">HR Management</p>
          </div>
        </div>

        {/* Loading Spinner */}
        <div className="relative flex items-center justify-center mb-8">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-slate-800 font-bold text-lg">Verifying Access</h2>
          <p className="text-slate-400 text-xs font-medium leading-relaxed">
            Please wait while we establish your secure session.
          </p>
        </div>

        {/* Decorative Progress Bar */}
        <div className="w-full h-1 bg-slate-100 rounded-full mt-10 overflow-hidden">
          <div className="h-full bg-indigo-600 animate-pulse w-full"></div>
        </div>
      </div>
    </div>
  );
}