import React, { useContext } from 'react';
import { AppContext } from '../../App';

export default function Modals() {
  const { state, setState } = useContext(AppContext);
  if (!state.activeModal) return null;

  const closeModal = () => setState({...state, activeModal: null});

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-[100] bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={closeModal}></div>
      
      <div className="glass-panel border rounded-[2rem] w-full max-w-md p-8 relative shadow-2xl transform transition-all">
        <button onClick={closeModal} className="absolute top-6 right-6 text-sub hover:text-prime">✕</button>
        
        {state.activeModal === 'login' && (
          <>
            <h3 className="text-3xl font-black text-prime mb-2">Vennamis</h3>
            <p className="text-xs text-sub mb-8 uppercase tracking-widest">Secure Authentication</p>
            <button onClick={() => { setState({...state, user: {name: 'Admin', avatar: 'A'}, activeModal: null}); }} className="w-full rounded-xl py-3.5 text-white font-bold text-sm hover-lift" style={{ background: 'var(--primary-glow)' }}>
              Initialize Session (Mock)
            </button>
          </>
        )}

        {state.activeModal === 'post' && (
          <>
            <h3 className="text-2xl font-black text-prime mb-6">Post a New Gig</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Gig Title" className="w-full surface-bg border rounded-xl px-4 py-3 text-sm text-prime outline-none" />
              <textarea placeholder="Requirements" rows="4" className="w-full surface-bg border rounded-xl px-4 py-3 text-sm text-prime outline-none"></textarea>
              <button onClick={closeModal} className="w-full rounded-xl py-3.5 text-white font-bold text-sm" style={{ background: 'var(--primary-glow)' }}>Publish Securely</button>
            </div>
          </>
        )}

        {state.activeModal === 'gigDetail' && (
          <>
            <h3 className="text-2xl font-black text-prime mb-4">Details</h3>
            <p className="text-sm text-sub mb-6">This is a mock detail view. Full data binding will be implemented here.</p>
            <button onClick={() => setState({...state, isChatOpen: true, activeModal: null})} className="w-full rounded-xl py-3 text-white font-bold text-sm" style={{ background: 'var(--primary-glow)' }}>
              Message Host
            </button>
          </>
        )}
      </div>
    </div>
  );
}
