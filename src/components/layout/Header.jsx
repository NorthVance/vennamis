import React, { useContext, useState } from 'react';
import { AppContext } from '../../App';

export default function Header() {
    const { state, dispatch, t } = useContext(AppContext);
    const [activeDropdown, setActiveDropdown] = useState(null);

    const toggleDrop = (id) => setActiveDropdown(activeDropdown === id ? null : id);

    return (
        <header className="glass-panel border-b sticky top-0 z-40 px-4 sm:px-8 py-4 flex justify-between items-center shadow-sm">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => dispatch('currentView', 'gigs')}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl" style={{ background: 'var(--primary-glow)', boxShadow: '0 0 15px var(--grid-color)' }}>V</div>
                <span className="font-bold text-2xl tracking-tighter text-prime hidden sm:block">Vennamis</span>
            </div>
            
            <nav className="hidden lg:flex space-x-8 text-xs font-bold uppercase tracking-widest text-sub">
                {['gigs', 'community', 'traders', 'news'].map(view => (
                    <button 
                        key={view}
                        onClick={() => dispatch('currentView', view)} 
                        className={`nav-link flex items-center ${state.currentView === view ? 'active' : ''}`}
                    >
                        {view === 'gigs' ? t.nav_explore : view.charAt(0).toUpperCase() + view.slice(1)}
                    </button>
                ))}
            </nav>

            <div className="flex items-center space-x-2 sm:space-x-4 relative">
                <select value={state.lang} onChange={(e) => dispatch('lang', e.target.value)} className="surface-bg border rounded-lg px-2 py-1.5 text-xs text-sub focus:outline-none cursor-pointer hidden sm:block hover-lift">
                    <option value="en">EN</option><option value="th">TH</option>
                </select>

                {state.currentView === 'gigs' && (
                    <button className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-xl text-white font-bold text-xs hover-lift shadow-md" style={{ background: 'var(--primary-glow)' }}>
                        <span data-tr="btn_post">{t.btn_post}</span>
                    </button>
                )}

                <div className="flex space-x-2 border-l border-[var(--border-line)] pl-4 ml-2">
                    <button onClick={() => toggleDrop('settings')} className="p-2 rounded-xl surface-bg border shadow-sm text-sub hover:text-prime transition hover-lift">
                        ⚙️
                    </button>
                </div>

                <div className="ml-2">
                    <button className="surface-bg border border-[var(--border-line)] text-prime text-xs font-bold px-5 py-2.5 rounded-2xl hover:border-[var(--primary-glow)] transition-all shadow-sm">
                        Login
                    </button>
                </div>

                {/* Settings Dropdown (Converted to JSX) */}
                {activeDropdown === 'settings' && (
                    <div className="absolute top-[110%] right-4 w-80 glass-panel border rounded-2xl shadow-2xl p-6 z-50">
                        <h3 className="text-base font-bold text-prime mb-4 border-b border-[var(--border-line)] pb-2">System Config</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] uppercase text-sub font-bold">Visual Theme</label>
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    {['light', 'dark', 'luxury'].map(theme => (
                                        <button key={theme} onClick={() => dispatch('theme', theme)} className={`border p-2 rounded-lg text-xs font-bold ${state.theme === theme ? 'border-[var(--primary-glow)] text-[var(--primary-glow)] bg-[var(--grid-color)]' : 'border-[var(--border-line)] text-prime bg-[var(--bg-surface)]'}`}>
                                            {theme.charAt(0).toUpperCase() + theme.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}