import { Download, BarChart3, FileText } from 'lucide-react';

export default function Reports() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Analytics & Reports</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-slate-800">
              <FileText size={20} className="text-blue-600" />
              <h2 className="font-bold">Monthly Headcount</h2>
            </div>
            <p className="text-sm text-slate-500">Export the total active employee list for payroll.</p>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 rounded text-sm font-medium hover:bg-slate-50">
            <Download size={14} /> CSV
          </button>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-slate-800">
              <BarChart3 size={20} className="text-green-600" />
              <h2 className="font-bold">Turnover Rate</h2>
            </div>
            <p className="text-sm text-slate-500">Q3 statistical overview of departures.</p>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 rounded text-sm font-medium hover:bg-slate-50">
            <Download size={14} /> PDF
          </button>
        </div>
      </div>
    </div>
  );
}