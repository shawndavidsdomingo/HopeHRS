import { ArrowUpRight, Clock } from 'lucide-react';

export default function JobHistory() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Job History</h1>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 max-w-2xl">
        <div className="relative border-l border-slate-200 ml-3 space-y-8">
          
          <div className="pl-6 relative">
            <div className="w-3 h-3 bg-blue-600 rounded-full absolute -left-[6px] top-1.5 border-2 border-white"></div>
            <p className="text-sm text-slate-500 flex items-center gap-2"><Clock size={14}/> Jan 2024 - Present</p>
            <h3 className="text-lg font-bold text-slate-800 mt-1">Senior Developer</h3>
            <p className="text-sm text-slate-600">Promoted to lead the frontend architecture team.</p>
          </div>

          <div className="pl-6 relative">
            <div className="w-3 h-3 bg-slate-300 rounded-full absolute -left-[6px] top-1.5 border-2 border-white"></div>
            <p className="text-sm text-slate-500 flex items-center gap-2"><Clock size={14}/> Mar 2022 - Dec 2023</p>
            <h3 className="text-lg font-bold text-slate-800 mt-1">Junior Developer</h3>
            <p className="text-sm text-slate-600">Initial hire. Worked on UI components.</p>
          </div>

        </div>
      </div>
    </div>
  );
}