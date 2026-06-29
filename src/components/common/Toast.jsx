import React, { useContext, useEffect } from 'react';
import { AppContext } from '../../App';

export default function Toast() {
  const { state, setState } = useContext(AppContext);
  const { toast } = state;

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
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[110] animate-[modalPop_0.3s_cubic-bezier(0.16,1,0.3,1)_forwards] w-[90%] sm:w-auto max-w-sm pointer-events-none">
      <div className="glass-panel border border-[var(--border-line)] rounded-full px-5 py-3 shadow-2xl flex items-center space-x-3 backdrop-blur-3xl bg-[var(--bg-surface)]/90">
        {toast.type === 'success' && <i data-lucide="check-circle-2" className="w-5 h-5 text-[var(--primary-glow)] shrink-0"></i>}
        {toast.type === 'error' && <i data-lucide="alert-circle" className="w-5 h-5 text-red-500 shrink-0"></i>}
        {toast.type === 'info' && <i data-lucide="info" className="w-5 h-5 text-blue-500 shrink-0"></i>}
        <span className="text-sm font-bold text-prime truncate">{toast.message}</span>
      </div>
    </div>
  );
}
