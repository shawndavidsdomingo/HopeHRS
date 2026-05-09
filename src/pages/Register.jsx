import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Register() {

  // M4 – Sprint 1: Wired real Google OAuth (same as Login)
  // Redirects to /auth/callback after Google confirms identity
  const handleGoogleRegister = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: 'select_account' }, // always show account picker
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 p-10">

        {/* Branding */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 bg-slate-900 flex items-center justify-center shadow-lg mb-4">
            <span className="text-white text-lg font-black">H</span>
          </div>
          <div className="text-center">
            <h1 className="text-slate-900 text-xl font-bold tracking-tight">HOPE, INC.</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-medium">Internal Management</p>
          </div>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-2xl font-extrabold text-slate-800">Create Account</h2>
          <p className="text-slate-400 text-sm mt-2">Access the portal using your NEU work account</p>
        </div>

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleRegister}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-4 px-6 border-2 border-slate-100 rounded-2xl transition-all duration-200 shadow-sm active:scale-[0.98]"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          <span>Continue with Google</span>
        </button>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-slate-100 text-center">
          <p className="text-slate-400 text-xs font-medium">
            Already registered?{' '}
            <Link to="/login" className="text-indigo-600 font-bold hover:underline ml-1">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}