import React, { useContext, useState } from 'react';
// แก้ไข Path ถอยหลังแค่ 2 ชั้น (จาก components/layout ไป src)
import { AppContext } from '../../App';
import { Bell, MessageSquare, Settings, PlusCircle, Sun, Moon, Sparkles } from 'lucide-react';

export default function Header() {
    const { state, setState, t } = useContext(AppContext);
    const [showProfile, setShowProfile] = useState(false);

    const changeTheme = (newTheme) => setState({ ...state, theme: newTheme });
    const changeView = (newView) => setState({ ...state, view: newView });
    const openModal = (modalName) => setState({ ...state, activeModal: modalName });
    const toggleChat = () => setState({ ...state, isChatOpen: !state.isChatOpen });

    return (
        <header className="glass-panel border-b border-[var(--border-line)] sticky top-0 z-40 px-4 sm:px-8 py-4 flex justify-between items-center shadow-sm">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => changeView('gigs')}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl" style={{ background: 'var(--primary-glow)', boxShadow: '0 0 15px var(--grid-color)' }}>V</div>
                <span className="font-bold text-2xl tracking-tighter text-prime hidden sm:block">Vennamis</span>
            </div>
            
            <nav className="hidden lg:flex space-x-8 text-xs font-bold uppercase tracking-widest text-sub">
                <button onClick={() => changeView('gigs')} className={`nav-link ${state.view === 'gigs' ? 'active text-[var(--primary-glow)]' : 'hover:text-[var(--primary-glow)]'}`}>{t.nav_explore}</button>
                <button onClick={() => changeView('community')} className={`nav-link ${state.view === 'community' ? 'active text-[var(--primary-glow)]' : 'hover:text-[var(--primary-glow)]'}`}>Community</button>
            </nav>

            <div className="flex items-center space-x-2 sm:space-x-4 relative">
                <select value={state.lang} onChange={(e) => setState({...state, lang: e.target.value})} className="surface-bg border border-[var(--border-line)] rounded-lg px-2 py-1.5 text-xs text-sub focus:outline-none cursor-pointer hidden sm:block hover-lift">
                    <option value="en">EN</option><option value="th">TH</option>
                </select>

                <div className="bg-slate-800/10 p-1 rounded-xl flex border border-[var(--border-line)] text-xs">
                    <button onClick={() => changeTheme('light')} className={`p-1 rounded-lg transition ${state.theme === 'light' ? 'text-[var(--primary-glow)] bg-[var(--grid-color)]' : 'text-slate-400 hover:text-prime'}`}><Sun size={14} /></button>
                    <button onClick={() => changeTheme('dark')} className={`p-1 rounded-lg transition ${state.theme === 'dark' ? 'text-[var(--primary-glow)] bg-[var(--grid-color)]' : 'text-slate-400 hover:text-prime'}`}><Moon size={14} /></button>
                    <button onClick={() => changeTheme('luxury')} className={`p-1 rounded-lg transition ${state.theme === 'luxury' ? 'text-[var(--primary-glow)] bg-[var(--grid-color)]' : 'text-slate-400 hover:text-prime'}`}><Sparkles size={14} /></button>
                </div>

                {state.view === 'gigs' && (
                    <button onClick={() => state.user ? openModal('post') : openModal('login')} className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-xl text-white font-bold text-xs hover-lift shadow-md" style={{ background: 'var(--primary-glow)' }}>
                        <PlusCircle size={14} /><span>{t.btn_post}</span>
                    </button>
                )}

                <div className="flex space-x-2 border-l border-[var(--border-line)] pl-4 ml-2">
                    <button className="p-2 rounded-xl surface-bg border border-[var(--border-line)] shadow-sm text-sub hover:text-prime transition hover-lift"><Bell size={18} /></button>
                    <button onClick={toggleChat} className="p-2 rounded-xl surface-bg border border-[var(--border-line)] shadow-sm text-sub hover:text-prime transition hover-lift"><MessageSquare size={18} /></button>
                </div>

                <div className="ml-2 relative">
                    {state.user ? (
                        <button onClick={() => setShowProfile(!showProfile)} className="flex items-center space-x-2 p-1 border border-[var(--border-line)] rounded-xl bg-white/5 hover:border-[var(--primary-glow)] transition">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs" style={{ background: 'var(--primary-glow)' }}>{state.user.avatar}</div>
                            <span className="text-xs font-bold pr-2 text-prime hidden sm:inline">{state.user.name}</span>
                        </button>
                    ) : (
                        <button onClick={() => openModal('login')} className="surface-bg border border-[var(--border-line)] text-prime text-xs font-bold px-5 py-2.5 rounded-2xl hover:border-[var(--primary-glow)] transition-all shadow-sm">Login</button>
                    )}

                    {showProfile && state.user && (
                        <div className="absolute top-[110%] right-0 w-64 glass-panel border border-[var(--border-line)] rounded-2xl shadow-2xl p-5 z-50">
                            <div className="text-center mb-4">
                                <p className="text-sm font-bold text-prime">{state.user.name}</p>
                                <p className="text-[10px] text-[var(--primary-glow)]">Verified Partner</p>
                            </div>
                            <button onClick={() => { setState({...state, user: null}); setShowProfile(false); }} className="w-full border border-red-500/50 text-red-500 hover:bg-red-500/10 rounded-xl py-2 font-bold text-xs transition">Sign Out</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}