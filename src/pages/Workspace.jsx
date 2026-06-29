import React, { useContext } from 'react';
import { AppContext } from '../App';

export default function Workspace() {
  const { state, setState } = useContext(AppContext);
  const user = state.user;

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

  // MOCK: Workspace Data
  const activeContracts = [
    { id: 'ct-1', title: 'React Native Developer', host: 'Alex Corp', amount: 1500, status: 'In Progress', deadline: '3 days left' },
    { id: 'ct-2', title: 'Smart Contract Audit', host: 'DeFi Labs', amount: 3200, status: 'In Review', deadline: 'Pending Approval' }
  ];

  const transactions = [
    { id: 'tx-8821', type: 'Escrow Locked', target: 'Alex Corp', amount: -1500, date: 'Today, 10:30 AM', status: 'secured' },
    { id: 'tx-7742', type: 'Payout Released', target: 'Studio X', amount: 850, date: 'Jun 22, 2026', status: 'completed' }
  ];

  // 📍 EXEC: Trigger Delivery Modal
  const handleDeliver = (contract) => {
    if (contract.status === 'In Review') return setState(prev => ({ ...prev, toast: { type: 'info', message: 'Work already submitted. Awaiting client approval.' } }));
    setState(prev => ({ ...prev, activeModal: 'modal-deliver', selectedItem: contract }));
  };

  return (
    <div className="space-y-8 sm:space-y-10 max-w-5xl mx-auto pb-20 animate-modal-pop">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[var(--border-line)] pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-[var(--border-line)] text-[10px] font-bold uppercase tracking-widest text-sub mb-4">
            <i data-lucide="layout-dashboard" className="w-3.5 h-3.5 text-[var(--primary-glow)]"></i>
            <span>Private Vault</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-prime tracking-tight">Workspace</h1>
        </div>
        <div className="flex items-center space-x-3 text-right">
          <div>
            <p className="text-[10px] text-sub uppercase tracking-widest mb-1">Total Earned</p>
            <p className="text-2xl font-black text-prime">$12,450.00</p>
          </div>
        </div>
      </div>

      {/* STATS BENTO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bento-card rounded-3xl p-6 flex flex-col justify-between h-40 hover-lift">
          <div className="flex justify-between items-start">
            <span className="text-xs text-sub font-bold uppercase tracking-widest">Active Balance</span>
            <i data-lucide="wallet" className="w-5 h-5 text-gray-400"></i>
          </div>
          <div>
            <h3 className="text-4xl font-black text-prime">{user.balance}</h3>
            <p className="text-[10px] text-sub mt-1">Available for withdrawal</p>
          </div>
        </div>
        
        <div className="bento-card rounded-3xl p-6 flex flex-col justify-between h-40 border-[var(--primary-glow)]/30 relative overflow-hidden hover-lift">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-glow)] opacity-10 blur-[50px] rounded-full pointer-events-none"></div>
          <div className="flex justify-between items-start relative z-10">
            <span className="text-xs text-[var(--primary-glow)] font-bold uppercase tracking-widest">Locked in Escrow</span>
            <i data-lucide="lock" className="w-5 h-5 text-[var(--primary-glow)]"></i>
          </div>
          <div className="relative z-10">
            <h3 className="text-4xl font-black glow-text">$4,700.00</h3>
            <p className="text-[10px] text-[var(--primary-glow)] mt-1">Awaiting client approval</p>
          </div>
        </div>

        <div className="bento-card rounded-3xl p-6 flex flex-col justify-between h-40 hover-lift">
          <div className="flex justify-between items-start">
            <span className="text-xs text-sub font-bold uppercase tracking-widest">Success Rate</span>
            <i data-lucide="activity" className="w-5 h-5 text-gray-400"></i>
          </div>
          <div>
            <h3 className="text-4xl font-black text-prime">98%</h3>
            <p className="text-[10px] text-sub mt-1">Based on 124 completed gigs</p>
          </div>
        </div>
      </div>

      {/* ACTIVE CONTRACTS */}
      <div>
        <h3 className="text-lg font-bold text-prime mb-4 flex items-center">
          <i data-lucide="briefcase" className="w-5 h-5 mr-2 text-[var(--primary-glow)]"></i> Active Contracts
        </h3>
        <div className="flex flex-col space-y-4">
          {activeContracts.map(contract => (
            <div key={contract.id} className="btn-press bento-card rounded-[2rem] p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group cursor-pointer border border-[var(--border-line)] hover:border-[var(--primary-glow)]/50">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center font-bold text-white border border-[var(--border-line)] shrink-0">
                  {contract.host[0]}
                </div>
                <div>
                  <h4 className="text-base font-bold text-prime group-hover:text-[var(--primary-glow)] transition">{contract.title}</h4>
                  <p className="text-xs text-sub mt-0.5">Host: {contract.host} • <span className="font-mono text-[10px]">{contract.id.toUpperCase()}</span></p>
                </div>
              </div>
              
              <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-8">
                <div className="text-left sm:text-right">
                  <p className="text-lg font-black text-prime">${contract.amount}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${contract.status === 'In Progress' ? 'text-amber-500' : 'text-[var(--primary-glow)]'}`}>{contract.status}</p>
                </div>
                <button 
                  onClick={() => handleDeliver(contract)} 
                  className={`btn-press px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition shrink-0 ${contract.status === 'In Review' ? 'bg-white/10 text-sub border border-[var(--border-line)]' : 'bg-[var(--primary-glow)] text-white hover:opacity-90'}`}
                >
                  {contract.status === 'In Review' ? 'Reviewing' : 'Deliver'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TRANSACTIONS */}
      <div>
        <h3 className="text-lg font-bold text-prime mb-4 flex items-center">
          <i data-lucide="history" className="w-5 h-5 mr-2 text-sub"></i> Recent Transactions
        </h3>
        <div className="bento-card rounded-[2rem] overflow-hidden">
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-[var(--border-line)] text-[10px] uppercase text-sub tracking-wider bg-white/5">
                  <th className="p-4 font-bold">Transaction ID</th>
                  <th className="p-4 font-bold">Type</th>
                  <th className="p-4 font-bold">Counterparty</th>
                  <th className="p-4 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-xs text-prime">
                {transactions.map(tx => (
                  <tr key={tx.id} className="border-b border-[var(--border-line)] hover:bg-white/5 transition">
                    <td className="p-4 font-mono text-[10px] text-sub">{tx.id}</td>
                    <td className="p-4 flex items-center">
                      {tx.status === 'secured' ? <i data-lucide="lock" className="w-3.5 h-3.5 mr-2 text-amber-500"></i> : <i data-lucide="check-circle-2" className="w-3.5 h-3.5 mr-2 text-[var(--primary-glow)]"></i>}
                      {tx.type}
                    </td>
                    <td className="p-4 font-medium">{tx.target}</td>
                    <td className={`p-4 font-black text-right ${tx.amount > 0 ? 'text-[var(--primary-glow)]' : 'text-prime'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
