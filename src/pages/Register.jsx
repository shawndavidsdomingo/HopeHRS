import { User, Mail, Lock, Building, ArrowLeft } from 'lucide-react';

export default function Register() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 py-12">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-2xl shadow-xl border border-slate-200">
        
        {/* Header */}
        <div className="relative">
          <a href="/login" className="absolute left-0 top-1 text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft size={20} />
          </a>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900">Request Access</h2>
            <p className="text-slate-500 text-sm mt-1">Setup your internal employee account</p>
          </div>
        </div>
        
        {/* Form */}
        <form className="space-y-4 mt-6">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input type="text" className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Jane" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Last Name</label>
              <input type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Doe" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Work Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input type="email" className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="jane.doe@company.com" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Requested Department/Role</label>
            <div className="relative">
              <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <select className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm appearance-none cursor-pointer">
                <option value="" disabled selected>Select your department...</option>
                <option value="employee">Standard Employee</option>
                <option value="hr">HR Manager</option>
                <option value="finance">Finance & Payroll</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 ml-1">Roles will require approval from an Administrator.</p>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Create Password</label>
            <div className="relative mb-3">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input type="password" className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Minimum 8 characters" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input type="password" className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Confirm Password" />
            </div>
          </div>
          
          <button 
            type="button"
            className="w-full bg-slate-900 hover:bg-black text-white font-bold py-2.5 rounded-lg transition-colors mt-6 shadow-sm"
          >
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
}