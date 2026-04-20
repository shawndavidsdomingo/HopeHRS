import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else navigate('/employees');
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) alert(error.message);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="bg-white p-10 shadow-2xl rounded-[2.5rem] w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-blue-900 tracking-tighter italic">HOPE, INC.</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Human Resource System</p>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full mb-6 flex items-center justify-center gap-3 border-2 border-slate-100 p-4 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-[0.98]"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          Continue with Google
        </button>

        <div className="relative mb-8 text-center border-b border-slate-100">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 text-slate-300 text-xs font-bold uppercase tracking-widest">Secure Sign In</span>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <input
            type="email"
            placeholder="Work Email"
            className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 text-white p-4 rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-800 transition transform active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 text-sm font-medium">
          New to the portal? <Link to="/register" className="text-blue-700 font-bold hover:underline">Request Access</Link>
        </p>
      </div>
    </div>
  );
}