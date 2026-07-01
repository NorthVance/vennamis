import React, { useContext, useEffect, useState, useRef } from 'react';
import { AppContext } from '../App';
import { staticDict } from '../store';
import Typewriter from '../components/common/Typewriter';
import Skeleton from '../components/common/Skeleton';
import { NetworkTranslator } from '../services/api';
import { DatabaseService } from '../services/db';

export default function Home() {
  const { state, setState } = useContext(AppContext);
  const t = staticDict[state.lang] || staticDict['en'];

  const rawData = state.data[state.view] || [];
  const [viewData, setViewData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [quickTitle, setQuickTitle] = useState('');
  const [quickDesc, setQuickDesc] = useState('');
  const [quickImage, setQuickImage] = useState(null);
  const fileInputRef = useRef(null);
  
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [likedPosts, setLikedPosts] = useState({});

  useEffect(() => {
    let isMounted = true;
    const loadDataAndTranslate = async () => {
      setIsLoading(true);
      const data = await DatabaseService.getFeedData(state.view);
      
      if (data.length === 0 || state.lang === 'en') {
        if (isMounted) { setViewData(data); setFilteredData(data); setIsLoading(false); }
        return;
      }
      
      const translated = await Promise.all(data.map(async (item) => ({
        ...item,
        title: await NetworkTranslator.translateText(item.title, state.lang, state.transApi),
        desc: await NetworkTranslator.translateText(item.desc, state.lang, state.transApi)
      })));
      
      if (isMounted) { setViewData(translated); setFilteredData(translated); setIsLoading(false); }
    };
    loadDataAndTranslate();
    return () => { isMounted = false; };
  }, [state.view, state.lang, state.transApi, state.refreshTick]);

  useEffect(() => {
    let result = [...viewData];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(i => (i.title?.toLowerCase().includes(q)) || (i.desc?.toLowerCase().includes(q)) || (i.host?.toLowerCase().includes(q)));
    }
    if (activeFilter !== 'all') {
      if (activeFilter === 'remote') result = result.filter(i => i.loc?.toLowerCase() === 'remote');
      else if (activeFilter === 'high_budget') result = result.filter(i => i.price >= 1000);
      else if (activeFilter === 'top_rated') result = result.filter(i => (i.likes || 0) > 100);
      else if (activeFilter === 'bullish') result = result.filter(i => i.sentiment === 'bullish');
    }
    if (sortBy === 'price_desc') result.sort((a, b) => (b.price || 0) - (a.price || 0));
    else if (sortBy === 'popular') result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    setFilteredData(result);
  }, [activeFilter, viewData, searchQuery, sortBy]);

  useEffect(() => { setActiveFilter('all'); setSearchQuery(''); setSortBy('newest'); }, [state.view]);
  useEffect(() => { if (window.lucide) setTimeout(() => window.lucide.createIcons(), 50); }, [filteredData, state.view, sortBy, quickImage]);

  const handleApply = (e, item) => {
    e.preventDefault(); e.stopPropagation();
    if (!state.user) return setState(prev => ({ ...prev, activeModal: 'modal-login' }));
    setState(prev => ({ ...prev, activeModal: 'modal-escrow', selectedItem: item }));
  };

  const openProfile = (e, hostName, avatarData) => {
    e.preventDefault(); e.stopPropagation();
    setState(prev => ({ ...prev, activeModal: 'modal-profile', targetUser: { name: hostName, avatar: avatarData || hostName[0] } }));
  };

  const handleShare = (e) => {
    e.preventDefault(); e.stopPropagation();
    navigator.clipboard.writeText(window.location.href);
    setState(prev => ({ ...prev, toast: { type: 'success', message: 'Link copied!' } }));
  };

  const handleLike = (e, id) => {
    e.preventDefault(); e.stopPropagation();
    setLikedPosts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleReport = (e, item) => {
    e.preventDefault(); e.stopPropagation();
    if (!state.user) return setState(prev => ({ ...prev, activeModal: 'modal-login' }));
    setState(prev => ({ ...prev, activeModal: 'modal-report', selectedItem: { ...item, reportType: 'post' } }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return setState(prev => ({ ...prev, toast: { type: 'error', message: 'Image > 5MB' } }));
      setQuickImage(URL.createObjectURL(file));
    }
    e.target.value = '';
  };

  const handleQuickPost = async () => {
    if (!state.user) return setState(prev => ({ ...prev, activeModal: 'modal-login' }));
    if (!quickTitle.trim() || !quickDesc.trim()) return setState(prev => ({ ...prev, toast: { type: 'error', message: 'Fields empty.' } }));
    const newPost = { id: 'p' + Date.now(), type: 'post', host: state.user.name, avatar: state.user.avatar, title: quickTitle, desc: quickDesc, image: quickImage, tag: state.view === 'traders' ? 'SIGNAL' : 'POST' };
    await DatabaseService.createPost(newPost, state.view);
    setQuickTitle(''); setQuickDesc(''); setQuickImage(null);
    setState(prev => ({ ...prev, refreshTick: prev.refreshTick + 1, toast: { type: 'success', message: 'Published!' } }));
  };

  const renderAvatar = (avatarData, sizeClasses, fallbackText = 'U') => {
    if (avatarData && (avatarData.startsWith('http') || avatarData.startsWith('blob:'))) {
      return <img src={avatarData} alt="Avatar" className={`object-cover pointer-events-none ${sizeClasses}`} onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />;
    }
    return <div className={`flex items-center justify-center text-white font-bold bg-gray-800 pointer-events-none ${sizeClasses}`}>{avatarData ? avatarData[0] : fallbackText}</div>;
  };

  return (
    <div className="flex flex-col xl:flex-row gap-4 xl:gap-6 max-w-[1600px] mx-auto pb-20 px-3 sm:px-4">
      
      {/* 📍 LEFT SIDEBAR (Desktop Only) */}
      <aside className="hidden xl:block w-56 shrink-0">
        <div className="sticky top-[88px] space-y-6">
          <div>
            <p className="text-[9px] font-bold text-sub uppercase tracking-widest pl-3 mb-2">Platform</p>
            <div className="space-y-0.5">
              {['gigs', 'community', 'traders', 'news'].map((nav) => (
                <button 
                  key={nav} onClick={() => setState(prev => ({ ...prev, view: nav }))} 
                  className={`btn-press w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold capitalize transition-all duration-200 ${state.view === nav ? 'bg-[var(--primary-glow)] text-white' : 'text-sub hover:text-prime hover:bg-white/5'}`}
                >
                  {nav === 'gigs' && <i data-lucide="briefcase" className="w-3.5 h-3.5"></i>}
                  {nav === 'community' && <i data-lucide="users" className="w-3.5 h-3.5"></i>}
                  {nav === 'traders' && <i data-lucide="trending-up" className="w-3.5 h-3.5"></i>}
                  {nav === 'news' && <i data-lucide="newspaper" className="w-3.5 h-3.5"></i>}
                  <span>{nav}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[9px] font-bold text-sub uppercase tracking-widest pl-3 mb-2">Discover</p>
            <div className="space-y-0.5">
              <button onClick={() => setActiveFilter('all')} className={`btn-press w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${activeFilter === 'all' ? 'bg-[var(--primary-glow)] text-white' : 'text-sub hover:text-prime hover:bg-white/5'}`}>
                <i data-lucide="compass" className="w-3 h-3"></i> All
              </button>
              {state.view === 'gigs' && (
                <>
                  <button onClick={() => setActiveFilter('remote')} className={`btn-press w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${activeFilter === 'remote' ? 'bg-[var(--primary-glow)] text-white' : 'text-sub hover:text-prime hover:bg-white/5'}`}>
                    <i data-lucide="globe" className="w-3 h-3"></i> Remote
                  </button>
                  <button onClick={() => setActiveFilter('high_budget')} className={`btn-press w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${activeFilter === 'high_budget' ? 'bg-[var(--primary-glow)] text-white' : 'text-sub hover:text-prime hover:bg-white/5'}`}>
                    <i data-lucide="flame" className="w-3 h-3 text-amber-500"></i> Budget
                  </button>
                </>
              )}
              {state.view === 'community' && (
                <button onClick={() => setActiveFilter('top_rated')} className={`btn-press w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${activeFilter === 'top_rated' ? 'bg-[var(--primary-glow)] text-white' : 'text-sub hover:text-prime hover:bg-white/5'}`}>
                  <i data-lucide="trending-up" className="w-3 h-3 text-[var(--primary-glow)]"></i> Top
                </button>
              )}
              {state.view === 'traders' && (
                <button onClick={() => setActiveFilter('bullish')} className={`btn-press w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${activeFilter === 'bullish' ? 'bg-[var(--primary-glow)] text-white' : 'text-sub hover:text-prime hover:bg-white/5'}`}>
                  <i data-lucide="trending-up" className="w-3 h-3 text-green-500"></i> Bull
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* 📍 MIDDLE COLUMN: Feed Core */}
      <div className="flex-1 min-w-0 space-y-4 md:space-y-6">
        
        {/* 📱 MOBILE: Tab Navigation */}
        <div className="xl:hidden space-y-2">
          <div className="glass-panel p-1 bg-black/5 border border-[var(--border-line)] rounded-xl flex gap-0.5 overflow-x-auto hide-scrollbar">
            {['gigs', 'community', 'traders', 'news'].map((nav) => (
              <button 
                key={nav} onClick={() => setState(prev => ({ ...prev, view: nav }))} 
                className={`btn-press flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 shrink-0 whitespace-nowrap ${state.view === nav ? 'bg-[var(--primary-glow)] text-white shadow-sm' : 'text-sub hover:text-prime'}`}
              >
                {nav === 'gigs' && <i data-lucide="briefcase" className="w-3 h-3"></i>}
                {nav === 'community' && <i data-lucide="users" className="w-3 h-3"></i>}
                {nav === 'traders' && <i data-lucide="trending-up" className="w-3 h-3"></i>}
                {nav === 'news' && <i data-lucide="newspaper" className="w-3 h-3"></i>}
                <span className="hidden xs:inline">{nav}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
            <button onClick={() => setActiveFilter('all')} className={`btn-press px-3 py-1.5 rounded-lg text-[9px] font-bold transition whitespace-nowrap shrink-0 ${activeFilter === 'all' ? 'bg-[var(--primary-glow)] text-white' : 'bg-white/5 text-sub'}`}>All</button>
            {state.view === 'gigs' && (
              <>
                <button onClick={() => setActiveFilter('remote')} className={`btn-press px-3 py-1.5 rounded-lg text-[9px] font-bold transition whitespace-nowrap shrink-0 ${activeFilter === 'remote' ? 'bg-[var(--primary-glow)] text-white' : 'bg-white/5 text-sub'}`}>Remote</button>
                <button onClick={() => setActiveFilter('high_budget')} className={`btn-press px-3 py-1.5 rounded-lg text-[9px] font-bold transition whitespace-nowrap shrink-0 flex items-center gap-1 ${activeFilter === 'high_budget' ? 'bg-[var(--primary-glow)] text-white' : 'bg-white/5 text-sub'}`}><i data-lucide="flame" className="w-2.5 h-2.5 text-amber-500"></i>Budget</button>
              </>
            )}
            {state.view === 'community' && <button onClick={() => setActiveFilter('top_rated')} className={`btn-press px-3 py-1.5 rounded-lg text-[9px] font-bold transition whitespace-nowrap shrink-0 ${activeFilter === 'top_rated' ? 'bg-[var(--primary-glow)] text-white' : 'bg-white/5 text-sub'}`}>Top</button>}
            {state.view === 'traders' && <button onClick={() => setActiveFilter('bullish')} className={`btn-press px-3 py-1.5 rounded-lg text-[9px] font-bold transition whitespace-nowrap shrink-0 ${activeFilter === 'bullish' ? 'bg-[var(--primary-glow)] text-white' : 'bg-white/5 text-sub'}`}>Bull</button>}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <i data-lucide="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sub group-hover:text-[var(--primary-glow)] transition"></i>
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full bg-[var(--bg-surface)] backdrop-blur-xl border border-[var(--border-line)] hover:border-[var(--primary-glow)] focus:border-[var(--primary-glow)] outline-none px-10 py-2.5 rounded-xl text-xs text-prime placeholder-sub transition" />
        </div>

        {/* HERO (Gigs Only) */}
        {state.view === 'gigs' && (
          <div className="bento-card rounded-2xl p-5 sm:p-8 text-center relative overflow-hidden group">
            <div className="absolute -top-20 -right-20 w-48 h-48 sm:w-64 sm:h-64 bg-[var(--primary-glow)] opacity-10 blur-[60px] rounded-full pointer-events-none"></div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full border surface-bg text-[8px] font-bold uppercase tracking-wider text-[var(--primary-glow)] mb-3">
              <i data-lucide="shield-check" className="w-3 h-3"></i><span>Secure</span>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tighter leading-tight text-prime mb-2">
              <span>{t.hero_static}</span><br/>
              <div className="h-[1em] mt-0.5 flex justify-center items-center"><Typewriter /></div>
            </h1>
            <p className="text-[10px] sm:text-xs text-sub max-w-sm mx-auto font-medium">{t.hero_sub}</p>
          </div>
        )}

        {/* QUICK POST */}
        {(state.view === 'community' || state.view === 'traders') && (
          <div className="bento-card rounded-2xl p-4 sm:p-5">
            <div className="flex items-start gap-3">
              {renderAvatar(state.user ? state.user.avatar : 'U', "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0 text-xs shadow-sm", state.user?.name[0])}
              <div className="flex-1 min-w-0">
                <input type="text" value={quickTitle} onChange={(e) => setQuickTitle(e.target.value)} placeholder={state.view === 'traders' ? 'Signal...' : 'Discuss...'} className="w-full bg-transparent text-sm text-prime outline-none placeholder-sub border-b border-[var(--border-line)]/50 pb-2" />
                <textarea rows="2" value={quickDesc} onChange={(e) => setQuickDesc(e.target.value)} placeholder="Thoughts?" className="w-full bg-transparent text-xs text-prime outline-none placeholder-sub mt-2 resize-none" />
                
                {quickImage && (
                  <div className="relative mt-2 mb-1.5 w-fit">
                    <img src={quickImage} alt="Preview" className="h-20 sm:h-24 rounded-lg border border-[var(--border-line)] object-cover shadow-sm" />
                    <button onClick={() => setQuickImage(null)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:scale-110 transition relative z-10"><i data-lucide="x" className="w-2.5 h-2.5 pointer-events-none"></i></button>
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-2 border-t border-[var(--border-line)] mt-2">
                  <div className="flex gap-1 text-sub">
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="btn-press p-1.5 hover:text-prime hover:bg-[var(--border-line)] rounded-lg transition" title="Image"><i data-lucide="image" className="w-3.5 h-3.5"></i></button>
                    <button onClick={() => setState(prev => ({...prev, toast: {type:'info', message:'Link disabled.'}}))} className="btn-press p-1.5 hover:text-prime hover:bg-[var(--border-line)] rounded-lg transition" title="Link"><i data-lucide="link" className="w-3.5 h-3.5"></i></button>
                  </div>
                  <button onClick={handleQuickPost} className="btn-press px-5 sm:px-6 py-2 rounded-lg text-white font-bold text-xs shadow-md relative z-10" style={{ background: 'var(--primary-glow)' }}>Post</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feed Header */}
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-bold text-sub uppercase tracking-wider">Updates</h3>
          <div className="flex items-center gap-1.5">
            <i data-lucide="arrow-down-up" className="w-3 h-3 text-sub"></i>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent text-[10px] font-bold text-prime outline-none cursor-pointer">
              <option value="newest" className="bg-[var(--bg-surface)]">Newest</option>
              {state.view === 'gigs' && <option value="price_desc" className="bg-[var(--bg-surface)]">Price</option>}
              {(state.view === 'community' || state.view === 'gigs') && <option value="popular" className="bg-[var(--bg-surface)]">Popular</option>}
            </select>
          </div>
        </div>

        {isLoading ? (
          <Skeleton view={state.view} />
        ) : filteredData.length === 0 ? (
          <div className="text-center py-16 sm:py-20 border border-dashed border-[var(--border-line)] rounded-2xl">
            <i data-lucide="filterX" className="w-6 h-6 sm:w-8 sm:h-8 text-sub mx-auto mb-2 opacity-50"></i>
            <p className="text-xs font-medium text-sub">No results</p>
            <button onClick={() => { setActiveFilter('all'); setSearchQuery(''); }} className="mt-3 px-3 py-1.5 rounded-lg surface-bg border border-[var(--border-line)] text-[10px] text-[var(--primary-glow)] hover:bg-[var(--primary-glow)] hover:text-white transition">Reset</button>
          </div>
        ) : (
          <div className={state.view === 'gigs' ? "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4" : "flex flex-col gap-4"}>
            {filteredData.map(item => {
              
              if (state.view === 'gigs') {
                return (
                  <div key={item.id} onClick={() => setState(prev => ({ ...prev, activeModal: 'modal-gig-detail', selectedItem: item }))} className="btn-press bento-card rounded-xl p-4 sm:p-5 cursor-pointer group relative">
                    <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-[var(--primary-glow)] opacity-0 group-hover:opacity-10 blur-[40px] transition-opacity duration-500 rounded-full pointer-events-none"></div>
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <span className="text-[8px] font-bold uppercase text-sub surface-bg px-2 py-1 rounded-full border border-[var(--border-line)] shadow-sm shrink-0">{item.loc}</span>
                        <button onClick={(e) => handleReport(e, item)} className="relative z-10 text-gray-400 opacity-60 hover:opacity-100 hover:text-red-500 transition p-1 bg-black/5 hover:bg-red-500/10 rounded-lg"><i data-lucide="flag" className="w-3 h-3 pointer-events-none"></i></button>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-prime mb-1.5 line-clamp-2 break-words">{item.title}</h3>
                      <p className="text-[10px] text-sub line-clamp-2 leading-relaxed font-medium break-words">{item.desc}</p>
                    </div>
                    <div className="flex justify-between items-end mt-auto pt-3 border-t border-[var(--border-line)]/50">
                      <div onClick={(e) => openProfile(e, item.host, item.avatar)} className="relative z-10 hover:opacity-80 transition cursor-pointer flex items-center gap-2 min-w-0">
                         {renderAvatar(item.avatar || item.host[0], "w-6 h-6 rounded-full text-[9px] shadow-sm flex-shrink-0", item.host[0])}
                         <div className="min-w-0">
                           <p className="text-[8px] text-sub uppercase tracking-wider font-bold">Host</p>
                           <span className="text-[10px] font-bold text-prime hover:underline truncate">{item.host}</span>
                         </div>
                      </div>
                      <button onClick={(e) => handleApply(e, item)} className="relative z-10 btn-press px-3 py-1.5 rounded-lg surface-bg border border-[var(--border-line)] flex items-center gap-1 text-[10px] font-bold text-prime hover:text-white hover:border-[var(--primary-glow)] transition shrink-0">
                        Apply <i data-lucide="arrow-up-right" className="w-2.5 h-2.5 pointer-events-none"></i>
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={item.id} onClick={() => setState(prev => ({ ...prev, activeModal: 'modal-gig-detail', selectedItem: item }))} className="btn-press bento-card rounded-xl p-4 sm:p-5 cursor-pointer group">
                  
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div onClick={(e) => openProfile(e, item.host, item.avatar)} className="relative z-10 flex items-center gap-2 hover:opacity-80 transition cursor-pointer min-w-0">
                      {renderAvatar(item.avatar || item.host[0], "w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-xs shadow-sm flex-shrink-0", item.host[0])}
                      <div className="min-w-0">
                        <span className="text-xs sm:text-sm font-bold text-prime hover:underline truncate">{item.host}</span>
                        <span className="text-[9px] text-sub uppercase tracking-wider block">{item.tag || 'Update'}</span>
                      </div>
                    </div>
                    <button onClick={(e) => handleReport(e, item)} className="relative z-10 text-gray-400 opacity-60 hover:opacity-100 hover:text-red-500 transition p-1 rounded-lg flex-shrink-0"><i data-lucide="flag" className="w-3.5 h-3.5 pointer-events-none"></i></button>
                  </div>
                  
                  <h3 className="text-sm sm:text-base font-bold text-prime mb-1.5 leading-tight break-words">{item.title}</h3>
                  <p className="text-[10px] sm:text-xs text-sub mb-3 leading-relaxed font-medium break-words">{item.desc}</p>

                  {item.image && (
                    <div className="mb-3 rounded-lg overflow-hidden border border-[var(--border-line)] max-h-48 sm:max-h-64 pointer-events-none">
                      <img src={item.image} alt="Attachment" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.style.display='none'; }} />
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center border-t border-[var(--border-line)] pt-3 gap-2">
                    {state.view === 'community' && (
                      <div className="flex gap-3 sm:gap-4 text-sub text-[10px] font-bold">
                        <button onClick={(e) => handleLike(e, item.id)} className={`relative z-10 btn-press flex items-center transition gap-1 ${likedPosts[item.id] ? 'text-red-500' : 'hover:text-prime'}`}>
                          <i data-lucide="heart" className={`w-3.5 h-3.5 pointer-events-none transition-all ${likedPosts[item.id] ? 'fill-red-500' : ''}`}></i> {likedPosts[item.id] ? item.likes + 1 : item.likes || 0}
                        </button>
                        <span className="flex items-center pointer-events-none"><i data-lucide="message-circle" className="w-3.5 h-3.5 mr-1"></i> {item.comments || 0}</span>
                      </div>
                    )}
                    {state.view === 'traders' && (
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-full surface-bg border border-[var(--border-line)] shadow-sm text-[9px] pointer-events-none ${item.sentiment === 'bullish' ? 'text-green-400 border-green-400/50' : 'text-red-400 border-red-400/50'}`}>
                        <i data-lucide={item.sentiment === 'bullish' ? 'trending-up' : 'trending-down'} className="w-3 h-3 pointer-events-none"></i> {item.sentiment?.toUpperCase()}
                      </span>
                    )}
                    {state.view === 'news' && (
                      <span className="font-mono text-[9px] bg-white/5 px-2 py-1 rounded pointer-events-none">SRC: {item.source || 'SYS'}</span>
                    )}
                    <button onClick={(e) => handleShare(e)} className="relative z-10 btn-press text-sub hover:text-[var(--primary-glow)] p-1 rounded-lg hover:bg-white/5 transition ml-auto flex-shrink-0">
                      <i data-lucide="share-2" className="w-3.5 h-3.5 pointer-events-none"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 📍 RIGHT SIDEBAR (Desktop XL Only) */}
      <aside className="hidden 2xl:block w-64 shrink-0">
        <div className="sticky top-[88px] space-y-4">
          
          <div className="glass-panel border rounded-2xl p-4 hover-lift">
            <h3 className="text-xs font-bold text-prime mb-3 flex items-center border-b border-[var(--border-line)] pb-2">
              <i data-lucide="trending-up" className="w-3.5 h-3.5 mr-2 text-[var(--primary-glow)]"></i> Trending
            </h3>
            <div className="space-y-3">
              <div className="cursor-pointer group">
                <p className="text-[10px] font-bold text-prime group-hover:text-[var(--primary-glow)] transition">#NFP Week</p>
                <p className="text-[9px] text-sub mt-0.5">1,245 posts</p>
              </div>
              <div className="cursor-pointer group">
                <p className="text-[10px] font-bold text-prime group-hover:text-[var(--primary-glow)] transition">Bitcoin Halving</p>
                <p className="text-[9px] text-sub mt-0.5">858 posts</p>
              </div>
              <div className="cursor-pointer group">
                <p className="text-[10px] font-bold text-prime group-hover:text-[var(--primary-glow)] transition">Risk Tips</p>
                <p className="text-[9px] text-sub mt-0.5">432 posts</p>
              </div>
            </div>
          </div>

          <div className="glass-panel border rounded-2xl p-4 hover-lift">
            <h3 className="text-xs font-bold text-prime mb-3 flex items-center border-b border-[var(--border-line)] pb-2">
              <i data-lucide="users" className="w-3.5 h-3.5 mr-2 text-sub"></i> Top Profiles
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">E</div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-prime hover:underline cursor-pointer truncate">Elena R.</p>
                    <p className="text-[8px] text-sub truncate">FX Mentor</p>
                  </div>
                </div>
                <button className="text-[9px] font-bold text-[var(--primary-glow)] bg-[var(--primary-glow)]/10 px-2 py-0.5 rounded-full hover:bg-[var(--primary-glow)] hover:text-white transition shrink-0">+</button>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">D</div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-prime hover:underline cursor-pointer truncate">David K.</p>
                    <p className="text-[8px] text-sub truncate">Algo Trader</p>
                  </div>
                </div>
                <button className="text-[9px] font-bold text-[var(--primary-glow)] bg-[var(--primary-glow)]/10 px-2 py-0.5 rounded-full hover:bg-[var(--primary-glow)] hover:text-white transition shrink-0">+</button>
              </div>
            </div>
          </div>

          <div className="text-[8px] text-sub px-1 flex flex-wrap gap-x-2 gap-y-0.5">
            <a href="#" className="hover:underline hover:text-prime">Terms</a>
            <a href="#" className="hover:underline hover:text-prime">Privacy</a>
            <a href="#" className="hover:underline hover:text-prime">Security</a>
            <span>© 2026</span>
          </div>

        </div>
      </aside>

    </div>
  );
}
