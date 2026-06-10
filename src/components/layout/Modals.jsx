import React, { useContext } from 'react';
import { AppContext } from '../../App';
import { X, Mail, Lock, ShieldAlert } from 'lucide-react';

export default function Modals() {
    const { state, setState } = useContext(AppContext);
    
    if (!state.activeModal) return null;

    const closeModal = () => setState({ ...state, activeModal: null });

    const handleLogin = (e) => {
        e.preventDefault();
        // จำลองการล็อกอินสำเร็จ
        setState({ ...state, user: { name: "Admin Vennamis", avatar: "AV" }, activeModal: null });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal}></div>
            
            {/* LOGIN MODAL */}
            {state.activeModal === 'login' && (
                <div className="glass-panel border border-[var(--border-line)] rounded-[2rem] w-full max-w-md p-8 relative shadow-2xl z-10 animate-[pulseGlow_0.3s_ease-out]">
                    <button onClick={closeModal} className="absolute top-6 right-6 text-sub hover:text-prime"><X size={20} /></button>
                    <h3 className="text-3xl font-black text-prime mb-2">Vennamis</h3>
                    <p className="text-xs text-sub mb-8 uppercase tracking-widest">Secure Authentication</p>
                    
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-sub" size={18} />
                            <input type="email" required placeholder="Encrypted Email" className="w-full surface-bg border border-[var(--border-line)] rounded-xl pl-10 pr-4 py-3 text-sm text-prime focus:outline-none focus:border-[var(--primary-glow)]" />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-sub" size={18} />
                            <input type="password" required placeholder="Password" className="w-full surface-bg border border-[var(--border-line)] rounded-xl pl-10 pr-4 py-3 text-sm text-prime focus:outline-none focus:border-[var(--primary-glow)]" />
                        </div>
                        <button type="submit" className="w-full rounded-xl py-3.5 text-white font-bold text-sm hover-lift" style={{ background: 'var(--primary-glow)' }}>Initialize Session</button>
                    </form>
                </div>
            )}

            {/* POST GIG MODAL */}
            {state.activeModal === 'post' && (
                <div className="glass-panel border border-[var(--border-line)] rounded-[2rem] w-full max-w-2xl p-8 relative shadow-2xl z-10">
                    <button onClick={closeModal} className="absolute top-6 right-6 text-sub hover:text-prime"><X size={20} /></button>
                    <h3 className="text-2xl font-black text-prime mb-2">Post a New Gig</h3>
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 flex items-start space-x-3">
                        <ShieldAlert className="text-amber-500 mt-0.5" size={20} />
                        <div><h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest">Secure Workspace Policy</h4><p className="text-[10px] text-sub mt-1">All payments are secured via Escrow. Do not share external links.</p></div>
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); closeModal(); alert('Gig posted securely to Database!'); }} className="space-y-4">
                        <div><label className="text-xs font-bold text-sub uppercase mb-1 block">Gig Title</label><input type="text" required className="w-full surface-bg border border-[var(--border-line)] rounded-xl px-4 py-3 text-sm text-prime focus:outline-none focus:border-[var(--primary-glow)]" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-xs font-bold text-sub uppercase mb-1 block">Budget (USD)</label><input type="number" required className="w-full surface-bg border border-[var(--border-line)] rounded-xl px-4 py-3 text-sm text-prime focus:outline-none focus:border-[var(--primary-glow)]" /></div>
                            <div><label className="text-xs font-bold text-sub uppercase mb-1 block">Location</label><input type="text" required className="w-full surface-bg border border-[var(--border-line)] rounded-xl px-4 py-3 text-sm text-prime focus:outline-none focus:border-[var(--primary-glow)]" /></div>
                        </div>
                        <div><label className="text-xs font-bold text-sub uppercase mb-1 block">Requirements</label><textarea required rows="4" className="w-full surface-bg border border-[var(--border-line)] rounded-xl px-4 py-3 text-sm text-prime focus:outline-none focus:border-[var(--primary-glow)]"></textarea></div>
                        <button type="submit" className="w-full rounded-xl py-3.5 text-white font-bold text-sm hover-lift mt-4" style={{ background: 'var(--primary-glow)' }}>Publish Gig Securely</button>
                    </form>
                </div>
            )}
        </div>
    );
}