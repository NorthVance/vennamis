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

  // INIT
  useEffect(() => {
    let isMounted = true;
    const loadDataAndTranslate = async () => {
      setIsLoading(true);
      const data = await DatabaseService.getFeedData(state.view);
      if (data.length === 0 || state.lang === 'en') { if (isMounted) { setViewData(data); setFilteredData(data); setIsLoading(false); } return; }
      const translated = await Promise.all(data.map(async (item) => ({ ...item, title: await NetworkTranslator.translateText(item.title, state.lang, state.transApi), desc: await NetworkTranslator.translateText(item.desc, state.lang, state.transApi) })));
      if (isMounted) { setViewData(translated); setFilteredData(translated); setIsLoading(false); }
    };
    loadDataAndTranslate();
    return () => { isMounted = false; };
  }, [state.view, state.lang, state.transApi, state.refreshTick]);

  // EXEC
  useEffect(() => {
    let result = [...viewData];
    if (searchQuery.trim()) { const q = searchQuery.toLowerCase(); result = result.filter(i => (i.title?.toLowerCase().includes(q)) || (i.desc?.toLowerCase().includes(q)) || (i.host?.toLowerCase().includes(q))); }
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

  const handleApply = (e, item) => { e.preventDefault(); e.stopPropagation(); if (!state.user) return setState(prev => ({ ...prev, activeModal: 'modal-login' })); setState(prev => ({ ...prev, activeModal: 'modal-escrow', selectedItem: item })); };
  const openProfile = (e, hostName, avatarData) => { e.preventDefault(); e.stopPropagation(); setState(prev => ({ ...prev, activeModal: 'modal-profile', targetUser: { name: hostName, avatar: avatarData || hostName[0] } })); };
  const handleShare = (e) => { e.preventDefault(); e.stopPropagation(); navigator.clipboard.writeText(window.location.href); setState(prev => ({ ...prev, toast: { type: 'success', message: 'Link copied!' } })); };
  const handleLike = (e, id) => { e.preventDefault(); e.stopPropagation(); setLikedPosts(prev => ({ ...prev, [id]: !prev[id] })); };
  const handleReport = (e, item) => { e.preventDefault(); e.stopPropagation(); if (!state.user) return setState(prev => ({ ...prev, activeModal: 'modal-login' })); setState(prev => ({ ...prev, activeModal: 'modal-report', selectedItem: { ...item, reportType: 'post' } })); };

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
    const newPost = { id: 'p' + Date.now(), type: 'post', host: state.user.name, avatar: state.user.avatar, title: quickTitle, desc: quickDesc, image: quickImage, tag: state.view === 'traders' ? 'Signal' : 'Discussion', likes: 0, comments: 0 };
    await DatabaseService.createPost(newPost, state.view);
    setQuickTitle(''); setQuickDesc(''); setQuickImage(null);
    setState(prev => ({ ...prev, refreshTick: prev.refreshTick + 1, toast: { type: 'success', message: 'Published!' } }));
  };

  const renderAvatar = (avatarData, sizeClasses, fallbackText = 'U') => {
    if (avatarData && (avatarData.startsWith('http') || avatarData.startsWith('blob:'))) return <img src={avatarData} alt="Avatar" className={`object-cover pointer-events-none ${sizeClasses}`} onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />;
    return <div className={`flex items-center justify-center text-white font-bold bg-gray-800 pointer-events-none ${sizeClasses}`}>{avatarData ? avatarData[0] : fallbackText}</div>;
  };

  // RENDER
  return (
    // 📍 FIX: ถ่างความกว้าง PC ให้สุด max-w-[1600px] และเพิ่ม gap ให้มีพื้นที่หายใจ
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-10 xl:gap-12 max-w-[1600px] mx-auto pb-20 px-2 sm:px-6">
      
      {/* 📍 LEFT COLUMN: Nav Sidebar (Desktop Only) */}
      <aside className="hidden lg:block w-56 xl:w-64 shrink-0">
        <div className="sticky top-[88px] space-y-8">
          <div>
            <p className="text-[10px] font-bold text-sub uppercase tracking-widest pl-3 mb-3">Platform</p>
            <div className="space-y-1">
              {['gigs', 'community', 'traders', 'news'].map((nav) => (
                <button 
                  key={nav} onClick={() => setState(prev => ({ ...prev, view: nav }))} 
                  className={`btn-press w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold capitalize transition-all duration-200 ${state.view === nav ? 'bg-[var(--primary-glow)]/10 text-[var(--primary-glow)] border border-[var(--primary-glow)]/20 shadow-sm' : 'text-sub hover:text-prime hover:bg-white/5 border border-transparent'}`}
                >
                  {nav === 'gigs' && <i data-lucide="briefcase" className="w-4 h-4"></i>}
                  {nav === 'community' && <i data-lucide="users" className="w-4 h-4"></i>}
                  {nav === 'traders' && <i data-lucide="trending-up" className="w-4 h-4"></i>}
                  {nav === 'news' && <i data-lucide="newspaper" className="w-4 h-4"></i>}
                  <span>{nav === 'news' ? 'News' : nav}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-sub uppercase tracking-widest pl-3 mb-3">Discover</p>
            <div className="space-y-1">
              <button onClick={() => setActiveFilter('all')} className={`btn-press w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeFilter === 'all' ? 'text-prime bg-white/5' : 'text-sub hover:text-prime hover:bg-white/5'}`}>
                <i data-lucide="compass" className="w-3.5 h-3.5"></i> All Feed
              </button>
              {state.view === 'gigs' && (
                <>
                  <button onClick={() => setActiveFilter('remote')} className={`btn-press w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeFilter === 'remote' ? 'text-prime bg-white/5' : 'text-sub hover:text-prime hover:bg-white/5'}`}>
                    <i data-lucide="globe" className="w-3.5 h-3.5"></i> Remote Only
                  </button>
                  <button onClick={() => setActiveFilter('high_budget')} className={`btn-press w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeFilter === 'high_budget' ? 'text-prime bg-white/5' : 'text-sub hover:text-prime hover:bg-white/5'}`}>
                    <i data-lucide="flame" className="w-3.5 h-3.5 text-amber-500"></i> High Budget
                  </button>
                </>
              )}
              {state.view === 'community' && (
                <button onClick={() => setActiveFilter('top_rated')} className={`btn-press w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeFilter === 'top_rated' ? 'text-prime bg-white/5' : 'text-sub hover:text-prime hover:bg-white/5'}`}>
                  <i data-lucide="trending-up" className="w-3.5 h-3.5 text-[var(--primary-glow)]"></i> Top Rated
                </button>
              )}
              {state.view === 'traders' && (
                <button onClick={() => setActiveFilter('bullish')} className={`btn-press w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeFilter === 'bullish' ? 'text-prime bg-white/5' : 'text-sub hover:text-prime hover:bg-white/5'}`}>
                  <i data-lucide="trending-up" className="w-3.5 h-3.5 text-green-500"></i> Bullish Intel
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* 📍 MIDDLE COLUMN: Feed Core (ขยายตรงกลางให้กว้างขึ้น) */}
      <div className="flex-1 min-w-0 max-w-4xl mx-auto w-full space-y-4 md:space-y-8">
        
        {/* MOBILE ONLY: Nav & Filters */}
        <div className="lg:hidden space-y-3 pt-2">
          <div className="glass-panel p-1.5 bg-black/5 border border-[var(--border-line)] rounded-xl flex gap-1 overflow-x-auto hide-scrollbar shadow-inner">
            {['gigs', 'community', 'traders', 'news'].map((nav) => (
              <button 
                key={nav} onClick={() => setState(prev => ({ ...prev, view: nav }))} 
                className={`btn-press flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 shrink-0 ${state.view === nav ? 'surface-bg text-prime shadow-sm border border-[var(--border-line)]' : 'text-sub hover:text-prime'}`}
              >
                {nav === 'gigs' && <i data-lucide="briefcase" className="w-3.5 h-3.5"></i>}
                {nav === 'community' && <i data-lucide="users" className="w-3.5 h-3.5"></i>}
                {nav === 'traders' && <i data-lucide="trending-up" className="w-3.5 h-3.5"></i>}
                {nav === 'news' && <i data-lucide="newspaper" className="w-3.5 h-3.5"></i>}
                <span>{nav}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto hide-scrollbar pb-1">
            <button onClick={() => setActiveFilter('all')} className={`btn-press px-3 py-1.5 rounded-lg text-[10px] font-bold transition whitespace-nowrap ${activeFilter === 'all' ? 'bg-[var(--primary-glow)] text-white shadow-md' : 'surface-bg border border-[var(--border-line)] text-sub hover:text-prime'}`}>All</button>
            {state.view === 'gigs' && (
              <>
                <button onClick={() => setActiveFilter('remote')} className={`btn-press px-3 py-1.5 rounded-lg text-[10px] font-bold transition whitespace-nowrap ${activeFilter === 'remote' ? 'bg-[var(--primary-glow)] text-white shadow-md' : 'surface-bg border border-[var(--border-line)] text-sub hover:text-prime'}`}>Remote</button>
                <button onClick={() => setActiveFilter('high_budget')} className={`btn-press px-3 py-1.5 rounded-lg text-[10px] font-bold transition whitespace-nowrap flex items-center ${activeFilter === 'high_budget' ? 'bg-[var(--primary-glow)] text-white shadow-md' : 'surface-bg border border-[var(--border-line)] text-sub hover:text-prime'}`}><i data-lucide="flame" className="w-3 h-3 mr-1 pointer-events-none"></i> High Budget</button>
              </>
            )}
            {state.view === 'community' && <button onClick={() => setActiveFilter('top_rated')} className={`btn-press px-3 py-1.5 rounded-lg text-[10px] font-bold transition whitespace-nowrap flex items-center ${activeFilter === 'top_rated' ? 'bg-[var(--primary-glow)] text-white shadow-md' : 'surface-bg border border-[var(--border-line)] text-sub hover:text-prime'}`}><i data-lucide="trending-up" className="w-3 h-3 mr-1 pointer-events-none"></i> Top Rated</button>}
            {state.view === 'traders' && <button onClick={() => setActiveFilter('bullish')} className={`btn-press px-3 py-1.5 rounded-lg text-[10px] font-bold transition whitespace-nowrap flex items-center ${activeFilter === 'bullish' ? 'bg-green-500 text-white shadow-md' : 'surface-bg border border-[var(--border-line)] text-sub hover:text-prime'}`}><i data-lucide="trending-up" className="w-3 h-3 mr-1 pointer-events-none"></i> Bullish</button>}
            
            {/* 📍 FIX: กู้ปุ่ม Add News บนมือถือกลับมาวางต่อท้าย Filter */}
            {state.view === 'news' && (
              <button onClick={() => setState(prev => ({ ...prev, activeModal: 'modal-add-news' }))} className="btn-press px-3 py-1.5 rounded-lg text-white text-[10px] font-bold shadow-md flex items-center gap-1 hover-lift whitespace-nowrap shrink-0" style={{ background: 'var(--primary-glow)' }}>
                <i data-lucide="plus" className="w-3 h-3 pointer-events-none"></i> Add News
              </button>
            )}
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative group">
          <i data-lucide="search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sub group-hover:text-[var(--primary-glow)] transition"></i>
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[var(--bg-surface)] backdrop-blur-xl border border-[var(--border-line)] hover:border-[var(--primary-glow)]/50 rounded-xl sm:rounded-2xl pl-10 sm:pl-11 pr-4 py-2.5 sm:py-4 text-xs sm:text-sm text-prime outline-none focus:border-[var(--primary-glow)] transition-all shadow-sm font-medium" placeholder="Search skills, posts, or news..." />
        </div>

        {/* HERO (Gigs Only) */}
        {state.view === 'gigs' && (
          <div className="bento-card rounded-2xl sm:rounded-[2rem] p-5 sm:p-10 text-center relative overflow-hidden group">
            <div className="absolute -top-20 -right-20 w-40 sm:w-64 h-40 sm:h-64 bg-[var(--primary-glow)] opacity-10 blur-[60px] rounded-full pointer-events-none"></div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 sm:py-1.5 rounded-full border surface-bg text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-[var(--primary-glow)] mb-3 sm:mb-4">
              <i data-lucide="shield-check" className="w-3 h-3"></i><span>{t.badge_secure}</span>
            </div>
            <h1 className="text-3xl md:text-6xl font-black tracking-tighter leading-tight text-prime mb-2 sm:mb-3">
              <span>{t.hero_static}</span><br/>
              <div className="h-[1.2em] mt-1 flex justify-center items-center"><Typewriter /></div>
            </h1>
            <p className="text-[10px] sm:text-sm text-sub max-w-lg mx-auto font-medium px-2">{t.hero_sub}</p>
          </div>
        )}

        {/* QUICK POST */}
        {(state.view === 'community' || state.view === 'traders') && (
          <div className="bento-card rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 shadow-sm">
            <div className="flex items-start space-x-3 sm:space-x-4">
              {renderAvatar(state.user ? state.user.avatar : 'U', "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0 text-xs sm:text-sm shadow-sm", state.user?.name[0])}
              <div className="flex-1">
                <input type="text" value={quickTitle} onChange={(e) => setQuickTitle(e.target.value)} placeholder={state.view === 'traders' ? 'Drop a trade signal...' : 'Start a discussion...'} className="w-full bg-transparent text-prime font-bold text-sm sm:text-lg outline-none placeholder-[var(--text-muted)] mb-1.5 sm:mb-2" />
                <textarea rows="2" value={quickDesc} onChange={(e) => setQuickDesc(e.target.value)} placeholder="What are your thoughts?" className="w-full bg-transparent text-xs sm:text-sm text-prime outline-none resize-none placeholder-[var(--text-muted)] font-medium whitespace-pre-wrap"></textarea>
                
                {quickImage && (
                  <div className="relative mt-2 sm:mt-3 mb-2 w-fit">
                    <img src={quickImage} alt="Preview" className="h-24 sm:h-32 rounded-lg sm:rounded-xl border border-[var(--border-line)] object-cover shadow-sm" />
                    <button onClick={() => setQuickImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:scale-110 transition relative z-10">
                      <i data-lucide="x" className="w-3 h-3 pointer-events-none"></i>
                    </button>
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-2 sm:pt-3 border-t border-[var(--border-line)] mt-2 sm:mt-3">
                  <div className="flex space-x-1 sm:space-x-2 text-sub">
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="btn-press p-1.5 sm:p-2 hover:text-prime hover:bg-[var(--border-line)] rounded-lg sm:rounded-xl transition" title="Attach Image"><i data-lucide="image" className="w-4 h-4 pointer-events-none"></i></button>
                    <button onClick={() => setState(prev => ({...prev, toast: {type:'info', message:'Link disabled.'}}))} className="btn-press p-1.5 sm:p-2 hover:text-prime hover:bg-[var(--border-line)] rounded-lg sm:rounded-xl transition"><i data-lucide="link" className="w-4 h-4 pointer-events-none"></i></button>
                  </div>
                  <button onClick={handleQuickPost} className="btn-press px-6 sm:px-8 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-white font-bold text-xs sm:text-sm shadow-md relative z-10" style={{ background: 'var(--primary-glow)' }}>Post</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FEED SEPARATOR */}
        <div className="flex justify-between items-center mb-3 sm:mb-4 px-1">
          <h3 className="text-xs sm:text-sm font-bold text-sub uppercase tracking-widest">Latest Updates</h3>
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <i data-lucide="arrow-down-up" className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sub"></i>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent text-[10px] sm:text-xs font-bold text-prime outline-none cursor-pointer">
              <option value="newest" className="bg-[var(--bg-surface)]">Newest</option>
              {state.view === 'gigs' && <option value="price_desc" className="bg-[var(--bg-surface)]">Highest Price</option>}
              {(state.view === 'community' || state.view === 'gigs') && <option value="popular" className="bg-[var(--bg-surface)]">Popular</option>}
            </select>
          </div>
        </div>

        {/* FEED RENDER */}
        {isLoading ? (
          <Skeleton view={state.view} />
        ) : filteredData.length === 0 ? (
          <div className="text-center py-16 sm:py-20 border border-dashed border-[var(--border-line)] rounded-2xl sm:rounded-3xl">
            <i data-lucide="filterX" className="w-6 h-6 sm:w-8 sm:h-8 text-sub mx-auto mb-2 sm:mb-3 opacity-50"></i>
            <p className="text-xs sm:text-sm font-medium text-sub">No results match filter.</p>
            <button onClick={() => { setActiveFilter('all'); setSearchQuery(''); }} className="mt-3 sm:mt-4 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg surface-bg border border-[var(--border-line)] text-[10px] sm:text-xs text-[var(--primary-glow)] font-bold hover-lift relative z-10">Clear Filters</button>
          </div>
        ) : (
          <div className={state.view === 'gigs' ? "grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6" : "flex flex-col space-y-4 sm:space-y-6"}>
            {filteredData.map(item => {
              
              if (state.view === 'gigs') {
                // 📍 FIX: บีบ Padding การ์ดมือถือให้กะทัดรัด (p-4 sm:p-6)
                return (
                  <div key={item.id} onClick={() => setState(prev => ({ ...prev, activeModal: 'modal-gig-detail', selectedItem: item }))} className="btn-press bento-card rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 cursor-pointer flex flex-col justify-between h-[200px] sm:h-[240px] group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-[var(--primary-glow)] opacity-0 group-hover:opacity-10 blur-[40px] transition-opacity duration-500 rounded-full pointer-events-none"></div>
                    <div>
                      <div className="flex justify-between items-start mb-3 sm:mb-4">
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase text-sub surface-bg px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-[var(--border-line)] shadow-sm pointer-events-none">{item.loc}</span>
                        <button onClick={(e) => handleReport(e, item)} className="relative z-10 text-gray-400 opacity-60 hover:opacity-100 hover:text-red-500 transition p-1.5 sm:p-2 bg-black/5 hover:bg-red-500/10 rounded-lg sm:rounded-xl border border-transparent hover:border-red-500/30 shrink-0" title="Report">
                          <i data-lucide="flag" className="w-3.5 h-3.5 sm:w-4 sm:h-4 pointer-events-none"></i>
                        </button>
                      </div>
                      <h3 className="text-base sm:text-xl font-bold text-prime mb-1.5 sm:mb-2 line-clamp-1 break-words pointer-events-none">{item.title}</h3>
                      <p className="text-[10px] sm:text-xs text-sub line-clamp-2 leading-relaxed font-medium break-words whitespace-pre-wrap pointer-events-none">{item.desc}</p>
                    </div>
                    <div className="flex justify-between items-end mt-auto pt-3 sm:pt-4 border-t border-[var(--border-line)]/50">
                      <div onClick={(e) => openProfile(e, item.host, item.avatar)} className="relative z-10 hover:opacity-80 transition cursor-pointer flex items-center space-x-2 sm:space-x-3">
                         {renderAvatar(item.avatar || item.host[0], "w-6 h-6 sm:w-8 sm:h-8 rounded-full text-[10px] sm:text-xs shadow-sm", item.host[0])}
                         <div>
                           <p className="text-[8px] sm:text-[9px] text-sub uppercase tracking-wider mb-0.5 font-bold break-words pointer-events-none">Host</p>
                           <span className="text-xs sm:text-sm font-bold text-prime hover:underline break-words pointer-events-none">{item.host}</span>
                         </div>
                      </div>
                      <button onClick={(e) => handleApply(e, item)} className="relative z-10 btn-press px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl surface-bg border border-[var(--border-line)] flex items-center justify-center hover:border-[var(--primary-glow)] hover:text-[var(--primary-glow)] text-prime shadow-sm transition-all duration-300 font-bold text-[10px] sm:text-xs gap-1.5 sm:gap-2 shrink-0">
                        Apply <i data-lucide="arrow-up-right" className="w-3 h-3 sm:w-3.5 sm:h-3.5 pointer-events-none"></i>
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={item.id} onClick={() => setState(prev => ({ ...prev, activeModal: 'modal-gig-detail', selectedItem: item }))} className="btn-press bento-card rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 cursor-pointer relative group">
                  <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <div onClick={(e) => openProfile(e, item.host, item.avatar)} className="relative z-10 flex items-center space-x-3 sm:space-x-4 hover:opacity-80 transition cursor-pointer w-fit">
                      {renderAvatar(item.avatar || item.host[0], "w-10 h-10 sm:w-12 sm:h-12 rounded-full text-sm sm:text-base shadow-sm", item.host[0])}
                      <div className="flex flex-col pointer-events-none">
                        <span className="text-sm sm:text-base font-bold text-prime hover:underline break-words">{item.host}</span>
                        <span className="text-[9px] sm:text-[10px] text-[var(--primary-glow)] flex items-center font-bold mt-0.5"><i data-lucide="shield-check" className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 pointer-events-none"></i> Verified</span>
                      </div>
                    </div>
                    <button onClick={(e) => handleReport(e, item)} className="relative z-10 text-gray-400 opacity-60 hover:opacity-100 hover:text-red-500 transition p-1.5 sm:p-2 bg-black/5 hover:bg-red-500/10 rounded-lg sm:rounded-xl border border-transparent hover:border-red-500/30 shrink-0" title="Report">
                      <i data-lucide="flag" className="w-3.5 h-3.5 sm:w-4 h-4 pointer-events-none"></i>
                    </button>
                  </div>
                  
                  <h3 className="text-base sm:text-xl font-bold text-prime mb-2 sm:mb-3 leading-tight break-words pointer-events-none">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-sub mb-4 sm:mb-6 leading-relaxed font-medium break-words whitespace-pre-wrap pointer-events-none">{item.desc}</p>
                  
                  {item.image && (
                    <div className="mb-4 sm:mb-6 rounded-xl sm:rounded-2xl overflow-hidden border border-[var(--border-line)] max-h-64 sm:max-h-80 pointer-events-none">
                      <img src={item.image} alt="Attachment" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.style.display='none'; }} />
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center border-t border-[var(--border-line)] pt-3 sm:pt-4">
                    {state.view === 'community' && (
                      <div className="flex space-x-4 sm:space-x-6 text-sub text-[10px] sm:text-xs font-bold">
                        <button onClick={(e) => handleLike(e, item.id)} className={`relative z-10 btn-press flex items-center transition ${likedPosts[item.id] ? 'text-red-500' : 'hover:text-white'}`}>
                          <i data-lucide="heart" className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 pointer-events-none transition-all ${likedPosts[item.id] ? 'fill-red-500 animate-heart-burst' : ''}`}></i> {likedPosts[item.id] ? (item.likes || 0) + 1 : (item.likes || 0)}
                        </button>
                        <span className="flex items-center hover:text-white transition pointer-events-none"><i data-lucide="message-circle" className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5"></i> {item.comments || 0}</span>
                      </div>
                    )}
                    {state.view === 'traders' && (
                      <span className={`flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full surface-bg border border-[var(--border-line)] shadow-sm text-[9px] sm:text-[10px] pointer-events-none ${item.sentiment === 'bullish' ? 'text-green-500' : 'text-red-500'}`}>
                        <i data-lucide={item.sentiment === 'bullish' ? 'trending-up' : 'trending-down'} className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5"></i> {item.sentiment?.toUpperCase()}
                      </span>
                    )}
                    {state.view === 'news' && (
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <span className="font-mono text-[8px] sm:text-[9px] surface-bg border border-[var(--border-line)] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded shadow-sm pointer-events-none">SRC: {item.source || 'SYS'}</span>
                        <button className="relative z-10 text-[9px] sm:text-[10px] font-bold text-[var(--primary-glow)] hover:underline flex items-center">
                          Read Article <i data-lucide="external-link" className="w-3 h-3 ml-1 pointer-events-none"></i>
                        </button>
                      </div>
                    )}
                    <button onClick={(e) => handleShare(e)} className="relative z-10 btn-press text-sub hover:text-[var(--primary-glow)] p-1 sm:p-1.5 rounded-lg hover:bg-white/5 transition">
                      <i data-lucide="-2" className="w-3.5 h-3.5 sm:w-4 sm:h-4 pointer-events-none"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>

    {/* 📍 RIGHT SIDEBAR WIDGETS (Desktop Only - untouched) */}
    <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
      <div className="sticky top-[88px] space-y-6">
        <div className="glass-panel border rounded-3xl p-5 hover-lift">
          <h3 className="text-sm font-bold text-prime mb-4 flex items-center border-b border-[var(--border-line)] pb-2">
            <i data-lucide="trending-up" className="w-4 h-4 mr-2 text-[var(--primary-glow)]"></i> Trending Now
          </h3>
          <div className="space-y-4">
            <div className="cursor-pointer group">
              <p className="text-xs font-bold text-prime group-hover:text-[var(--primary-glow)] transition">#NFP Week</p>
              <p className="text-[10px] text-sub mt-0.5">1,245 posts</p>
            </div>
            <div className="cursor-pointer group">
              <p className="text-xs font-bold text-prime group-hover:text-[var(--primary-glow)] transition">Bitcoin Halving</p>
              <p className="text-[10px] text-sub mt-0.5">858 posts</p>
            </div>
          </div>
        </div>

        <div className="glass-panel border rounded-3xl p-5 hover-lift">
          <h3 className="text-sm font-bold text-prime mb-4 flex items-center border-b border-[var(--border-line)] pb-2">
            <i data-lucide="users" className="w-4 h-4 mr-2 text-sub"></i> Top Profiles
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">E</div>
                <div><p className="text-xs font-bold text-prime hover:underline cursor-pointer">Elena R.</p><p className="text-[9px] text-sub">FX Mentor</p></div>
              </div>
              <button className="text-[10px] font-bold text-[var(--primary-glow)] bg-[var(--primary-glow)]/10 px-3 py-1 rounded-full hover:bg-[var(--primary-glow)] hover:text-white transition">Follow</button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold">D</div>
                <div><p className="text-xs font-bold text-prime hover:underline cursor-pointer">David K.</p><p className="text-[9px] text-sub">Algo Trader</p></div>
              </div>
              <button className="text-[10px] font-bold text-[var(--primary-glow)] bg-[var(--primary-glow)]/10 px-3 py-1 rounded-full hover:bg-[var(--primary-glow)] hover:text-white transition">Follow</button>
            </div>
          </div>
        </div>
      </div>
    </aside>

    </div>
  );
}
