// src/pages/DeletedItems.jsx
// PR-03: fix/ui-final-polish — skeleton rows, mobile responsive table
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useRights } from '../contexts/UserRightsContext';
import { getEmployees, recoverEmployee } from '../lib/employeeService';
import { getJobs, recoverJob } from '../lib/jobService';
import { getDepts, recoverDept } from '../lib/departmentService';
import { recoverJobHistory } from '../lib/jobHistoryService';
import { supabase } from '../lib/supabaseClient';

// ── Skeleton Rows (match Employees.jsx) ──
const SkeletonRows = ({ count = 7 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <tr key={i} className="border-b border-slate-100">
        {[60, 90, 20].map((w, j) => (
          <td key={j} className="px-6 py-4">
            <div
              className="h-3 bg-slate-100 animate-pulse"
              style={{ width: `${w}%`, animationDelay: `${i * 60}ms` }}
            />
          </td>
        ))}
      </tr>
    ))}
  </>
);

// ── Empty State ───────────────────────────────────────────────
const EmptyState = ({ label }) => (
  <tr>
    <td colSpan={3} className="px-6 py-24 text-center">
      <div className="flex flex-col items-center gap-2">
        <div className="w-10 h-10 border-2 border-dashed border-slate-200 flex items-center justify-center">
          <span className="text-slate-300 text-lg">∅</span>
        </div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
    </td>
  </tr>
);

export default function DeletedItems() {
  const { currentUser, loadingRights } = useRights();
  const [activeTab, setActiveTab] = useState('Employees');
  const [data, setData]           = useState([]);
  const [loading, setLoading]     = useState(false);

  const tabs = ['Employees', 'Job History', 'Jobs', 'Departments'];

  useEffect(() => {
    if (currentUser && (currentUser.user_type === 'ADMIN' || currentUser.user_type === 'SUPERADMIN')) {
      loadData();
    }
  }, [activeTab, currentUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === 'Employees') {
        res = await getEmployees(currentUser.user_type);
      } else if (activeTab === 'Jobs') {
        res = await getJobs(currentUser.user_type);
      } else if (activeTab === 'Departments') {
        res = await getDepts(currentUser.user_type);
      } else if (activeTab === 'Job History') {
        res = await supabase.from('jobhistory').select('*');
      }
      const inactiveData = (res?.data || []).filter(item => item.record_status === 'INACTIVE');
      setData(inactiveData);
    } catch (err) {
      console.error('Error fetching deleted items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecover = async (item) => {
    const email = currentUser.email;
    let error;
    if (activeTab === 'Employees') {
      ({ error } = await recoverEmployee(item.empno, email));
    } else if (activeTab === 'Jobs') {
      ({ error } = await recoverJob(item.jobcode, email));
    } else if (activeTab === 'Departments') {
      ({ error } = await recoverDept(item.deptcode, email));
    } else if (activeTab === 'Job History') {
      const pk = { empno: item.empno, jobcode: item.jobcode, effdate: item.effdate };
      ({ error } = await recoverJobHistory(pk, email));
    }
    if (!error) {
      setData(prev => prev.filter(d => d !== item));
    } else {
      console.error('Failed to recover item:', error);
      alert('Failed to recover item. Check console for details.');
    }
  };

  const renderItemDetails = (item) => {
    switch (activeTab) {
      case 'Employees':  return <span className="font-medium text-slate-700">{item.empno} — {item.lastname}, {item.firstname}</span>;
      case 'Jobs':       return <span className="font-medium text-slate-700">{item.jobcode} — {item.jobdesc}</span>;
      case 'Departments':return <span className="font-medium text-slate-700">{item.deptcode} — {item.deptname}</span>;
      case 'Job History':return <span className="font-medium text-slate-700">Emp: {item.empno} | Job: {item.jobcode} | Date: {item.effdate}</span>;
      default:           return null;
    }
  };

  if (loadingRights) return <div className="p-6 text-sm text-slate-500">Loading permissions...</div>;

  if (!currentUser || (currentUser.user_type !== 'ADMIN' && currentUser.user_type !== 'SUPERADMIN')) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-2 text-slate-500 text-sm">You do not have permission to view deleted items.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-5 border-b border-slate-200">
        <div>
          <h1 className="uppercase text-2xl font-bold text-slate-900 tracking-tight">Deleted Items</h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">Trash Bin & Recovery</p>
        </div>
      </div>

      {/* Tabs — scrollable on mobile */}
      <div className="flex overflow-x-auto gap-0 border-b border-slate-200 shrink-0">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-1 mr-6 text-sm font-semibold whitespace-nowrap transition-all duration-100 border-b-2 ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table — horizontal scroll on mobile */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg flex-1 overflow-hidden">
        <div className="overflow-x-auto h-full">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 shadow-[0_1px_0_0_#e2e8f0]">
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] whitespace-nowrap w-1/2">Details</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] whitespace-nowrap">Stamp</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows />
              ) : data.length === 0 ? (
                <EmptyState label={`No deleted ${activeTab.toLowerCase()} found`} />
              ) : (
                data.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-indigo-50/40 transition-colors duration-75">
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{renderItemDetails(item)}</td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-mono tracking-tight whitespace-nowrap">{item.stamp || 'No stamp available'}</td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleRecover(item)}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded shadow-sm hover:bg-indigo-600 hover:text-white transition-all duration-200 cursor-pointer whitespace-nowrap"
                      >
                        Recover
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}