import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// M4 – Sprint 1 PR3: Google OAuth Redirect URL Setup
// Register the following redirect URLs to ensure proper callback handling:
//
// Supabase Dashboard → Authentication → URL Configuration:
//   • http://localhost:5173/auth/callback
//   • https://<your-vercel-app>.vercel.app/auth/callback (for Sprint 3)
//
// Google Cloud Console → OAuth 2.0 → Authorized Redirect URIs:
//   • http://localhost:5173/auth/callback
//   • https://<project>.supabase.co/auth/v1/callback

export default function AuthCallback() {
  const navigate = useNavigate();

  // FIX: replaced getSession() with onAuthStateChange
  //
  // Problem with getSession():
  //   When Google OAuth redirects back to /auth/callback, the URL contains
  //   a one-time code that Supabase needs to exchange for a session.
  //   getSession() runs immediately on mount — before Supabase has finished
  //   the code exchange — so it finds no session and navigates to /login.
  //
  // Fix with onAuthStateChange:
  //   Supabase automatically detects the OAuth code in the URL and fires
  //   SIGNED_IN once the exchange completes. We listen for that event
  //   and navigate only after the session is confirmed.
  //   Timeout fallback handles edge cases where the event never fires.
  useEffect(() => {
    // Listen for the SIGNED_IN event that fires after OAuth code exchange
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Session established — let App.jsx checkLoginGuard handle
          // the ACTIVE/INACTIVE check and redirect accordingly
          navigate('/employees', { replace: true });
        } else if (event === 'SIGNED_OUT') {
          navigate('/login', { replace: true });
        }
      }
    );

    // Fallback: if onAuthStateChange never fires within 5 seconds
    // (e.g. slow network), try getSession() as a last resort
    const timeout = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) navigate('/employees', { replace: true });
      else navigate('/login', { replace: true });
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center p-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="bg-white p-12 rounded-3xl shadow-xl border border-slate-200 flex flex-col items-center max-w-sm w-full">

        {/* Branding */}
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