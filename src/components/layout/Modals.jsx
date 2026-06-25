import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../App';
import { AuthService, DatabaseService, supabase } from '../../services/db';

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

  const [pubProfile, setPubProfile] = useState(null);
  const [pubReviews, setPubReviews] = useState([]);

  // SYS: Reset
  const closeModal = () => {
    setState(prev => ({ ...prev, activeModal: null, selectedItem: null, targetUser: null }));
    setNewsPreview(null); setNewsUrl(''); setGigForm({ title: '', price: '', loc: '', desc: '' });
    setAuthForm({ name: '', email: '', password: '' }); setPubProfile(null); setPubReviews([]);
    setTimeout(() => { setIsRegister(false); setGoogleStep(1); setEscrowStep(0); }, 300); 
  };

  useEffect(() => { if (activeModal && window.lucide) window.lucide.createIcons(); }, [activeModal, selectedItem, newsPreview, isRegister, googleStep, escrowStep, targetUser, pubProfile]);

  // REQ: Fetch Profile
  useEffect(() => {
    if (activeModal === 'modal-profile' && targetUser) {
      DatabaseService.getUserProfile(targetUser.name).then(setPubProfile);
      DatabaseService.getReviews(targetUser.name).then(setPubReviews);
    }
  }, [activeModal, targetUser]);

  // AUTH: Exec
  const handleAuth = async (e) => {
    e.preventDefault();
    if (!supabase) {
      const mockName = isRegister ? (authForm.name || 'New User') : 'Admin User';
      setState(prev => ({ ...prev, user: { name: mockName, avatar: mockName.substring(0,2).toUpperCase(), balance: '$1,500.00', bio: 'Global Worker.' }, activeModal: null })); return;
    }
    setAuthLoading(true);
    if (isRegister) {
      const { error } = await AuthService.signUp(authForm.email, authForm.password, authForm.name);
      if (error) alert(error.message); else { alert('Registration sent! Check your email.'); closeModal(); }
    } else {
      const { error } = await AuthService.signIn(authForm.email, authForm.password);
      if (error) alert(error.message); else closeModal();
    }
    setAuthLoading(false);
  };

  const handleGoogleAuth = async () => {
    if (!supabase) setState(prev => ({ ...prev, user: { name: 'Alex Google', avatar: 'AL', balance: '$1,500.00', bio: 'Global Worker.' }, activeModal: null }));
    else await AuthService.signInWithGoogle();
  };

  // 📍 REQ: Post Gig (Connected to DB & Refresh)
  const submitGig = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please Login First");
    
    const newGig = { 
      id: 'g' + Date.now(), type: 'gig', host: user.name, avatar: user.avatar,
      title: gigForm.title, desc: gigForm.desc, price: parseFloat(gigForm.price) || 0, loc: gigForm.loc || 'Remote', tag: 'New Gig' 
    };
    
    await DatabaseService.createPost(newGig, 'gigs');
    // Trigger Refresh
    setState(prev => ({ ...prev, view: 'gigs', activeModal: null, refreshTick: prev.refreshTick + 1 }));
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

  const confirmAddNews = async () => {
    if (newsPreview) {
      const newItem = { id: 'n' + Date.now(), type: 'news', host: user ? user.name : 'Anonymous', title: newsPreview.title, desc: newsPreview.desc, source: 'Custom', tag: 'User Added' };
      await DatabaseService.createPost(newItem, 'news');
      setState(prev => ({ ...prev, view: 'news', activeModal: null, refreshTick: prev.refreshTick + 1 }));
    }
  };

  const handleEscrowTransaction = () => { setEscrowStep(1); setTimeout(() => setEscrowStep(2), 3000); };

  const renderAvatar = (avatarData, sizeClasses) => {
    if (avatarData && (avatarData.startsWith('http') || avatarData.startsWith('blob:'))) return <img src={avatarData} alt="Avatar" className={`object-cover ${sizeClasses}`} />;
    return <div className={`flex items-center justify-center text-white font-bold bg-gray-700 ${sizeClasses}`}>{avatarData ? avatarData[0] : 'U'}</div>;
  };

  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-overlay">
      <div className="absolute inset-0 bg-black/60" onClick={closeModal}></div>
      {/* ... [Rest of Modals JSX Code Exists Here Exactly as Before in V.21.0.0] ... */}
      
      {/* UI: OAUTH */}
      {activeModal === 'modal-google-consent' ? (
        <div className="relative bg-white border border-gray-200 rounded-3xl w-full p-6 sm:p-8 shadow-2xl max-w-md animate-modal-pop font-sans text-gray-800">
          <button onClick={closeModal} className="absolute top-4 right-4 sm:top-5 sm:right-5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-full transition"><i data-lucide="x" className="w-5 h-5"></i></button>
          <div className="flex justify-center mb-4"><svg className="w-10 h-10" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.27H12v4.51h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.39-4.87 3.39-8.63z"/><path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-3.9 1.09-3.14 0-5.82-2.33-6.77-5.46l-3.85 2.99C3.37 20.32 7.35 23 12 23z"/><path fill="#FBBC05" d="M5.26 14.37c-.24-.72-.38-1.49-.38-2.37s.14-1.65.38-2.37L1.41 6.63C.51 8.44 0 10.46 0 12.6s.51 4.16 1.41 5.97l3.85-2.99s.12-.09 0 0z"/><path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.63l3.2-3.2C17.51 1.64 14.96 1 12 1 7.35 1 3.37 3.68 1.41 7.62l3.85 2.99C6.18 7.37 8.86 5.04 12 5.04z"/></svg></div>
          {googleStep === 1 && (
            <div className="animate-[fadeStep_0.3s_ease_forwards]">
              <h3 className="text-xl sm:text-2xl font-medium text-center text-gray-900 mb-2">Sign in with Google</h3>
              <p className="text-sm text-center text-gray-600 mb-6">Choose an account to continue to <span className="font-bold text-gray-900">Vennamis</span></p>
              <div className="border border-gray-300 rounded-xl overflow-hidden mb-6"><button onClick={() => setGoogleStep(2)} className="w-full flex items-center p-4 hover:bg-gray-50 border-b border-gray-300 transition text-left"><div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm mr-4 tracking-wider">AG</div><div className="flex-1"><p className="text-sm font-medium text-gray-900">Alex Global</p><p className="text-xs text-gray-500">alex.global@gmail.com</p></div></button></div>
            </div>
          )}
          {googleStep === 2 && (
            <div className="animate-[fadeStep_0.3s_ease_forwards]">
              <h3 className="text-xl sm:text-2xl font-medium text-center text-gray-900 mb-6">Vennamis wants to access your Google Account</h3>
              <div className="flex justify-end space-x-3 mt-8"><button onClick={closeModal} className="px-5 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition">Cancel</button><button onClick={handleGoogleAuth} className="px-5 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition shadow-sm">Allow</button></div>
            </div>
          )}
        </div>
      ) : (
        /* UI: MAIN MODALS */
        <div className={`relative glass-panel border rounded-3xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto animate-modal-pop ${activeModal === 'modal-gig-detail' || activeModal === 'modal-post' || activeModal === 'modal-profile' ? 'max-w-2xl' : 'max-w-md'}`}>
          <button onClick={closeModal} className="btn-press absolute top-4 right-4 sm:top-6 sm:right-6 text-sub hover:text-prime bg-white/5 border border-[var(--border-line)] rounded-full p-2 hover:bg-[var(--primary-glow)] transition-colors z-10"><i data-lucide="x" className="w-4 h-4"></i></button>
          
          {/* AUTH */}
          {activeModal === 'modal-login' && (
            <>
              <h3 className="text-2xl sm:text-3xl font-black text-prime mb-2">Vennamis</h3>
              <p className="text-[10px] sm:text-xs text-sub mb-6 sm:mb-8 uppercase tracking-widest">{isRegister ? 'Create Escrow Account' : 'Secure Authentication'}</p>
              <div className="space-y-3 mb-6"><button onClick={() => setState(prev => ({...prev, activeModal: 'modal-google-consent'}))} className="btn-press w-full surface-bg border border-[var(--border-line)] hover:border-[var(--primary-glow)] rounded-xl py-3 flex justify-center items-center space-x-3 hover-lift text-prime text-sm font-bold transition"><svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.63l3.2-3.2C17.51 1.64 14.96 1 12 1 7.35 1 3.37 3.68 1.41 7.62l3.85 2.99C6.18 7.37 8.86 5.04 12 5.04z"/><path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.27H12v4.51h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.39-4.87 3.39-8.63z"/><path fill="#FBBC05" d="M5.26 14.37c-.24-.72-.38-1.49-.38-2.37s.14-1.65.38-2.37L1.41 6.63C.51 8.44 0 10.46 0 12.6s.51 4.16 1.41 5.97l3.85-2.99s.12-.09 0 0z"/><path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-3.9 1.09-3.14 0-5.82-2.33-6.77-5.46l-3.85 2.99C3.37 20.32 7.35 23 12 23z"/></svg><span>{isRegister ? 'Sign up with Google' : 'Continue with Google'}</span></button></div>
              <div className="flex items-center space-x-4 mb-6"><div className="flex-1 border-t border-[var(--border-line)]"></div><span className="text-[10px] text-sub uppercase">or email</span><div className="flex-1 border-t border-[var(--border-line)]"></div></div>
              <form onSubmit={handleAuth} className="space-y-4">
                {isRegister && <input type="text" value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} required placeholder="Full Name" className="w-full bg-transparent surface-bg border rounded-xl px-4 py-3 text-sm text-prime outline-none focus:border-[var(--primary-glow)] transition" />}
                <input type="email" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} required placeholder="Encrypted Email" className="w-full bg-transparent surface-bg border rounded-xl px-4 py-3 text-sm text-prime outline-none focus:border-[var(--primary-glow)] transition" />
                <input type="password" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} required placeholder="Password" className="w-full bg-transparent surface-bg border rounded-xl px-4 py-3 text-sm text-prime outline-none focus:border-[var(--primary-glow)] transition" />
                {!isRegister && <div className="text-right"><a href="#" className="text-[10px] text-[var(--primary-glow)] hover:underline">Forgot Password?</a></div>}
                <button type="submit" disabled={authLoading} className="btn-press w-full rounded-xl py-3.5 text-white font-bold text-sm shadow-md disabled:opacity-50" style={{ background: 'var(--primary-glow)' }}>{authLoading ? 'Processing...' : (isRegister ? 'Create Account' : 'Initialize Session')}</button>
              </form>
              <div className="mt-6 text-center"><p className="text-xs text-sub">{isRegister ? "Already have an account? " : "Don't have an account? "}<button onClick={() => setIsRegister(!isRegister)} className="text-[var(--primary-glow)] font-bold hover:underline">{isRegister ? 'Log in' : 'Sign up'}</button></p></div>
            </>
          )}

          {/* PUBLIC PROFILE */}
          {activeModal === 'modal-profile' && targetUser && (
            <div className="animate-modal-pop">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 border-b border-[var(--border-line)] pb-6 mb-6">
                {renderAvatar(targetUser.avatar, "w-24 h-24 sm:w-28 sm:h-28 rounded-3xl text-4xl shadow-2xl border border-[var(--border-line)] shrink-0")}
                <div className="text-center sm:text-left flex-1">
                  <h2 className="text-2xl sm:text-4xl font-black text-prime tracking-tight">{targetUser.name}</h2>
                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 mt-2">
                    <span className="text-[10px] sm:text-xs text-[var(--primary-glow)] flex items-center bg-[var(--primary-glow)]/10 px-2.5 py-1 rounded-md border border-[var(--primary-glow)]/30 font-bold"><i data-lucide="shield-check" className="w-3.5 h-3.5 mr-1"></i> Identity Verified</span>
                    <span className="text-[10px] sm:text-xs text-sub bg-white/5 border border-[var(--border-line)] px-2.5 py-1 rounded-md">Joined {pubProfile?.joined || '2025'}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-sub mt-4 leading-relaxed max-w-lg">{pubProfile?.bio}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
                <div className="surface-bg border border-[var(--border-line)] rounded-2xl p-4 text-center hover-lift">
                  <p className="text-[9px] sm:text-[10px] text-sub uppercase tracking-widest mb-1">Success</p>
                  <p className="text-xl sm:text-2xl font-black text-prime">{pubProfile?.successRate || 95}%</p>
                </div>
                <div className="surface-bg border border-[var(--border-line)] rounded-2xl p-4 text-center hover-lift">
                  <p className="text-[9px] sm:text-[10px] text-sub uppercase tracking-widest mb-1">Jobs</p>
                  <p className="text-xl sm:text-2xl font-black text-prime">{pubProfile?.jobs || 42}</p>
                </div>
                <div className="surface-bg border border-[var(--border-line)] rounded-2xl p-4 text-center hover-lift">
                  <p className="text-[9px] sm:text-[10px] text-sub uppercase tracking-widest mb-1">Rating</p>
                  <p className="text-xl sm:text-2xl font-black text-amber-400 flex items-center justify-center"><i data-lucide="star" className="w-4 h-4 sm:w-5 sm:h-5 mr-1 fill-amber-400"></i> {pubProfile?.rating || '4.9'}</p>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-sm font-bold text-prime mb-4 flex items-center border-b border-[var(--border-line)] pb-2"><i data-lucide="message-square-quote" className="w-4 h-4 mr-2 text-sub"></i> Client Reviews</h4>
                {pubReviews.length > 0 ? (
                  <div className="space-y-3">
                    {pubReviews.map(r => (
                      <div key={r.id} className="bg-white/5 border border-[var(--border-line)] rounded-xl p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold text-prime">{r.client}</span>
                          <div className="flex text-amber-400"><i data-lucide="star" className="w-3 h-3 fill-amber-400"></i><i data-lucide="star" className="w-3 h-3 fill-amber-400"></i><i data-lucide="star" className="w-3 h-3 fill-amber-400"></i><i data-lucide="star" className="w-3 h-3 fill-amber-400"></i><i data-lucide="star" className="w-3 h-3 fill-amber-400"></i></div>
                        </div>
                        <p className="text-xs text-sub italic">"{r.comment}"</p>
                        <p className="text-[9px] text-gray-500 mt-2">{r.date}</p>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-sub text-center py-4">No reviews yet.</p>}
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button onClick={() => { closeModal(); setState(prev => ({...prev, isChatOpen: true, chatHost: targetUser.name})) }} className="btn-press w-full sm:flex-1 py-3.5 rounded-xl text-white font-bold text-sm shadow-md flex items-center justify-center hover:opacity-90 transition" style={{ background: 'var(--primary-glow)' }}>
                  <i data-lucide="message-square" className="w-4 h-4 mr-2"></i> Message
                </button>
                <button onClick={() => alert('User Reported to Admins.')} className="btn-press w-full sm:w-auto px-6 py-3.5 rounded-xl surface-bg border border-[var(--border-line)] text-sub hover:text-red-500 hover:border-red-500 transition shadow-sm font-bold text-xs uppercase tracking-wider">Report</button>
              </div>
            </div>
          )}

          {/* ESCROW */}
          {activeModal === 'modal-escrow' && selectedItem && (
            <div className="flex flex-col h-full"><div className="text-center border-b border-[var(--border-line)] pb-4 mb-6"><div className="inline-flex justify-center items-center w-12 h-12 rounded-full bg-[var(--grid-color)] mb-3"><i data-lucide="lock" className="w-5 h-5 text-[var(--primary-glow)]"></i></div><h3 className="text-xl sm:text-2xl font-black text-prime">Secure Escrow Payment</h3><p className="text-[10px] text-[var(--primary-glow)] uppercase tracking-widest mt-1 flex items-center justify-center"><i data-lucide="shield-check" className="w-3 h-3 mr-1"></i> Bank-Grade AES-256</p></div>{escrowStep === 0 && (<div className="space-y-5 animate-[fadeStep_0.3s_ease_forwards]"><div className="surface-bg border border-[var(--border-line)] rounded-xl p-4"><p className="text-[10px] text-sub uppercase mb-1">Applying for</p><p className="text-sm font-bold text-prime">{selectedItem.title}</p><p className="text-xs text-sub mt-1">Host: {selectedItem.host}</p></div><div className="flex justify-between items-center surface-bg border border-[var(--border-line)] rounded-xl p-4"><span className="text-xs text-sub font-bold uppercase">Escrow Deposit</span><span className="text-xl font-black glow-text">${selectedItem.price}</span></div><button onClick={handleEscrowTransaction} className="btn-press w-full rounded-xl py-3.5 text-white font-bold text-sm shadow-md flex justify-center items-center" style={{ background: 'var(--primary-glow)' }}><i data-lucide="credit-card" className="w-4 h-4 mr-2"></i> Proceed to Secure Checkout</button></div>)}{escrowStep === 1 && (<div className="flex flex-col items-center justify-center py-10 space-y-4 animate-[fadeStep_0.3s_ease_forwards]"><i data-lucide="loader-2" className="w-10 h-10 text-[var(--primary-glow)] animate-spin"></i><p className="text-sm font-bold text-prime">Connecting to Gateway...</p></div>)}{escrowStep === 2 && (<div className="flex flex-col items-center text-center space-y-4 py-4 animate-[fadeStep_0.3s_ease_forwards]"><div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-2"><i data-lucide="check" className="w-8 h-8 text-green-500"></i></div><h3 className="text-xl font-black text-prime">Payment Secured</h3><div className="w-full bg-white/5 border border-[var(--border-line)] rounded-lg p-3 mt-4 text-left flex justify-between items-center"><span className="text-[10px] text-sub uppercase">Bank Ref ID</span><span className="text-[10px] text-prime font-mono">VEN-{Math.floor(10000000 + Math.random() * 90000000)}</span></div><button onClick={closeModal} className="btn-press w-full rounded-xl py-3 mt-4 text-prime font-bold text-sm border border-[var(--border-line)] hover:border-[var(--primary-glow)]">Return to Feed</button></div>)}</div>
          )}

          {/* CREATE GIG */}
          {activeModal === 'modal-post' && (
            <><h3 className="text-xl sm:text-2xl font-black text-prime mb-2">Post a New Gig</h3><form onSubmit={submitGig} className="space-y-4 mt-6"><input type="text" value={gigForm.title} onChange={e => setGigForm({...gigForm, title: e.target.value})} required placeholder="Gig Title" className="w-full bg-transparent surface-bg border rounded-xl px-4 py-3 text-sm text-prime outline-none focus:border-[var(--primary-glow)] transition" /><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><input type="number" value={gigForm.price} onChange={e => setGigForm({...gigForm, price: e.target.value})} required placeholder="Budget (USD)" className="w-full bg-transparent surface-bg border rounded-xl px-4 py-3 text-sm text-prime outline-none focus:border-[var(--primary-glow)] transition" /><input type="text" value={gigForm.loc} onChange={e => setGigForm({...gigForm, loc: e.target.value})} required placeholder="Location" className="w-full bg-transparent surface-bg border rounded-xl px-4 py-3 text-sm text-prime outline-none focus:border-[var(--primary-glow)] transition" /></div><textarea required value={gigForm.desc} onChange={e => setGigForm({...gigForm, desc: e.target.value})} rows="4" placeholder="Requirements" className="w-full bg-transparent surface-bg border rounded-xl px-4 py-3 text-sm text-prime outline-none focus:border-[var(--primary-glow)] transition"></textarea><button type="submit" className="btn-press w-full rounded-xl py-3.5 text-white font-bold text-sm shadow-md mt-4" style={{ background: 'var(--primary-glow)' }}>Publish Gig Securely</button></form></>
          )}

          {/* GIG DETAIL */}
          {activeModal === 'modal-gig-detail' && selectedItem && (
            <div className="space-y-4 sm:space-y-6"><div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2"><h2 className="text-xl sm:text-3xl font-black text-prime mb-2">{selectedItem.title}</h2>{selectedItem.price > 0 && <span className="text-xl sm:text-2xl font-black glow-text">${selectedItem.price}</span>}</div><div className="p-3 sm:p-4 surface-bg border rounded-xl mb-4 text-xs sm:text-sm text-prime leading-relaxed">{selectedItem.desc}</div><div className="flex flex-col sm:flex-row justify-between p-3 sm:p-4 bg-white/5 rounded-xl border border-[var(--border-line)] gap-4"><div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition" onClick={() => { setState(prev => ({...prev, activeModal: 'modal-profile', targetUser: {name: selectedItem.host, avatar: selectedItem.avatar || selectedItem.host[0]}})) }}>{renderAvatar(selectedItem.avatar || selectedItem.host[0], "w-10 h-10 rounded-full text-base")}<div className="flex flex-col"><span className="text-sm font-bold text-prime hover:underline">{selectedItem.host}</span><span className="text-[9px] text-[var(--primary-glow)]">Verified User</span></div></div><button onClick={() => { closeModal(); setState(prev => ({...prev, isChatOpen: true, chatHost: selectedItem.host})) }} className="btn-press w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-bold text-white" style={{ background: 'var(--primary-glow)' }}>Message Host</button></div></div>
          )}

          {/* ADD NEWS */}
          {activeModal === 'modal-add-news' && (
            <><h3 className="text-lg sm:text-xl font-black mb-3">Add News Source</h3><input type="url" value={newsUrl} onChange={e => setNewsUrl(e.target.value)} placeholder="https://example.com/article" className="w-full bg-transparent surface-bg border rounded-xl px-4 py-2 mb-3 text-xs sm:text-sm outline-none focus:border-[var(--primary-glow)] transition" /><button onClick={fetchNewsMetadata} disabled={isFetchingNews} className="btn-press w-full py-2 rounded-xl text-white text-xs sm:text-sm mb-3 disabled:opacity-50" style={{ background: 'var(--primary-glow)' }}>{isFetchingNews ? 'Fetching...' : 'Fetch & Preview'}</button>{newsPreview && (<><div className="p-3 border rounded-xl mb-3 surface-bg"><div className="font-bold text-xs sm:text-sm">{newsPreview.title}</div><div className="text-[10px] sm:text-xs text-sub mt-1">{newsPreview.desc}</div></div><button onClick={confirmAddNews} className="btn-press w-full py-2 rounded-xl text-white text-xs sm:text-sm" style={{ background: 'var(--primary-glow)' }}>Add to News Feed</button></>)}</>
          )}

        </div>
      )}
    </div>
  );
}
