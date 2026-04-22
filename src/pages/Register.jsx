import { useState } from 'react';
import { supabase } from '../lib/supabaseClient'; // Updated to match your project structure
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '', password: '', firstName: '', lastName: '', username: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

const handleRegister = async (e) => {
    e.preventDefault();
    
    /* AUTH LOGIC COMMENTED FOR RIGHTS & AUTHS SPECIALIST
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          username: formData.username,
          record_status: 'INACTIVE' 
        }
      }
    });

    if (error) {
      alert(error.message);
    } else {
      alert('Application Sent. Your account is pending HR activation.');
      navigate('/login');
    }
    setLoading(false);
    */

    // UI-only behavior for testing
    console.log("Registration UI submitted:", formData);
    alert('UI TEST: Application Sent (Logic is currently disabled).');
    navigate('/login');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4 font-sans">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100">
        <h2 className="text-3xl font-black text-center mb-2 text-blue-900 tracking-tight italic">HOPE, INC.</h2>
        <p className="text-center text-slate-400 mb-8 font-bold text-xs uppercase tracking-widest">Portal Registration</p>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="First Name" required className="bg-slate-50 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              onChange={e => setFormData({...formData, firstName: e.target.value})} />
            <input type="text" placeholder="Last Name" required className="bg-slate-50 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              onChange={e => setFormData({...formData, lastName: e.target.value})} />
          </div>
          <input type="text" placeholder="Username" required className="w-full bg-slate-50 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
            onChange={e => setFormData({...formData, username: e.target.value})} />
          <input type="email" placeholder="Work Email" required className="w-full bg-slate-50 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
            onChange={e => setFormData({...formData, email: e.target.value})} />
          <input type="password" placeholder="Password" required className="w-full bg-slate-50 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
            onChange={e => setFormData({...formData, password: e.target.value})} />
          
          <button type="submit" disabled={loading} className="w-full bg-blue-900 text-white p-4 rounded-2xl font-bold shadow-lg hover:bg-blue-800 transition active:scale-[0.98]">
            {loading ? 'Sending...' : 'Register Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm font-medium text-slate-500">
          Already have an account? <Link to="/login" className="text-blue-700 font-bold">Sign In</Link>
        </p>
      </div>
    </div>
  );
}