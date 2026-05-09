import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';

// M4 – Sprint 1 PR2: Cleaned up to Google OAuth only.
// Removed signInWithPassword(), email/password form, and unused state.
// pendingError prop passed from App.jsx via checkLoginGuard.
export default function Login({ pendingError = '' }) {

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: 'select_account' }, // always show account picker
      }
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="bg-white p-10 shadow-2xl rounded-[2.5rem] w-full max-w-md border border-slate-100">

        {/* Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-blue-900 tracking-tighter italic">HOPE, INC.</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Human Resource System</p>
        </div>

        {/* Pending / Auth Error */}
        {pendingError && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-medium text-center">
            {pendingError}
          </div>
        )}

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 border-2 border-slate-100 p-4 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-[0.98]"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          Continue with Google
        </button>

        <p className="mt-8 text-center text-slate-500 text-sm font-medium">
          New to the portal?{' '}
          <Link to="/register" className="text-blue-700 font-bold hover:underline">
            Request Access
          </Link>
        </p>

      </div>
    </div>
  );
}