import React, { useContext } from 'react';
import { AppContext } from '../../App';

export default function ChatWidget() {
  const { state, setState } = useContext(AppContext);

  return (
    <>
      <button onClick={() => setState({...state, isChatOpen: !state.isChatOpen})} className="fixed bottom-6 right-6 p-4 rounded-full text-white shadow-[0_0_20px_var(--grid-color)] hover:scale-110 transition-transform z-40" style={{ background: 'var(--primary-glow)' }}>
        💬
      </button>

      {state.isChatOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-80 h-[400px] glass-panel border rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50">
          <div className="p-4 border-b border-[var(--border-line)] flex justify-between items-center bg-black/10">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <h3 className="text-sm font-bold text-prime">Secure Messages</h3>
            </div>
            <button onClick={() => setState({...state, isChatOpen: false})} className="text-sub hover:text-prime">✕</button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            <div className="self-start w-fit max-w-[85%] surface-bg border p-2.5 rounded-2xl rounded-tl-none text-xs text-prime">
              System: End-to-end encryption enabled. Please do not share external links.
            </div>
          </div>
          
          <div className="p-3 border-t border-[var(--border-line)] bg-black/10 flex gap-2">
            <input type="text" placeholder="Type message..." className="flex-1 surface-bg border rounded-xl px-3 py-2 text-xs text-prime outline-none" />
            <button className="p-2 rounded-xl text-white hover-lift" style={{ background: 'var(--primary-glow)' }}>➤</button>
          </div>
        </div>
      )}
    </>
  );
}
