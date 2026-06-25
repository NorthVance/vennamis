import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../App';
import { AuthService, supabase } from '../../services/db';

export default function Modals() {
  const { state, setState } = useContext(AppContext);
  const { activeModal, selectedItem, user, targetUser } = state; 

  const [gigForm, setGigForm] = useState({ title: '', price: '', loc: '', desc: '' });
  const [newsUrl, setNewsUrl] = useState('');
  const [newsPreview, setNewsPreview] = useState(null);
  const [isFetchingNews, setIsFetchingNews] = useState(false);
  
  const [isRegister, setIsRegister] = useState(false);
  const [googleStep, setGoogleStep] = useState(1);
  const [escrowStep, setEscrowStep] = useState(0); 
  
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authLoading, setAuthLoading] = useState(false);

  // SYS: Reset
  const closeModal = () => {
    setState(prev => ({ ...prev, activeModal: null, selectedItem: null, targetUser: null }));
    setNewsPreview(null); setNewsUrl(''); setGigForm({ title: '', price: '', loc: '', desc: '' });
    setAuthForm({ name: '', email: '', password: '' });
    setTimeout(() => { setIsRegister(false); setGoogleStep(1); setEscrowStep(0); }, 300); 
  };

  useEffect(() => {
    if (activeModal && window.lucide) window.lucide.createIcons();
  }, [activeModal, selectedItem, newsPreview, isRegister, googleStep, escrowStep, targetUser]);

  // AUTH: Execution
  const handleAuth = async (e) => {
    e.preventDefault();
    if (!supabase) {
      const mockName = isRegister ? (authForm.name || 'New User') : 'Admin User';
      setState(prev => ({ ...prev, user: { name: mockName, avatar: mockName.substring(0,2).toUpperCase(), balance: '$1,500.00', bio: 'Global Worker.' }, activeModal: null }));
      return;
    }
    setAuthLoading(true);
    if (isRegister) {
      const { error } = await AuthService.signUp(authForm.email, authForm.password, authForm.name);
      if (error) alert(error.message);
      else { alert('Registration sent! Check your email to verify.'); closeModal(); }
    } else {
      const { error } = await AuthService.signIn(authForm.email, authForm.password);
      if (error) alert(error.message);
      else closeModal();
    }
    setAuthLoading(false);
  };

  const handleGoogleAuth = async () => {
    if (!supabase) setState(prev => ({ ...prev, user: { name: 'Alex Google', avatar: 'AL', balance: '$1,500.00', bio: 'Global Worker.' }, activeModal: null }));
    else await AuthService.signInWithGoogle();
  };

  // REQ: Actions
  const submitGig = (e) => {
    e.preventDefault();
    const newGig = { id: 'g' + Date.now(), type: 'gig', host: user ? user.name : 'Anonymous', title: gigForm.title, desc: gigForm.desc, price: parseFloat(gigForm.price) || 0, loc: gigForm.loc || 'Remote', tag: 'New Gig' };
    setState(prev => ({ ...prev, data: { ...prev.data, gigs: [newGig, ...prev.data.gigs] }, view: 'gigs', activeModal: null }));
  };

  const fetchNewsMetadata = async () => {
    if (!newsUrl) return alert("URL Required");
    setIsFetchingNews(true);
    try {
      const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(newsUrl)}`);
      const data = await res.json();
      if (data.status === 'success') setNewsPreview({ title: data.data.title || "No title", desc: data.data.description || "No description", url: newsUrl });
      else throw new Error();
    } catch(e) { setNewsPreview({ title: "News from " + new URL(newsUrl).hostname, desc: "Auto-fetched content (demo mode)", url: newsUrl }); }
    setIsFetchingNews(false);
  };

  const confirmAddNews = () => {
    if (newsPreview) {
      const newItem = { id: 'n' + Date.now(), type: 'news', host: user ? user.name : 'Anonymous', title: newsPreview.title, desc: newsPreview.desc, source: 'Custom', tag: 'User Added' };
      setState(prev => ({ ...prev, data: { ...prev.data, news: [newItem, ...prev.data.news] }, view: 'news', activeModal: null }));
    }
  };

  const handleEscrowTransaction = () => { setEscrowStep(1); setTimeout(() => setEscrowStep(2), 3000); };

  const renderAvatar = (avatarData, sizeClasses) => {
    if (avatarData && (avatarData.startsWith('http') || avatarData.startsWith('blob:'))) {
      return <img src={avatarData} alt="Avatar" className={`object-cover ${sizeClasses}`} />;
    }
    return <div className={`flex items-center justify-center text-white font-bold bg-gray-700 ${sizeClasses}`}>{avatarData ? avatarData[0] : 'U'}</div>;
  };

  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-overlay">
      <div className="absolute inset-0 bg-black/60" onClick={closeModal}></div>
      
      {/* UI: OAUTH */}
      {activeModal === 'modal-google-consent' ? (
        <div className="relative bg-white border border-gray-200 rounded-3xl w-full p-6 sm:p-8 shadow-2xl max-w-md animate-modal-pop font-sans text-gray-800">
          <button onClick={closeModal} className="absolute top-4 right-4 sm:top-5 sm:right-5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-full transition"><i data-lucide="x" className="w-5 h-5"></i></button>
          <div className="flex justify-center mb-4">
             <svg className="w-10 h-10" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.27H12v4.51h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.39-4.87 3.39-8.63z"/><path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-3.9 1.09-3.14 0-5.82-2.33-6.77-5.46l-3.85 2.99C3.37 20.32 7.35 23 12 23z"/><path fill="#FBBC05" d="M5.26 14.37c-.24-.72-.38-1.49-.38-2.37s.14-1.65.38-2.37L1.41 6.63C.51 8.44 0 10.46 0 12.6s.51 4.16 1.41 5.97l3.85-2.99s.12-.09 0 0z"/><path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.63l3.2-3.2C17.51 1.64 14.96 1 12 1 7.35 1 3.37 3.68 1.41 7.62l3.85 2.99C6.18 7.37 8.86 5.04 12 5.04z"/></svg>
          </div>
          {googleStep === 1 && (
            <div className="animate-[fadeStep_0.3s_ease_forwards]">
              <h3 className="text-xl sm:text-2xl font-medium text-center text-gray-900 mb-2">Sign in with Google</h3>
              <p className="text-sm text-center text-gray-600 mb-6">Choose an account to continue to <span className="font-bold text-gray-900">Vennamis</span></p>
              <div className="border border-gray-300 rounded-xl overflow-hidden mb-6">
                <button onClick={() => setGoogleStep(2)} className="w-full flex items-center p-4 hover:bg-gray-50 border-b border-gray-300 transition text-left">
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm mr-4 tracking-wider">AG</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Alex Global</p>
                    <p className="text-xs text-gray-500">alex.global@gmail.com</p>
                  </div>
                </button>
              </div>
            </div>
          )}
          {googleStep === 2 && (
            <div className="animate-[fadeStep_0.3s_ease_forwards]">
              <h3 className="text-xl sm:text-2xl font-medium text-center text-gray-900 mb-6">Vennamis wants to access your Google Account</h3>
              <div className="flex justify-end space-x-3 mt-8">
                <button onClick={closeModal} className="px-5 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition">Cancel</button>
                <button onClick={handleGoogleAuth} className="px-5 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition shadow-sm">Allow</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* UI: MAIN MODALS */
        <div className={`relative glass-panel border rounded-3xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto animate-modal-pop ${activeModal === 'modal-gig-detail' || activeModal === 'modal-post' ? 'max-w-2xl' : 'max-w-md'}`}>
          <button onClick={closeModal} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-sub hover:text-prime transition hover:scale-110"><i data-lucide="x" className="w-5 h-5"></i></button>
          
          {/* AUTH */}
          {activeModal === 'modal-login' && (
            <>
              <h3 className="text-2xl sm:text-3xl font-black text-prime mb-2">Vennamis</h3>
              <p className="text-[10px] sm:text-xs text-sub mb-6 sm:mb-8 uppercase tracking-widest">{isRegister ? 'Create Escrow Account' : 'Secure Authentication'}</p>
              <div className="space-y-3 mb-6">
                  <button onClick={() => setState(prev => ({...prev, activeModal: 'modal-google-consent'}))} className="w-full surface-bg border border-[var(--border-line)] hover:border-[var(--primary-glow)] rounded-xl py-3 flex justify-center items-center space-x-3 hover-lift text-prime text-sm font-bold transition">
                      <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.63l3.2-3.2C17.51 1.64 14.96 1 12 1 7.35 1 3.37 3.68 1.41 7.62l3.85 2.99C6.18 7.37 8.86 5.04 12 5.04z"/><path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.27H12v4.51h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.39-4.87 3.39-8.63z"/><path fill="#FBBC05" d="M5.26 14.37c-.24-.72-.38-1.49-.38-2.37s.14-1.65.38-2.37L1.41 6.63C.51 8.44 0 10.46 0 12.6s.51 4.16 1.41 5.97l3.85-2.99s.12-.09 0 0z"/><path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-3.9 1.09-3.14 0-5.82-2.33-6.77-5.46l-3.85 2.99C3.37 20.32 7.35 23 12 23z"/></svg>
                      <span>{isRegister ? 'Sign up with Google' : 'Continue with Google'}</span>
                  </button>
              </div>
              <div className="flex items-center space-x-4 mb-6"><div className="flex-1 border-t border-[var(--border-line)]"></div><span className="text-[10px] text-sub uppercase">or email</span><div className="flex-1 border-t border-[var(--border-line)]"></div></div>
              <form onSubmit={handleAuth} className="space-y-4">
                {isRegister && <input type="text" value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} required placeholder="Full Name" className="w-full bg-transparent surface-bg border rounded-xl px-4 py-3 text-sm text-prime outline-none focus:border-[var(--primary-glow)] transition" />}
                <input type="email" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} required placeholder="Encrypted Email" className="w-full bg-transparent surface-bg border rounded-xl px-4 py-3 text-sm text-prime outline-none focus:border-[var(--primary-glow)] transition" />
                <input type="password" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} required placeholder="Password" className="w-full bg-transparent surface-bg border rounded-xl px-4 py-3 text-sm text-prime outline-none focus:border-[var(--primary-glow)] transition" />
                {!isRegister && <div className="text-right"><a href="#" className="text-[10px] text-[var(--primary-glow)] hover:underline">Forgot Password?</a></div>}
                <button type="submit" disabled={authLoading} className="w-full rounded-xl py-3.5 text-white font-bold text-sm hover-lift disabled:opacity-50" style={{ background: 'var(--primary-glow)' }}>{authLoading ? 'Processing...' : (isRegister ? 'Create Account' : 'Initialize Session')}</button>
              </form>
              <div className="mt-6 text-center">
                <p className="text-xs text-sub">{isRegister ? "Already have an account? " : "Don't have an account? "}<button onClick={() => setIsRegister(!isRegister)} className="text-[var(--primary-glow)] font-bold hover:underline">{isRegister ? 'Log in' : 'Sign up'}</button></p>
              </div>
            </>
          )}

          {/* 📍 [V.19.0] PUBLIC PROFILE MODAL */}
          {activeModal === 'modal-profile' && targetUser && (
            <div className="animate-modal-pop">
              <div className="flex items-center space-x-5 border-b border-[var(--border-line)] pb-6 mb-6">
                {renderAvatar(targetUser.avatar, "w-20 h-20 rounded-2xl text-3xl shadow-xl border-2 border-[var(--border-line)]")}
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-prime">{targetUser.name}</h2>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-[10px] sm:text-xs text-[var(--primary-glow)] flex items-center bg-[var(--primary-glow)]/10 px-2 py-1 rounded-md border border-[var(--primary-glow)]/30"><i data-lucide="shield-check" className="w-3.5 h-3.5 mr-1"></i> Identity Verified</span>
                    <span className="text-[10px] sm:text-xs text-sub">Joined 2025</span>
                  </div>
                </div>
              </div>

              {/* Stats Bento */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="surface-bg border border-[var(--border-line)] rounded-xl p-4 text-center">
                  <p className="text-[10px] text-sub uppercase tracking-widest mb-1">Success</p>
                  <p className="text-xl font-black text-prime">98%</p>
                </div>
                <div className="surface-bg border border-[var(--border-line)] rounded-xl p-4 text-center">
                  <p className="text-[10px] text-sub uppercase tracking-widest mb-1">Jobs</p>
                  <p className="text-xl font-black text-prime">124</p>
                </div>
                <div className="surface-bg border border-[var(--border-line)] rounded-xl p-4 text-center">
                  <p className="text-[10px] text-sub uppercase tracking-widest mb-1">Rating</p>
                  <p className="text-xl font-black text-amber-400 flex items-center justify-center"><i data-lucide="star" className="w-4 h-4 mr-1 fill-amber-400"></i> 4.9</p>
                </div>
              </div>

              {/* Bio */}
              <div className="mb-6">
                <p className="text-[10px] text-sub uppercase tracking-widest mb-2">About</p>
                <p className="text-sm text-prime leading-relaxed">Top-rated professional specializing in digital deliverables. Consistently delivers high-quality work securely via the Vennamis Escrow protocol.</p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button onClick={() => { closeModal(); setState(prev => ({...prev, isChatOpen: true, chatHost: targetUser.name})) }} className="flex-1 py-3.5 rounded-xl text-white font-bold text-sm hover-lift shadow-md flex items-center justify-center" style={{ background: 'var(--primary-glow)' }}>
                  <i data-lucide="message-square" className="w-4 h-4 mr-2"></i> Message
                </button>
                <button onClick={() => alert('User Reported to Admins.')} className="px-4 py-3.5 rounded-xl surface-bg border border-[var(--border-line)] text-sub hover:text-red-500 hover:border-red-500 transition hover-lift">
                  <i data-lucide="flag" className="w-4 h-4"></i>
                </button>
              </div>
            </div>
          )}

          {/* ESCROW */}
          {activeModal === 'modal-escrow' && selectedItem && (
            <div className="flex flex-col h-full"> ... (Escrow Code Remains Same) ... </div>
          )}

          {/* CREATE GIG */}
          {activeModal === 'modal-post' && (
            <> ... (Post Gig Code Remains Same) ... </>
          )}

          {/* GIG DETAIL */}
          {activeModal === 'modal-gig-detail' && selectedItem && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start mb-4 sm:mb-6 gap-2 sm:gap-4">
                <div>
                  <h2 className="text-xl sm:text-3xl font-black text-prime mb-2">{selectedItem.title}</h2>
                  <span className="text-[9px] sm:text-xs text-sub uppercase tracking-widest border border-[var(--border-line)] px-2 py-1 rounded-lg">{selectedItem.tag || selectedItem.loc || 'Post'}</span>
                </div>
                {selectedItem.price > 0 && <span className="text-xl sm:text-2xl font-black glow-text">${selectedItem.price}</span>}
              </div>
              <div className="p-3 sm:p-4 surface-bg border rounded-xl mb-4 sm:mb-6 text-xs sm:text-sm text-prime leading-relaxed">{selectedItem.desc}</div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-white/5 rounded-xl border border-[var(--border-line)] gap-4">
                <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition" onClick={() => { setState(prev => ({...prev, activeModal: 'modal-profile', targetUser: {name: selectedItem.host, avatar: selectedItem.host[0]}})) }}>
                  {renderAvatar(selectedItem.host[0], "w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-base")}
                  <div><p className="text-xs sm:text-sm font-bold text-prime hover:underline">{selectedItem.host}</p><p className="text-[9px] sm:text-[10px] text-[var(--primary-glow)]">Verified User</p></div>
                </div>
                <button onClick={() => { closeModal(); setState(prev => ({...prev, isChatOpen: true, chatHost: selectedItem.host})) }} className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-bold text-white hover-lift" style={{ background: 'var(--primary-glow)' }}>Message Host</button>
              </div>
            </div>
          )}

          {/* ADD NEWS */}
          {activeModal === 'modal-add-news' && (
            <> ... (Add News Code Remains Same) ... </>
          )}
        </div>
      )}
    </div>
  );
}
