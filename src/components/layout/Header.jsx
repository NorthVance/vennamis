import React, { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from '../../App';
import { staticDict } from '../../store';
import { StorageService } from '../../services/storage';

export default function Header() {
  const { state, setState } = useContext(AppContext);
  const [openDrop, setOpenDrop] = useState(null);
  const fileInputRef = useRef(null);

  const t = staticDict[state.lang] || staticDict['en'];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.smart-dropdown') && !e.target.closest('.drop-trigger')) {
        setOpenDrop(null);
      }
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
  
  const logout = () => { 
    setState(prev => ({ ...prev, user: null, view: 'gigs' })); 
    setOpenDrop(null); 
  };

  const Bio = () => {
    const newBio = prompt("Enter your new bio:", state.user.bio);
    if (newBio) setState(prev => ({ ...prev, user: { ...prev.user, bio: newBio } }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const publicUrl = await StorageService.uploadFile(file, 'avatars');
    if (publicUrl) {
      setState(prev => ({ ...prev, user: { ...prev.user, avatar: publicUrl } }));
    }
  };

  const renderAvatar = (avatarData, sizeClasses) => {
    if (avatarData && (avatarData.startsWith('http') || avatarData.startsWith('blob:'))) {
      return <img src={avatarData} alt="Avatar" className={`object-cover ${sizeClasses}`} />;
    }
    return <div className={`flex items-center justify-center text-white font-bold ${sizeClasses}`} style={{ background: 'var(--primary-glow)' }}>{avatarData ? avatarData[0] : 'U'}</div>;
  };

  const hasNotif = state.notifications && state.notifications.length > 0;

  return (
    <header className="glass-panel border-b sticky top-0 z-40 px-3 sm:px-6 py-2.5 sm:py-3 flex justify-between items-center shadow-sm">
      
      <div className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition" onClick={() => setState(prev => ({ ...prev, view: 'gigs' }))}>
        <svg className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 20 L50 85 L85 20 L68 20 L50 60 L32 20 Z" fill="#10B981" />
          <circle cx="50" cy="40" r="10" fill="#10B981" />
          <path d="M30 15 Q50 32 70 15" stroke="#10B981" strokeWidth="6" strokeLinecap="round" />
        </svg>
        <span className="font-bold text-lg sm:text-xl tracking-tighter text-prime hidden sm:block">Vennamis</span>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3 relative">
        
        <select value={state.lang} onChange={(e) => setState(prev => ({ ...prev, lang: e.target.value }))} className="surface-bg border rounded-lg px-1.5 py-1 sm:px-2 sm:py-1.5 text-[10px] sm:text-xs text-sub font-bold focus:outline-none cursor-pointer hover-lift">
          <option value="en" className="bg-[var(--bg-surface)] text-prime">EN</option>
          <option value="th" className="bg-[var(--bg-surface)] text-prime">TH</option>
        </select>

        {state.view === 'gigs' && (
          <button onClick={() => setState(prev => ({ ...prev, activeModal: 'modal-post' }))} className="flex items-center justify-center w-7 h-7 sm:w-auto sm:px-3 sm:py-1.5 rounded-lg text-white font-bold text-[10px] sm:text-xs hover-lift shadow-md shrink-0" style={{ background: 'var(--primary-glow)' }}>
            <i data-lucide="plus" className="w-3.5 h-3.5 sm:mr-1.5"></i>
            <span className="hidden sm:inline">{t.btn_post}</span>
          </button>
        )}

        <div className="flex space-x-1 sm:space-x-1.5 border-l border-[var(--border-line)] pl-2 sm:pl-3 ml-1 sm:ml-2 relative">
          <button onClick={(e) => toggleDrop('notif', e)} className="drop-trigger p-1.5 rounded-lg surface-bg border shadow-sm text-sub hover:text-prime transition relative hover-lift">
            <i data-lucide="bell" className="w-4 h-4"></i>
            <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 border border-[var(--bg-surface)] ${hasNotif ? '' : 'hidden'}`}></span>
          </button>
          <button onClick={(e) => toggleDrop('settings', e)} className="drop-trigger p-1.5 rounded-lg surface-bg border shadow-sm text-sub hover:text-prime transition hover-lift">
            <i data-lucide="settings" className="w-4 h-4"></i>
          </button>
        </div>

        <div className="ml-1 sm:ml-2">
          {state.user ? (
            <button onClick={(e) => toggleDrop('profile', e)} className="drop-trigger flex items-center space-x-1.5 p-1 border border-[var(--border-line)] rounded-lg bg-white/5 hover:border-[var(--primary-glow)] transition hover-lift">
              {renderAvatar(state.user.avatar, "w-6 h-6 rounded-md text-[9px]")}
              <span className="text-[10px] sm:text-xs font-bold pr-1.5 text-prime hidden sm:inline">{state.user.name}</span>
            </button>
          ) : (
            <button onClick={() => setState(prev => ({ ...prev, activeModal: 'modal-login' }))} className="surface-bg border border-[var(--border-line)] text-prime text-[10px] font-bold px-3 py-1.5 rounded-lg hover:border-[var(--primary-glow)] transition-all shadow-sm hover-lift">Login</button>
          )}
        </div>

        {openDrop === 'notif' && (
          <div className="smart-dropdown absolute top-[120%] right-0 w-[260px] sm:w-80 glass-panel border rounded-2xl shadow-2xl p-4 flex flex-col z-50 active">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-[var(--border-line)]">
              <h3 className="text-xs font-bold text-prime flex items-center">Notifications</h3>
              <span className="text-[9px] text-[var(--primary-glow)] cursor-pointer hover:underline" onClick={() => setState(prev => ({...prev, notifications: []}))}>Mark all read</span>
            </div>
            {hasNotif ? (
              <div className="space-y-2">
                {state.notifications.map((n, i) => (
                  <div key={i} className="p-2.5 surface-bg border rounded-xl hover-lift cursor-pointer">
                    <p className="text-[11px] font-bold text-prime">{n.title}</p>
                    <p className="text-[9px] text-sub mt-0.5">{n.desc}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-sub text-center py-3">No new notifications</p>
            )}
          </div>
        )}

        {openDrop === 'settings' && (
          <div className="smart-dropdown absolute top-[120%] right-0 w-[260px] sm:w-72 glass-panel border rounded-2xl shadow-2xl p-4 z-50 active">
            <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-[var(--border-line)]">
              <i data-lucide="sliders" className="w-3.5 h-3.5 text-[var(--primary-glow)]"></i>
              <h3 className="text-xs font-bold text-prime">System Config</h3>
            </div>
            <div className="space-y-3">
              <div className="p-2.5 surface-bg border rounded-xl space-y-2">
                <label className="text-[9px] uppercase text-sub font-bold tracking-widest">Visual Theme</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => changeTheme('light')} className={`btn-press p-1.5 rounded-lg text-[10px] transition font-medium ${state.theme === 'light' ? 'border-[var(--primary-glow)] text-[var(--primary-glow)] bg-[var(--grid-color)] border' : 'border border-[var(--border-line)] text-prime hover:border-[var(--primary-glow)]'}`}>Clean</button>
                  <button onClick={() => changeTheme('dark')} className={`btn-press p-1.5 rounded-lg text-[10px] transition font-medium ${state.theme === 'dark' ? 'border-[var(--primary-glow)] text-[var(--primary-glow)] bg-[var(--grid-color)] border' : 'border border-[var(--border-line)] text-prime hover:border-[var(--primary-glow)]'}`}>Cyber</button>
                </div>
              </div>
              <div className="p-2.5 surface-bg border rounded-xl space-y-2">
                <label className="text-[9px] uppercase text-sub font-bold tracking-widest">Wallpaper</label>
                <select value={state.bg} onChange={(e) => changeBg(e.target.value)} className="w-full bg-transparent border border-[var(--border-line)] rounded-lg p-1.5 text-[10px] text-prime outline-none focus:border-[var(--primary-glow)] cursor-pointer">
                  <option value="cyber" className="bg-[var(--bg-surface)]">Cyber Matrix</option>
                  <option value="galaxy" className="bg-[var(--bg-surface)]">Galaxy Flow</option>
                  <option value="3d-matrix" className="bg-[var(--bg-surface)]">3D Neon Grid</option>
                  <option value="landscape" className="bg-[var(--bg-surface)]">Landscapes</option>
                </select>
              </div>
              <div className="p-2.5 surface-bg border rounded-xl space-y-2">
                <label className="text-[9px] uppercase text-sub font-bold tracking-widest">Translation API</label>
                <select value={state.transApi} onChange={(e) => changeApi(e.target.value)} className="w-full bg-transparent border border-[var(--border-line)] rounded-lg p-1.5 text-[10px] text-prime outline-none focus:border-[var(--primary-glow)] cursor-pointer">
                  <option value="google" className="bg-[var(--bg-surface)]">Google Translate</option>
                  <option value="deepl" className="bg-[var(--bg-surface)]">DeepL</option>
                  <option value="deepseek" className="bg-[var(--bg-surface)]">DeepSeek</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {openDrop === 'profile' && state.user && (
          <div className="smart-dropdown absolute top-[120%] right-0 w-[260px] sm:w-72 glass-panel border rounded-2xl shadow-2xl p-4 z-50 active">
            <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-[var(--border-line)] group">
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" />
              <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer hover:opacity-80 transition hover-lift relative" title="Upload Avatar">
                {renderAvatar(state.user.avatar, "w-10 h-10 rounded-xl text-sm")}
                <div className="absolute -bottom-1 -right-1 bg-gray-800 rounded-full p-0.5 border border-gray-600"><i data-lucide="camera" className="w-2.5 h-2.5 text-white"></i></div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-prime truncate">{state.user.name}</h2>
                <span className="text-[9px] text-[var(--primary-glow)] flex items-center mt-0.5"><i data-lucide="shield-check" className="w-3 h-3 mr-1"></i> Verified</span>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <button onClick={() => { setState(prev => ({ ...prev, view: 'workspace' })); setOpenDrop(null); }} className="btn-press w-full surface-bg border border-[var(--border-line)] text-prime hover:border-[var(--primary-glow)] rounded-xl py-2 font-bold text-[10px] transition flex justify-center items-center shadow-sm">
                <i data-lucide="layout-dashboard" className="w-3.5 h-3.5 mr-1.5 text-[var(--primary-glow)]"></i> My Workspace
              </button>
              {state.user.name === 'Admin User' && (
                <button onClick={() => { setState(prev => ({ ...prev, view: 'admin' })); setOpenDrop(null); }} className="btn-press w-full surface-bg border border-[var(--border-line)] text-prime hover:border-red-500 rounded-xl py-2 font-bold text-[10px] transition flex justify-center items-center shadow-sm">
                  <i data-lucide="shield" className="w-3.5 h-3.5 mr-1.5 text-red-500"></i> Admin Center
                </button>
              )}
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] text-sub uppercase tracking-widest">Bio</span>
                <button onClick={Bio} className="text-[9px] text-[var(--primary-glow)] hover:underline">Edit</button>
              </div>
              <p className="text-[10px] text-prime italic bg-[var(--bg-surface)] p-2 rounded-lg border border-[var(--border-line)] line-clamp-2">"{state.user.bio}"</p>
            </div>
            
            <button onClick={logout} className="w-full border border-red-500/50 text-red-500 hover:bg-red-500/10 rounded-xl py-2 font-bold text-[10px] transition flex justify-center items-center hover-lift">
              <i data-lucide="log-out" className="w-3.5 h-3.5 mr-1.5"></i>Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
