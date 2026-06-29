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
    <div className="fixed bottom-10 sm:bottom-12 left-0 right-0 z-[150] pointer-events-none flex justify-center">
      
      <div className="animate-modal-pop w-fit max-w-[90%] sm:max-w-md">
        
        <div className="glass-panel border border-[var(--border-line)] rounded-2xl px-4 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.2)] flex items-center space-x-3">
          
          {toast.type === 'success' && (
            <div className="w-8 h-8 rounded-full bg-[var(--primary-glow)]/20 flex items-center justify-center shrink-0">
              <i data-lucide="check-circle-2" className="w-4 h-4 text-[var(--primary-glow)]"></i>
            </div>
          )}
          
          {toast.type === 'error' && (
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
              <i data-lucide="alert-circle" className="w-4 h-4 text-red-500"></i>
            </div>
          )}
          
          {toast.type === 'info' && (
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
              <i data-lucide="info" className="w-4 h-4 text-blue-500"></i>
            </div>
          )}

          <span className="text-sm font-bold text-prime pr-2">{toast.message}</span>
        </div>
        
      </div>
    </div>
  );
}
