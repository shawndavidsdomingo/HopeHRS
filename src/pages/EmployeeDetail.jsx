import { Mail, Phone, MapPin, Briefcase } from 'lucide-react';

export default function EmployeeDetail() {
  return (
    <div className="p-8">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-slate-800 h-32"></div>
        <div className="px-8 pb-8 relative">
          <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-md absolute -top-12 flex items-center justify-center text-3xl font-bold text-blue-600">
            JD
          </div>
          
          <div className="mt-16 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Jane Doe</h1>
              <p className="text-blue-600 font-medium">Senior Developer</p>
            </div>
            <button className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium text-sm">
              Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 border-t border-slate-100 pt-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800">Contact Information</h3>
              <div className="flex items-center gap-3 text-slate-600 text-sm"><Mail size={16} /> jane.doe@company.com</div>
              <div className="flex items-center gap-3 text-slate-600 text-sm"><Phone size={16} /> +1 (555) 123-4567</div>
              <div className="flex items-center gap-3 text-slate-600 text-sm"><MapPin size={16} /> New York, USA</div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800">Employment Details</h3>
              <div className="flex items-center gap-3 text-slate-600 text-sm"><Briefcase size={16} /> Department: Engineering</div>
              <div className="flex items-center gap-3 text-slate-600 text-sm"><Briefcase size={16} /> Manager: John Smith</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}