export default function JobCodes() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Job Classifications</h1>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm uppercase">
              <th className="px-6 py-3 font-semibold">Job Code</th>
              <th className="px-6 py-3 font-semibold">Title</th>
              <th className="px-6 py-3 font-semibold">Pay Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
            <tr className="hover:bg-slate-50">
              <td className="px-6 py-4 font-mono text-slate-900">ENG-001</td>
              <td className="px-6 py-4">Junior Developer</td>
              <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded-md">Tier 1</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}