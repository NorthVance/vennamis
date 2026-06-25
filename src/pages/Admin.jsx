import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import { DatabaseService } from '../services/db';

export default function Admin() {
  const { state, setState } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('overview');
  
  // 📍 SYS: Admin States
  const [allContent, setAllContent] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // EXEC: Fetch All Global Content
  const fetchAllContent = async () => {
    setIsLoading(true);
    const gigs = await DatabaseService.getFeedData('gigs');
    const comms = await DatabaseService.getFeedData('community');
    // Merge array and sort by ID (Mock timestamp simulation)
    setAllContent([...gigs, ...comms].sort((a, b) => b.id.localeCompare(a.id)));
    setIsLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'content') fetchAllContent();
  }, [activeTab, state.refreshTick]);

  // EXEC: Moderation Delete
  const handleDelete = async (id, type) => {
    const table = type === 'gig' ? 'gigs' : 'community';
    if (window.confirm(`[SECURITY] Are you sure you want to purge ${id} from ${table}?`)) {
      const success = await DatabaseService.deleteContent(id, table);
      if (success) {
        // Trigger global state refresh to update Feed as well
        setState(prev => ({ ...prev, refreshTick: prev.refreshTick + 1 }));
        fetchAllContent();
      }
    }
  };

  // SEC: Guard Route
  if (!state.user || state.user.name !== 'Admin User') {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-modal-pop">
        <i data-lucide="shield-alert" className="w-16 h-16 text-red-500 mb-4"></i>
        <h2 className="text-2xl font-bold text-prime">Access Denied</h2>
        <p className="text-sub mt-2">You do not have administrator privileges to view this area.</p>
      </div>
    );
  }

  // MOCK: Stats
  const stats = [
    { label: 'Total Users', val: '1,248', icon: 'users', color: 'text-blue-500' },
    { label: 'Active Gigs', val: '342', icon: 'briefcase', color: 'text-[var(--primary-glow)]' },
    { label: 'Escrow Volume', val: '$45K', icon: 'dollar-sign', color: 'text-amber-500' },
    { label: 'Reported', val: '12', icon: 'flag', color: 'text-red-500' }
  ];

  return (
    <div className="space-y-8 animate-modal-pop max-w-6xl mx-auto pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--border-line)] pb-6">
        <div>
          <h1 className="text-3xl font-black text-prime flex items-center">
            <i data-lucide="shield" className="w-8 h-8 mr-3 text-red-500"></i>
            Command Center
          </h1>
          <p className="text-sm text-sub mt-1">Platform management and global database override.</p>
        </div>
        <div className="flex p-1 bg-black/5 border border-[var(--border-line)] rounded-xl overflow-hidden">
          <button onClick={() => setActiveTab('overview')} className={`btn-press px-5 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'overview' ? 'bg-[var(--primary-glow)] text-white shadow-md' : 'text-sub hover:text-prime'}`}>Overview</button>
          <button onClick={() => setActiveTab('content')} className={`btn-press px-5 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'content' ? 'bg-[var(--primary-glow)] text-white shadow-md' : 'text-sub hover:text-prime'}`}>Moderation</button>
        </div>
      </div>

      {/* RENDER: Overview Stats */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((s, i) => (
            <div key={i} className="bento-card rounded-[2rem] p-6 hover-lift">
              <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] uppercase tracking-widest text-sub font-bold">{s.label}</p>
                <i data-lucide={s.icon} className={`w-5 h-5 ${s.color}`}></i>
              </div>
              <h3 className="text-3xl font-black text-prime">{s.val}</h3>
            </div>
          ))}
        </div>
      )}

      {/* RENDER: Content Moderation Engine */}
      {activeTab === 'content' && (
        <div className="bento-card rounded-[2rem] overflow-hidden">
          <div className="p-5 border-b border-[var(--border-line)] flex justify-between items-center bg-white/5">
            <h3 className="text-sm font-bold text-prime flex items-center"><i data-lucide="database" className="w-4 h-4 mr-2 text-[var(--primary-glow)]"></i> Global Feed Data</h3>
            <button onClick={fetchAllContent} className="btn-press text-xs font-bold text-sub hover:text-prime flex items-center"><i data-lucide="refresh-cw" className={`w-3.5 h-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`}></i> Sync</button>
          </div>
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-[var(--border-line)] text-[10px] uppercase text-sub tracking-widest bg-black/20">
                  <th className="p-4 font-bold">Ref ID</th>
                  <th className="p-4 font-bold">Type</th>
                  <th className="p-4 font-bold">Author</th>
                  <th className="p-4 font-bold">Payload Snippet</th>
                  <th className="p-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-xs text-prime">
                {isLoading ? (
                  <tr><td colSpan="5" className="p-8 text-center text-sub animate-pulse">Syncing with database...</td></tr>
                ) : allContent.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-sub">No content found in database.</td></tr>
                ) : (
                  allContent.map(item => (
                    <tr key={item.id} className="border-b border-[var(--border-line)] hover:bg-white/5 transition">
                      <td className="p-4 font-mono text-[10px] text-sub">{item.id}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-[4px] font-bold text-[9px] uppercase tracking-wider ${item.type === 'gig' ? 'bg-blue-500/20 text-blue-500' : 'bg-purple-500/20 text-purple-500'}`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="p-4 font-medium">{item.host}</td>
                      <td className="p-4 text-sub truncate max-w-[200px]">{item.title}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDelete(item.id, item.type)} className="btn-press px-4 py-1.5 bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-[10px] font-bold transition shadow-sm">Purge</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
