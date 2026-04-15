import { RotateCcw, Trash2 } from 'lucide-react';

export default function DeletedItems() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Recycle Bin</h1>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm uppercase">
              <th className="px-6 py-3 font-semibold">Item Type</th>
              <th className="px-6 py-3 font-semibold">Record Name</th>
              <th className="px-6 py-3 font-semibold">Deleted By</th>
              <th className="px-6 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
            <tr className="hover:bg-slate-50">
              <td className="px-6 py-4"><span className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-semibold uppercase">Employee Record</span></td>
              <td className="px-6 py-4 font-medium text-slate-900">Mark Smith</td>
              <td className="px-6 py-4">Admin</td>
              <td className="px-6 py-4 text-right flex justify-end gap-2">
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Restore"><RotateCcw size={18} /></button>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors" title="Permadelete"><Trash2 size={18} /></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}