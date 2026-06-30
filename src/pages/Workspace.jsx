import React, { useContext, useState } from 'react';
import { AppContext } from '../App';

export default function Workspace() {
  const { state, setState } = useContext(AppContext);
  const user = state.user;

  // SYS: Local tab for User role simulation
  const [userRole, setUserRole] = useState('freelancer'); // freelancer, client

  // SEC: Guard
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-modal-pop">
        <i data-lucide="lock" className="w-16 h-16 text-sub mb-4"></i>
        <h2 className="text-2xl font-bold text-prime">Authentication Required</h2>
        <p className="text-sub mt-2">Please log in to access your secure workspace.</p>
      </div>
    );
  }

  // MOCK: Freelancer Contracts
  const activeContracts = [
    { id: 'ct-101', title: 'React Native Developer', host: 'Alex Corp', amount: 1500, status: 'In Progress', deadline: '3 days left' },
    { id: 'ct-102', title: '3D Cyberpunk Assets', host: 'Studio X', amount: 850, status: 'In Review', deadline: 'Awaiting Host Approval' }
  ];

  // MOCK: Client Hires (Jobs posted by this user where freelancers submitted work)
  const clientContracts = [
    { id: 'ct-309', title: 'Logo Design', freelancer: 'DevNinja', amount: 450, status: 'In Review', deliverUrl: 'https://figma.com/file/mock-delivery' }
  ];

  const transactions = [
    { id: 'tx-8821', type: 'Escrow Locked', target: 'Alex Corp', amount: -1500, date: 'Today, 10:30 AM', status: 'secured' },
    { id: 'tx-7742', type: 'Payout Released', target: 'Studio X', amount: 850, date: 'Jun 22, 2026', status: 'completed' },
    { id: 'tx-7740', type: 'Payout Released', target: 'Tech Inc', amount: 1200, date: 'Jun 18, 2026', status: 'completed' }
  ];

  const handleDeliver = (contract) => {
    if (contract.status === 'In Review') {
      return setState(prev => ({ ...prev, toast: { type: 'info', message: 'Work already submitted. Awaiting client approval.' } }));
    }
    setState(prev => ({ ...prev, activeModal: 'modal-deliver', selectedItem: contract }));
  };

  // 📍 EXEC: Trigger Release Escrow Modal for Clients
  const handleReviewDelivery = (contract) => {
    setState(prev => ({ ...prev, activeModal: 'modal-release-escrow', selectedItem: contract }));
  };

  return (
    <div className="space-y-8 sm:space-y-10 max-w-5xl mx-auto pb-24 animate-modal-pop">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-[var(--border-line)] pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-[var(--border-line)] text-xs font-bold uppercase tracking-widest text-sub mb-4">
            <i data-lucide="layout-dashboard" className="w-4 h-4 text-[var(--primary-glow)]"></i>
            <span>Private Vault</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-prime tracking-tight">Workspace</h1>
        </div>

        {/* Dual Mode Switcher */}
        <div className="flex p-1 bg-black/5 border border-[var(--border-line)] rounded-2xl w-full sm:w-auto">
          <button onClick={() => setUserRole('freelancer')} className={`btn-press flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold transition-all ${userRole === 'freelancer' ? 'surface-bg text-prime shadow-sm border border-[var(--border-line)]' : 'text-sub hover:text-prime'}`}>Freelancer</button>
          <button onClick={() => setUserRole('client')} className={`btn-press flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold transition-all ${userRole === 'client' ? 'surface-bg text-prime shadow-sm border border-[var(--border-line)]' : 'text-sub hover:text-prime'}`}>Client</button>
        </div>
      </div>

      {/* STATS BENTO */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bento-card rounded-3xl p-6 flex flex-col justify-between h-40 hover-lift">
          <div className="flex justify-between items-start mb-6 sm:mb-0">
            <span className="text-xs text-sub font-bold uppercase tracking-widest">Active Balance</span>
            <i data-lucide="wallet" className="w-5 h-5 text-gray-400"></i>
          </div>
          <div>
            <h3 className="text-4xl font-black text-prime">{user.balance}</h3>
            <p className="text-xs text-sub mt-2">Available for withdrawal</p>
          </div>
        </div>
        
        <div className="bento-card rounded-3xl p-6 flex flex-col justify-between h-40 border-[var(--primary-glow)]/40 relative overflow-hidden hover-lift shadow-[0_0_30px_var(--grid-color)]">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--primary-glow)] opacity-10 blur-[50px] rounded-full pointer-events-none"></div>
          <div className="flex justify-between items-start relative z-10 mb-6 sm:mb-0">
            <span className="text-xs text-[var(--primary-glow)] font-bold uppercase tracking-widest">Locked in Escrow</span>
            <i data-lucide="lock" className="w-5 h-5 text-[var(--primary-glow)]"></i>
          </div>
          <div className="relative z-10">
            <h3 className="text-4xl sm:text-5xl font-black glow-text">$4,700.00</h3>
            <p className="text-xs text-[var(--primary-glow)] mt-2 font-medium">Awaiting delivery approval</p>
          </div>
        </div>

        <div className="bento-card rounded-3xl p-6 flex flex-col justify-between h-40 hover-lift">
          <div className="flex justify-between items-start mb-6 sm:mb-0">
            <span className="text-xs text-sub font-bold uppercase tracking-widest">Success Rate</span>
            <i data-lucide="activity" className="w-5 h-5 text-gray-400"></i>
          </div>
          <div>
            <h3 className="text-4xl font-black text-prime">98%</h3>
            <p className="text-xs text-sub mt-2">Based on 124 completed gigs</p>
          </div>
        </div>
      </div>

      {/* RENDER: ACTIVE CONTRACTS */}
      <div>
        <h3 className="text-xl font-bold text-prime mb-5 flex items-center">
          <i data-lucide="briefcase" className="w-6 h-6 mr-3 text-[var(--primary-glow)]"></i> 
          {userMode === 'client' ? 'Contracts Dispatched' : 'Active Contracts'}
        </h3>
        
        {userMode === 'client' ? (
          /* CLIENT VIEW: Approve Deliveries */
          <div className="flex flex-col space-y-4">
            {activeContracts.map(contract => (
              <div key={contract.id} className="bento-card rounded-[2rem] p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 border border-[var(--border-line)]">
                <div className="flex items-start sm:items-center space-x-4 w-full sm:w-auto">
                  <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center font-bold text-white border border-[var(--border-line)] shrink-0 text-lg">
                    {contract.host[0]}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-prime">{contract.title}</h4>
                    <p className="text-xs text-sub mt-0.5">Freelancer: <span className="text-prime">Alex Global</span></p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-8 bg-black/20 sm:bg-transparent p-4 sm:p-0 rounded-xl">
                  <div className="text-left sm:text-right">
                    <p className="text-xl font-black text-prime">${contract.amount}</p>
                    <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mt-1">In Review</p>
                  </div>
                  <button onClick={() => setState(prev => ({ ...prev, activeModal: 'modal-escrow-approve', selectedItem: contract }))} className="btn-press px-6 py-3 rounded-xl text-sm font-bold text-white shadow-md bg-[var(--primary-glow)] shrink-0">
                    Review Work
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* FREELANCER VIEW: Submit Deliveries */
          <div className="flex flex-col space-y-4">
            {activeContracts.map(contract => (
              <div key={contract.id} className="btn-press bento-card rounded-[2rem] p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 sm:gap-6 border border-[var(--border-line)] hover:border-[var(--primary-glow)]/50 transition-colors">
                <div className="flex items-start sm:items-center space-x-4 w-full sm:w-auto">
                  <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center font-bold text-white border border-[var(--border-line)] shrink-0 text-lg shadow-sm">
                    {contract.host[0]}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-prime mb-1">{contract.title}</h4>
                    <p className="text-xs text-sub font-medium">Host: <span className="text-prime">{contract.host}</span> <span className="mx-1">•</span> <span className="font-mono">{contract.id.toUpperCase()}</span></p>
                  </div>
                </div>
                
                <div className="flex flex-row items-center justify-between w-full sm:w-auto gap-4 sm:gap-8 bg-black/20 sm:bg-transparent p-4 sm:p-0 rounded-xl sm:rounded-none">
                  <div className="text-left sm:text-right">
                    <p className="text-xl font-black text-prime">${contract.amount}</p>
                    <p className={`text-xs font-bold uppercase tracking-wider mt-1 ${contract.status === 'In Progress' ? 'text-amber-500' : 'text-[var(--primary-glow)]'}`}>{contract.status}</p>
                  </div>
                  <button onClick={() => handleDeliver(contract)} className={`btn-press px-6 py-3 rounded-xl text-sm font-bold shadow-md transition-all shrink-0 w-[120px] ${contract.status === 'In Review' ? 'bg-white/10 text-sub border border-[var(--border-line)]' : 'bg-[var(--primary-glow)] text-white hover:opacity-90'}`}>
                    {contract.status === 'In Review' ? 'Reviewing' : 'Deliver'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TRANSACTION HISTORY */}
      <div>
        <h3 className="text-xl font-bold text-prime mb-5 flex items-center">
          <i data-lucide="history" className="w-6 h-6 mr-3 text-sub"></i> Recent Transactions
        </h3>
        <div className="bento-card rounded-[2rem] p-2 sm:p-4">
          <div className="flex flex-col">
            {transactions.map((tx, idx) => (
              <div key={tx.id} className={`flex items-center justify-between p-4 sm:p-5 hover:bg-white/5 transition-colors rounded-xl ${idx !== transactions.length - 1 ? 'border-b border-[var(--border-line)]/50' : ''}`}>
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.status === 'secured' ? 'bg-amber-500/10 text-amber-500' : 'bg-[var(--primary-glow)]/10 text-[var(--primary-glow)]'}`}>
                    {tx.status === 'secured' ? <i data-lucide="lock" className="w-5 h-5"></i> : <i data-lucide="check-circle-2" className="w-5 h-5"></i>}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-prime mb-1">{tx.type}</p>
                    <p className="text-xs text-sub">{tx.target} <span className="mx-1">•</span> {tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-base sm:text-lg font-black ${tx.amount > 0 ? 'text-[var(--primary-glow)]' : 'text-prime'}`}>{tx.amount > 0 ? '+' : ''}{tx.amount}</p>
                  <p className="text-[10px] text-sub font-mono mt-1">{tx.id}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
