import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../App';
import { staticDict } from '../../store';

export default function Header() {
  const { state, setState } = useContext(AppContext);
  const [openDrop, setOpenDrop] = useState(null);

  const t = staticDict[state.lang] || staticDict['en'];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.smart-dropdown') && !e.target.closest('.drop-trigger')) setOpenDrop(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleDrop = (menu, e) => {
    e.stopPropagation();
    setOpenDrop(openDrop === menu ? null : menu);
  };

  const changeTheme = (newTheme) => setState(prev => ({ ...prev, theme: newTheme }));
  const changeBg = (newBg) => setState(prev => ({ ...prev, bg: newBg }));
  const changeApi = (api) => setState(prev => ({ ...prev, transApi: api }));
  
  const logout = () => { setState(prev => ({ ...prev, user: null })); setOpenDrop(null); };

  const editBio = () => {
    const newBio = prompt("Enter your new bio:", state.user.bio);
    if (newBio) setState(prev => ({ ...prev, user: { ...prev.user, bio: newBio } }));
  };
  const editAvatar = () => {
    const newAv = prompt("Enter 1-2 letters for Avatar:", state.user.avatar);
    if (newAv) setState(prev => ({ ...prev, user: { ...prev.user, avatar: newAv.substring(0,2).toUpperCase() } }));
  };

  const hasNotif = state.notifications && state.notifications.length > 0;

  return (
    <header className="glass-panel border-b sticky top-0 z-40 px-3 sm:px-8 py-3 sm:py-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer hover:opacity-80 transition" onClick={() => setState(prev => ({ ...prev, view: 'gigs' }))}>
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-md" style={{ background: 'var(--primary-glow)' }}>V</div>
        <span className="font-bold text-xl sm:text-2xl tracking-tighter text-prime hidden sm:block">Vennamis</span>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4 relative">
        <select value={state.lang} onChange={(e) => setState(prev => ({ ...prev, lang: e.target.value }))} className="surface-bg border rounded-lg px-2 py-1.5 text-xs text-sub focus:outline-none cursor-pointer hidden md:block hover-lift">
          <option value="en" className="bg-[var(--bg-surface)] text-prime">EN</option>
          <option value="th" className="bg-[var(--bg-surface)] text-prime">TH</option>
        </select>

        {state.view === 'gigs' && (
          <button onClick={() => setState(prev => ({ ...prev, activeModal: 'modal-post' }))} className="flex items-center justify-center w-8 h-8 sm:w-auto sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-white font-bold text-xs hover-lift shadow-md" style={{ background: 'var(--primary-glow)' }}>
            <i data-lucide="plus" className="w-4 h-4 sm:mr-2"></i>
            <span className="hidden sm:inline">{t.btn_post}</span>
          </button>
        )}

        <div className="flex space-x-1 sm:space-x-2 border-l border-[var(--border-line)] pl-2 sm:pl-4 ml-1 sm:ml-2 relative">
          <button onClick={(e) => toggleDrop('notif', e)} className="drop-trigger p-1.5 sm:p-2 rounded-lg sm:rounded-xl surface-bg border shadow-sm text-sub hover:text-prime transition relative hover-lift">
            <i data-lucide="bell" className="w-4 h-4 sm:w-4.5 sm:h-4.5"></i>
            <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-[var(--bg-surface)] ${hasNotif ? '' : 'hidden'}`}></span>
          </button>
          
          <button onClick={(e) => toggleDrop('settings', e)} className="drop-trigger p-1.5 sm:p-2 rounded-lg sm:rounded-xl surface-bg border shadow-sm text-sub hover:text-prime transition hover-lift">
            <i data-lucide="settings" className="w-4 h-4 sm:w-4.5 sm:h-4.5"></i>
          </button>
        </div>

        <div className="ml-1 sm:ml-2">
          {state.user ? (
            <button onClick={(e) => toggleDrop('profile', e)} className="drop-trigger flex items-center space-x-2 p-1 border border-[var(--border-line)] rounded-lg sm:rounded-xl bg-white/5 hover:border-[var(--primary-glow)] transition hover-lift">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg flex items-center justify-center text-white font-bold text-[10px] sm:text-xs" style={{ background: 'var(--primary-glow)' }}>{state.user.avatar}</div>
              <span className="text-xs font-bold pr-2 text-prime hidden sm:inline">{state.user.name}</span>
            </button>
          ) : (
            <button onClick={() => setState(prev => ({ ...prev, activeModal: 'modal-login' }))} className="surface-bg border border-[var(--border-line)] text-prime text-[10px] sm:text-xs font-bold px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-2xl hover:border-[var(--primary-glow)] transition-all shadow-sm hover-lift">Login</button>
          )}
        </div>

        {/* --- Notifications Dropdown --- */}
        <div className={`smart-dropdown absolute top-[120%] right-0 w-[280px] sm:w-96 glass-panel border rounded-2xl shadow-2xl p-4 sm:p-5 flex flex-col z-50 ${openDrop === 'notif' ? 'active' : ''}`}>
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-[var(--border-line)]">
            <h3 className="text-sm font-bold text-prime flex items-center">Notifications</h3>
            <span className="text-[10px] text-[var(--primary-glow)] cursor-pointer hover:underline" onClick={() => setState(prev => ({...prev, notifications: []}))}>Mark all read</span>
          </div>
          {hasNotif ? (
            <div className="space-y-3">
              {state.notifications.map((n, i) => (
                <div key={i} className="p-3 surface-bg border rounded-xl hover-lift cursor-pointer"><p className="text-xs font-bold text-prime">{n.title}</p><p className="text-[10px] text-sub mt-1">{n.desc}</p></div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-sub text-center py-4">No new notifications</p>
          )}
        </div>

        {/* --- Settings Dropdown --- */}
        <div className={`smart-dropdown absolute top-[120%] right-0 w-[280px] sm:w-80 glass-panel border rounded-2xl shadow-2xl p-4 sm:p-6 z-50 ${openDrop === 'settings' ? 'active' : ''}`}>
          <div className="flex items-center space-x-2 mb-4 sm:mb-5 pb-3 border-b border-[var(--border-line)]">
            <i data-lucide="sliders" className="w-4 h-4 text-[var(--primary-glow)]"></i>
            <h3 className="text-base font-bold text-prime">System Config</h3>
          </div>
          <div className="space-y-4">
            
            <div className="p-3 surface-bg border rounded-xl space-y-3">
              <label className="text-[10px] uppercase text-sub font-bold tracking-widest">Visual Theme</label>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => changeTheme('light')} className={`border p-2 rounded-lg text-xs transition font-medium ${state.theme === 'light' ? 'border-[var(--primary-glow)] text-[var(--primary-glow)] bg-[var(--grid-color)]' : 'border-[var(--border-line)] text-prime hover:border-[var(--primary-glow)]'}`}>Clean</button>
                <button onClick={() => changeTheme('dark')} className={`border p-2 rounded-lg text-xs transition font-medium ${state.theme === 'dark' ? 'border-[var(--primary-glow)] text-[var(--primary-glow)] bg-[var(--grid-color)]' : 'border-[var(--border-line)] text-prime hover:border-[var(--primary-glow)]'}`}>Cyber</button>
                <button onClick={() => changeTheme('luxury')} className={`border p-2 rounded-lg text-xs transition font-medium ${state.theme === 'luxury' ? 'border-[var(--primary-glow)] text-[var(--primary-glow)] bg-[var(--grid-color)]' : 'border-[var(--border-line)] text-prime hover:border-[var(--primary-glow)]'}`}>Gold</button>
              </div>
            </div>
            
            <div className="p-3 surface-bg border rounded-xl space-y-3">
              <label className="text-[10px] uppercase text-sub font-bold tracking-widest">Wallpaper</label>
              <select value={state.bg} onChange={(e) => changeBg(e.target.value)} className="w-full bg-transparent border border-[var(--border-line)] rounded-lg p-2 text-xs text-prime outline-none focus:border-[var(--primary-glow)] cursor-pointer">
                <option value="cyber" className="bg-[var(--bg-surface)] text-prime">Cyber Matrix</option>
                <option value="galaxy" className="bg-[var(--bg-surface)] text-prime">Galaxy Flow</option>
                <option value="3d-matrix" className="bg-[var(--bg-surface)] text-prime">3D Neon Grid</option>
                <option value="landscape" className="bg-[var(--bg-surface)] text-prime">Landscapes</option>
              </select>
            </div>

            <div className="p-3 surface-bg border rounded-xl space-y-3">
              <label className="text-[10px] uppercase text-sub font-bold tracking-widest">Translation API</label>
              <select value={state.transApi} onChange={(e) => changeApi(e.target.value)} className="w-full bg-transparent border border-[var(--border-line)] rounded-lg p-2 text-xs text-prime outline-none focus:border-[var(--primary-glow)] cursor-pointer">
                <option value="google" className="bg-[var(--bg-surface)] text-prime">Google Translate</option>
                <option value="deepl" className="bg-[var(--bg-surface)] text-prime">DeepL</option>
                <option value="deepseek" className="bg-[var(--bg-surface)] text-prime">DeepSeek</option>
              </select>
            </div>

            <div className="p-3 surface-bg border rounded-xl space-y-3 md:hidden">
              <label className="text-[10px] uppercase text-sub font-bold tracking-widest">Language</label>
              <select value={state.lang} onChange={(e) => setState(prev => ({ ...prev, lang: e.target.value }))} className="w-full bg-transparent border border-[var(--border-line)] rounded-lg p-2 text-xs text-prime outline-none focus:border-[var(--primary-glow)] cursor-pointer">
                <option value="en" className="bg-[var(--bg-surface)] text-prime">English (EN)</option>
                <option value="th" className="bg-[var(--bg-surface)] text-prime">Thai (TH)</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- Profile Dropdown --- */}
        {state.user && (
          <div className={`smart-dropdown absolute top-[120%] right-0 w-[280px] sm:w-72 glass-panel border rounded-2xl shadow-2xl p-4 sm:p-6 z-50 ${openDrop === 'profile' ? 'active' : ''}`}>
            <div className="flex items-center space-x-4 mb-4 sm:mb-5 pb-4 sm:pb-5 border-b border-[var(--border-line)] group">
              <div onClick={editAvatar} className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg cursor-pointer hover:opacity-80 transition hover-lift" style={{ background: 'var(--primary-glow)' }} title="Change Avatar">{state.user.avatar}</div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-prime">{state.user.name}</h2>
                <span className="text-[10px] text-[var(--primary-glow)] flex items-center mt-0.5"><i data-lucide="shield-check" className="w-3 h-3 mr-1"></i> Verified</span>
              </div>
            </div>
            <div className="mb-5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-sub uppercase tracking-widest">Bio</span>
                <button onClick={editBio} className="text-[10px] text-[var(--primary-glow)] hover:underline">Edit</button>
              </div>
              <p className="text-xs text-prime italic bg-[var(--bg-surface)] p-2 rounded-lg border border-[var(--border-line)]">"{state.user.bio}"</p>
            </div>
            <div className="surface-bg border rounded-xl p-4 mb-5 text-center transition hover:border-[var(--primary-glow)] cursor-default">
              <p className="text-[10px] text-sub uppercase tracking-widest mb-1">Escrow Vault</p>
              <p className="text-2xl font-black glow-text">{state.user.balance}</p>
            </div>
            <button onClick={logout} className="w-full border border-red-500/50 text-red-500 hover:bg-red-500/10 rounded-xl py-2.5 font-bold text-xs transition flex justify-center items-center hover-lift">
              <i data-lucide="log-out" className="w-4 h-4 mr-2"></i>Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
