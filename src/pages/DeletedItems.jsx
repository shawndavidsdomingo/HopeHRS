// src/pages/DeletedItems.jsx
import { useState, useEffect } from 'react';
import { useRights } from '../contexts/UserRightsContext';
import { getEmployees, recoverEmployee } from '../lib/Employeeservice';
import { getJobs, recoverJob } from '../lib/jobService';
import { getDepts, recoverDept } from '../lib/departmentService';
import { recoverJobHistory } from '../lib/Jobhistoryservice';
import { supabase } from '../lib/supabaseClient';

export default function DeletedItems() {
  const { currentUser, loadingRights } = useRights();
  const [activeTab, setActiveTab] = useState('Employees');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

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
        // Because getJobHistory in the service is locked to a specific employee, 
        // we fetch global history straight from supabase here to filter.
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
      const res = await recoverEmployee(item.empno, email);
      error = res.error;
    } else if (activeTab === 'Jobs') {
      const res = await recoverJob(item.jobcode, email);
      error = res.error;
    } else if (activeTab === 'Departments') {
      const res = await recoverDept(item.deptcode, email);
      error = res.error;
    } else if (activeTab === 'Job History') {
      // Use your exact PK object requirement from Jobhistoryservice.js
      const pk = { empno: item.empno, jobcode: item.jobcode, effdate: item.effdate };
      const res = await recoverJobHistory(pk, email);
      error = res?.error;
    }

    if (!error) {
      setData(prev => prev.filter(d => d !== item));
    } else {
      console.error('Failed to recover item:', error);
      alert('Failed to recover item. Check console for details.');
    }
  };

  // ── Render Helpers ────────────────────────────────────────────────────────
  const renderItemDetails = (item) => {
    switch (activeTab) {
      case 'Employees':
        return <span className="font-medium text-slate-700">{item.empno} - {item.lastname}, {item.firstname}</span>;
      case 'Jobs':
        return <span className="font-medium text-slate-700">{item.jobcode} - {item.jobdesc}</span>;
      case 'Departments':
        return <span className="font-medium text-slate-700">{item.deptcode} - {item.deptname}</span>;
      case 'Job History':
        return <span className="font-medium text-slate-700">Emp: {item.empno} | Job: {item.jobcode} | Date: {item.effdate}</span>;
      default:
        return null;
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
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Deleted Items</h1>
        <p className="mt-1 text-xs text-slate-500 uppercase tracking-wide">Trash Bin & Recovery</p>
      </div>

      <div className="flex space-x-6 border-b border-slate-200 mt-6 shrink-0">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold transition-all duration-100 border-b-2 ${
              activeTab === tab 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-6 flex-1 overflow-auto bg-white rounded-lg border border-slate-200 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/2">Details</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Stamp</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="3" className="p-8 text-center text-sm text-slate-400 font-medium">Loading inactive records...</td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-8 text-center text-sm text-slate-400 font-medium">
                  No deleted items found for {activeTab}.
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-sm">
                    {renderItemDetails(item)}
                  </td>
                  <td className="p-4 text-xs text-slate-400 font-mono tracking-tight">
                    {item.stamp || 'No stamp available'}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleRecover(item)}
                      className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded shadow-sm hover:bg-indigo-600 hover:text-white transition-all duration-200 cursor-pointer"
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
  );
}