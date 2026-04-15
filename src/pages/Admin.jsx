import { Shield, Users, Key, AlertTriangle } from 'lucide-react';

export default function Admin() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">System Administration</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-800">Role Management</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">Assign or revoke system permissions for internal staff.</p>
          <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium text-sm">Manage Roles</button>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Key className="text-purple-600" />
            <h2 className="text-lg font-semibold text-slate-800">Authentication Settings</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">Configure SSO, MFA requirements, and session timeouts.</p>
          <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium text-sm">Configure Auth</button>
        </div>
      </div>
    </div>
  );
}