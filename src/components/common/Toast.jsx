// SYS: Global Toast Notification Component
import React, { useContext, useEffect } from 'react';
import { AppContext } from '../../App';

export default function Toast() {
  const { state, setState } = useContext(AppContext);
  const { toast } = state;

  // EXEC: Auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, toast: null }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, setState]);

  if (!toast) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] animate-[modalPop_0.3s_cubic-bezier(0.16,1,0.3,1)_forwards]">
      <div className="glass-panel border border-[var(--border-line)] rounded-full px-5 py-3 shadow-2xl flex items-center space-x-3 backdrop-blur-3xl bg-[var(--bg-surface)]/80">
        {toast.type === 'success' && <i data-lucide="check-circle-2" className="w-5 h-5 text-[var(--primary-glow)]"></i>}
        {toast.type === 'error' && <i data-lucide="alert-circle" className="w-5 h-5 text-red-500"></i>}
        {toast.type === 'info' && <i data-lucide="info" className="w-5 h-5 text-blue-500"></i>}
        <span className="text-sm font-bold text-prime">{toast.message}</span>
      </div>
    </div>
  );
}
