import React, { useContext, useState } from 'react';
import { AppContext } from '../App';

export default function Admin() {
  const { state } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('overview');

  // ถ้าไม่ใช่ Admin ห้ามเข้าหน้านี้ (ป้องกันคนนอก)
  if (!state.user || state.user.name !== 'Admin User') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <i data-lucide="shield-alert" className="w-16 h-16 text-red-500 mb-4"></i>
        <h2 className="text-2xl font-bold text-prime">Access Denied</h2>
        <p className="text-sub mt-2">You do not have administrator privileges to view this area.</p>
      </div>
    );
  }

  // จำลองสถิติหลังบ้าน
  const stats = [
    { label: 'Total Users', val: '1,248', icon: 'users', color: 'text-blue-500' },
    { label: 'Active Gigs', val: '342', icon: 'briefcase', color: 'text-[var(--primary-glow)]' },
    { label: 'Escrow Volume', val: '$45K', icon: 'dollar-sign', color: 'text-amber-500' },
    { label: 'Reported', val: '12', icon: 'flag', color: 'text-red-500' }
  ];

  return (
    <div className="space-y-8 animate-modal-pop">
      
      {/* Header Admin */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--border-line)] pb-6">
        <div>
          <h1 className="text-3xl font-black text-prime flex items-center">
            <i data-lucide="shield" className="w-8 h-8 mr-3 text-[var(--primary-glow)]"></i>
            Command Center
          </h1>
          <p className="text-sm text-sub mt-1">Platform management and database overview.</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'overview' ? 'bg-[var(--primary-glow)] text-white' : 'surface-bg border border-[var(--border-line)] text-prime hover:border-[var(--primary-glow)]'}`}>Overview</button>
          <button onClick={() => setActiveTab('content')} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'content' ? 'bg-[var(--primary-glow)] text-white' : 'surface-bg border border-[var(--border-line)] text-prime hover:border-[var(--primary-glow)]'}`}>Content Moderation</button>
        </div>
      </div>

      {/* Stats Grid */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="glass-panel border rounded-2xl p-6 hover-lift">
              <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] uppercase tracking-widest text-sub font-bold">{s.label}</p>
                <i data-lucide={s.icon} className={`w-5 h-5 ${s.color}`}></i>
              </div>
              <h3 className="text-3xl font-black text-prime">{s.val}</h3>
            </div>
          ))}
        </div>
      )}

      {/* Content Moderation Table */}
      {activeTab === 'content' && (
        <div className="glass-panel border rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[var(--border-line)] bg-white/5">
            <h3 className="text-sm font-bold text-prime">Reported Posts / Gigs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-line)] text-[10px] uppercase text-sub tracking-wider">
                  <th className="p-4 font-bold">Content ID</th>
                  <th className="p-4 font-bold">Type</th>
                  <th className="p-4 font-bold">Author</th>
                  <th className="p-4 font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="text-xs text-prime">
                <tr className="border-b border-[var(--border-line)] hover:bg-white/5 transition">
                  <td className="p-4 font-mono text-[10px]">g1_react_native</td>
                  <td className="p-4"><span className="bg-blue-500/20 text-blue-500 px-2 py-1 rounded">Gig</span></td>
                  <td className="p-4">Alex Corp</td>
                  <td className="p-4 flex space-x-2">
                    <button className="px-3 py-1 bg-[var(--primary-glow)] text-white rounded text-[10px] font-bold hover:opacity-80">Approve</button>
                    <button className="px-3 py-1 bg-red-500 text-white rounded text-[10px] font-bold hover:opacity-80">Delete</button>
                  </td>
                </tr>
                <tr className="hover:bg-white/5 transition">
                  <td className="p-4 font-mono text-[10px]">c1_scam_link</td>
                  <td className="p-4"><span className="bg-purple-500/20 text-purple-500 px-2 py-1 rounded">Community</span></td>
                  <td className="p-4">Unknown User</td>
                  <td className="p-4 flex space-x-2">
                    <button className="px-3 py-1 bg-[var(--primary-glow)] text-white rounded text-[10px] font-bold hover:opacity-80">Approve</button>
                    <button className="px-3 py-1 bg-red-500 text-white rounded text-[10px] font-bold hover:opacity-80">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
