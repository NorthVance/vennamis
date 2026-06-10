import React, { useContext, useState } from 'react';
import { AppContext } from '../../App';

export default function Header() {
  const { state, setState, t } = useContext(AppContext);
  const [dropdown, setDropdown] = useState(null); // 'notif' | 'settings' | 'profile' | null

  const toggleDrop = (menu) => setDropdown(dropdown === menu ? null : menu);

  return (
    <header className="glass-panel border-b sticky top-0 z-40 px-4 sm:px-8 py-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setState({...state, view: 'gigs'})}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-[0_0_15px_var(--grid-color)]" style={{ background: 'var(--primary-glow)' }}>V</div>
        <span className="font-bold text-2xl tracking-tighter text-prime hidden sm:block">Vennamis</span>
      </div>
      
      <div className="flex items-center space-x-2 sm:space-x-4 relative">
        <select value={state.lang} onChange={(e) => setState({...state, lang: e.target.value})} className="surface-bg border rounded-lg px-2 py-1.5 text-xs text-sub focus:outline-none cursor-pointer hidden sm:block hover-lift">
          <option value="en">EN</option><option value="th">TH</option>
        </select>
        
        {state.view === 'gigs' && (
          <button onClick={() => setState({...state, activeModal: 'post'})} className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-xl text-white font-bold text-xs hover-lift shadow-md" style={{ background: 'var(--primary-glow)' }}>
            <span>{t('btn_post')}</span>
          </button>
        )}

        <div className="flex space-x-2 border-l border-[var(--border-line)] pl-4 ml-2">
          <button onClick={() => toggleDrop('settings')} className="p-2 rounded-xl surface-bg border shadow-sm text-sub hover:text-prime transition hover-lift">
            ⚙️
          </button>
        </div>

        {/* User Auth Section */}
        <div className="ml-2">
          {state.user ? (
            <button onClick={() => toggleDrop('profile')} className="flex items-center space-x-2 p-1 border border-[var(--border-line)] rounded-xl bg-white/5 hover:border-[var(--primary-glow)] transition">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs" style={{ background: 'var(--primary-glow)' }}>{state.user.avatar}</div>
            </button>
          ) : (
            <button onClick={() => setState({...state, activeModal: 'login'})} className="surface-bg border border-[var(--border-line)] text-prime text-xs font-bold px-5 py-2.5 rounded-2xl hover:border-[var(--primary-glow)] transition-all shadow-sm">Login</button>
          )}
        </div>

        {/* Settings Dropdown */}
        {dropdown === 'settings' && (
          <div className="absolute top-[110%] right-16 w-80 glass-panel border rounded-2xl shadow-2xl p-6 z-50">
            <h3 className="text-base font-bold text-prime mb-4">System Config</h3>
            <div className="grid grid-cols-3 gap-2">
              {['light', 'dark', 'luxury'].map(theme => (
                <button key={theme} onClick={() => setState({...state, theme})} className={`border p-2 rounded-lg text-xs capitalize ${state.theme === theme ? 'border-[var(--primary-glow)] text-[var(--primary-glow)]' : 'border-[var(--border-line)] text-prime'} hover:border-[var(--primary-glow)] transition`}>
                  {theme}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
