import React, { useContext, useEffect } from 'react';
import { AppContext } from '../../App';

export default function Modals() {
  const { state, setState } = useContext(AppContext);
  const { activeModal, selectedItem } = state; 

  const closeModal = () => setState(prev => ({ ...prev, activeModal: null, selectedItem: null }));

  useEffect(() => {
    if (activeModal && window.lucide) window.lucide.createIcons();
  }, [activeModal, selectedItem]);

  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-0 bg-black/60" onClick={closeModal}></div>
      
      <div className={`relative transform scale-100 opacity-100 transition-all duration-300 glass-panel border rounded-[2rem] w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto ${activeModal === 'modal-gig-detail' || activeModal === 'modal-post' ? 'max-w-2xl' : 'max-w-md'}`}>
        <button onClick={closeModal} className="absolute top-6 right-6 text-sub hover:text-prime"><i data-lucide="x"></i></button>
        
        {/* Modal: ล็อกอิน */}
        {activeModal === 'modal-login' && (
          <>
            <h3 className="text-3xl font-black text-prime mb-2">Vennamis</h3>
            <p className="text-xs text-sub mb-8 uppercase tracking-widest">Secure Authentication</p>
            <form onSubmit={(e) => { e.preventDefault(); setState(prev => ({...prev, user: { name: 'Admin User', avatar: 'AU', balance: '$1,500.00', bio: 'Global Worker.' }, activeModal: null })); }} className="space-y-4">
              <input type="email" required placeholder="Encrypted Email" className="w-full bg-transparent surface-bg border rounded-xl px-4 py-3 text-sm text-prime outline-none focus:border-[var(--primary-glow)]" />
              <input type="password" required placeholder="Password" className="w-full bg-transparent surface-bg border rounded-xl px-4 py-3 text-sm text-prime outline-none focus:border-[var(--primary-glow)]" />
              <button type="submit" className="w-full rounded-xl py-3.5 text-white font-bold text-sm hover-lift" style={{ background: 'var(--primary-glow)' }}>Initialize Session</button>
            </form>
          </>
        )}

        {/* Modal: โพสต์งานใหม่ */}
        {activeModal === 'modal-post' && (
          <>
            <h3 className="text-2xl font-black text-prime mb-2">Post a New Gig</h3>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6"><p className="text-[10px] text-amber-500">Secure Workspace Policy applied.</p></div>
            <form onSubmit={(e) => { e.preventDefault(); closeModal(); }} className="space-y-4">
              <input type="text" required placeholder="Gig Title" className="w-full bg-transparent surface-bg border rounded-xl px-4 py-3 text-sm text-prime outline-none focus:border-[var(--primary-glow)]" />
              <textarea required rows="4" placeholder="Requirements" className="w-full bg-transparent surface-bg border rounded-xl px-4 py-3 text-sm text-prime outline-none focus:border-[var(--primary-glow)]"></textarea>
              <button type="submit" className="w-full rounded-xl py-3.5 text-white font-bold text-sm hover-lift mt-4" style={{ background: 'var(--primary-glow)' }}>Publish Gig</button>
            </form>
          </>
        )}

        {/* Modal: ดูรายละเอียดงาน/โพสต์ (Gig Detail) */}
        {activeModal === 'modal-gig-detail' && selectedItem && (
          <div className="space-y-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-black text-prime mb-2">{selectedItem.title}</h2>
                <span className="text-xs text-sub uppercase tracking-widest border border-[var(--border-line)] px-2 py-1 rounded-lg">{selectedItem.tag || selectedItem.loc || 'Post'}</span>
              </div>
              {selectedItem.price > 0 && <span className="text-2xl font-black glow-text">${selectedItem.price}</span>}
            </div>
            <div className="p-4 surface-bg border rounded-xl mb-6 text-sm text-prime leading-relaxed">{selectedItem.desc}</div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-[var(--border-line)]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-white">{selectedItem.host[0]}</div>
                <div><p className="text-sm font-bold text-prime">{selectedItem.host}</p><p className="text-[10px] text-[var(--primary-glow)]">Verified User</p></div>
              </div>
              <button onClick={() => { closeModal(); setState(prev => ({...prev, isChatOpen: true, chatHost: selectedItem.host})) }} className="px-4 py-2 rounded-lg text-xs font-bold text-white hover-lift" style={{ background: 'var(--primary-glow)' }}>Message Host</button>
            </div>
          </div>
        )}

        {/* Modal: เพิ่มข่าวสาร (Add News) */}
        {activeModal === 'modal-add-news' && (
          <>
            <h3 className="text-xl font-black mb-3">Add News Source</h3>
            <input type="url" placeholder="https://example.com/article" className="w-full bg-transparent surface-bg border rounded-xl px-4 py-2 mb-3 text-sm outline-none focus:border-[var(--primary-glow)]" />
            <button onClick={closeModal} className="w-full py-2 rounded-xl text-white text-sm mb-3" style={{ background: 'var(--primary-glow)' }}>Add to News Feed</button>
          </>
        )}
      </div>
    </div>
  );
}