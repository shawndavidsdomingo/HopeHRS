import { Search, UserPlus, MoreVertical } from 'lucide-react';

export default function Employees() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Employee Directory</h1>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <UserPlus size={18} />
          <span>Add Employee</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input type="text" placeholder="Search employees..." className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm uppercase">
              <th className="px-6 py-3 font-semibold">Name</th>
              <th className="px-6 py-3 font-semibold">Department</th>
              <th className="px-6 py-3 font-semibold">Role</th>
              <th className="px-6 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
            {/* Map through employees here */}
            <tr className="hover:bg-slate-50">
              <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">JD</div>
                Jane Doe
              </td>
              <td className="px-6 py-4">Engineering</td>
              <td className="px-6 py-4">Senior Developer</td>
              <td className="px-6 py-4 text-right">
                <button className="text-slate-400 hover:text-slate-600"><MoreVertical size={18} /></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}