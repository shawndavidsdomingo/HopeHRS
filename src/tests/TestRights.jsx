// src/tests/TestRights.jsx
// Sprint 3 — Debug page for UserRightsContext
// Visit: http://localhost:5173/test-rights
// Shows currentUser, isAdminOrAbove, and all 17 rights
// Remove before production deploy
// ─────────────────────────────────────────────────────────────────────────────

import { useRights } from '../contexts/UserRightsContext';

export default function TestRights() {
  const { currentUser, rights, loadingRights, isAdminOrAbove } = useRights();

  if (loadingRights) {
    return (
      <div className="p-8 text-sm text-slate-400 animate-pulse">
        Loading rights...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 font-mono text-sm max-w-3xl">

      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-800">UserRightsContext Debug</h1>
        <p className="text-xs text-slate-400 mt-1">
          Visit this page logged in as each user type to confirm context loads correctly.
        </p>
      </div>

      {/* currentUser */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">currentUser</p>
        <div className="bg-slate-50 border border-slate-200 p-4 rounded text-xs space-y-1">
          {currentUser ? (
            <>
              <p><span className="text-slate-400">userid:</span> <span className="text-slate-800">{currentUser.userid}</span></p>
              <p><span className="text-slate-400">email:</span> <span className="text-slate-800">{currentUser.email}</span></p>
              <p><span className="text-slate-400">user_type:</span>
                <span className={`ml-2 px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                  currentUser.user_type === 'SUPERADMIN'
                    ? 'bg-purple-100 text-purple-700'
                    : currentUser.user_type === 'ADMIN'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-600'
                }`}>
                  {currentUser.user_type}
                </span>
              </p>
              <p><span className="text-slate-400">record_status:</span> <span className="text-emerald-600 font-bold">{currentUser.record_status}</span></p>
            </>
          ) : (
            <p className="text-red-500 font-bold">❌ currentUser is NULL — hr_user lookup failed</p>
          )}
        </div>
      </div>

      {/* isAdminOrAbove */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">isAdminOrAbove</p>
        <div className={`px-4 py-3 rounded border text-sm font-bold ${
          isAdminOrAbove
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          {isAdminOrAbove
            ? '✅ TRUE — Deleted Items and Admin links should be visible in sidebar'
            : '❌ FALSE — Deleted Items and Admin links are hidden'}
        </div>
        {!isAdminOrAbove && currentUser && (
          <p className="text-xs text-red-500">
            user_type is "{currentUser.user_type}" — expected "ADMIN" or "SUPERADMIN"
          </p>
        )}
      </div>

      {/* Rights map */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Rights Map ({Object.values(rights).filter(v => v === 1).length} / 17 enabled)
        </p>
        <div className="bg-slate-50 border border-slate-200 p-4 rounded">
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(rights).map(([code, value]) => (
              <div key={code} className="flex items-center justify-between py-0.5">
                <span className="text-slate-500 text-xs">{code}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  value === 1
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {value === 1 ? '✅ 1' : '✗ 0'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar visibility check */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sidebar Link Visibility</p>
        <div className="bg-slate-50 border border-slate-200 p-4 rounded text-xs space-y-2">
          {[
            { label: 'Employees', visible: true },
            { label: 'Job History', visible: true },
            { label: 'Job Catalogue', visible: true },
            { label: 'Departments', visible: true },
            { label: 'Deleted Items', visible: isAdminOrAbove },
            { label: 'Admin', visible: isAdminOrAbove },
          ].map(({ label, visible }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-slate-600">{label}</span>
              <span className={`font-bold ${visible ? 'text-emerald-600' : 'text-red-400'}`}>
                {visible ? '✅ Visible' : '❌ Hidden'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Raw dump */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Raw JSON Dump</p>
        <pre className="bg-slate-900 text-green-400 p-4 rounded text-xs overflow-auto">
          {JSON.stringify({ currentUser, isAdminOrAbove, rights }, null, 2)}
        </pre>
      </div>

    </div>
  );
}