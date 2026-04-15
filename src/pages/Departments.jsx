import { Users, FolderGit2 } from 'lucide-react';

export default function Departments() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Departments</h1>
        <button className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-black font-medium text-sm">
          Add Department
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Map through departments here */}
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><FolderGit2 size={24} /></div>
            <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">Active</span>
          </div>
          <h2 className="text-lg font-bold text-slate-800">Engineering</h2>
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
            <Users size={16} />
            <span>42 Employees</span>
          </div>
        </div>
      </div>
    </div>
  );
}