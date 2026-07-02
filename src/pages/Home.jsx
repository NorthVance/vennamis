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

  const [viewData, setViewData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [quickTitle, setQuickTitle] = useState('');
  const [quickDesc, setQuickDesc] = useState('');
  const [quickImage, setQuickImage] = useState(null);
  const fileInputRef = useRef(null);
  
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [likedPosts, setLikedPosts] = useState({});

  // SEC: Pipeline
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedSearch(searchQuery); }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
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
    loadData();
    return () => { isMounted = false; };
  }, [state.view, state.lang, state.transApi, state.refreshTick]);

  useEffect(() => {
    let result = [...viewData];
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
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
  }, [activeFilter, viewData, debouncedSearch, sortBy]);

  useEffect(() => { setActiveFilter('all'); setSearchQuery(''); setDebouncedSearch(''); setSortBy('newest'); }, [state.view]);
  useEffect(() => { if (window.lucide) setTimeout(() => window.lucide.createIcons(), 50); }, [filteredData, state.view, sortBy, quickImage]);

  // SEC: Handlers
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
    if (avatarData && (avatarData.startsWith('http') || avatarData.startsWith('blob:'))) return <img src={avatarData} alt="Avatar" loading="lazy" className={`object-cover pointer-events-none ${sizeClasses}`} onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />;
    return <div className={`flex items-center justify-center text-white font-bold bg-gray-800 pointer-events-none ${sizeClasses}`}>{avatarData ? avatarData[0] : fallbackText}</div>;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 xl:gap-8 w-full mx-auto pb-20">
      
      <aside className="hidden lg:block w-56 xl:w-64 shrink-0">
        <div className="sticky top-[88px] space-y-8">
          <div>
            <p className="text-[10px] font-bold text-sub uppercase tracking-widest pl-3 mb-3">Platform</p>
            <div className="space-y-1">
              {['gigs', 'community', 'traders', 'news'].map((nav) => (
                <button key={nav} onClick={() => setState(prev => ({ ...prev, view: nav }))} className={`btn-press w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold capitalize transition-all duration-200 ${state.view === nav ? 'bg-[var(--primary-glow)]/10 text-[var(--primary-glow)] border border-[var(--primary-glow)]/20 shadow-sm' : 'text-sub hover:text-prime hover:bg-white/5 border border-transparent'}`}>
                  {nav === 'gigs' && <i data-lucide="briefcase" className="w-4 h-4"></i>}{nav === 'community' && <i data-lucide="users" className="w-4 h-4"></i>}{nav === 'traders' && <i data-lucide="trending-up" className="w-4 h-4"></i>}{nav === 'news' && <i data-lucide="newspaper" className="w-4 h-4"></i>}
                  <span>{nav}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-sub uppercase tracking-widest pl-3 mb-3">Discover</p>
            <div className="space-y-1">
              <button onClick={() => setActiveFilter('all')} className={`btn-press w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeFilter === 'all' ? 'text-prime bg-white/5' : 'text-sub hover:text-prime hover:bg-white/5'}`}><i data-lucide="compass" className="w-3.5 h-3.5"></i> All Feed</button>
              {state.view === 'gigs' && (
                <><button onClick={() => setActiveFilter('remote')} className={`btn-press w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeFilter === 'remote' ? 'text-prime bg-white/5' : 'text-sub hover:text-prime hover:bg-white/5'}`}><i data-lucide="globe" className="w-3.5 h-3.5"></i> Remote Only</button><button onClick={() => setActiveFilter('high_budget')} className={`btn-press w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeFilter === 'high_budget' ? 'text-prime bg-white/5' : 'text-sub hover:text-prime hover:bg-white/5'}`}><i data-lucide="flame" className="w-3.5 h-3.5 text-amber-500"></i> High Budget</button></>
              )}
              {state.view === 'community' && <button onClick={() => setActiveFilter('top_rated')} className={`btn-press w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeFilter === 'top_rated' ? 'text-prime bg-white/5' : 'text-sub hover:text-prime hover:bg-white/5'}`}><i data-lucide="trending-up" className="w-3.5 h-3.5 text-[var(--primary-glow)]"></i> Top Rated</button>}
              {state.view === 'traders' && <button onClick={() => setActiveFilter('bullish')} className={`btn-press w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeFilter === 'bullish' ? 'text-prime bg-white/5' : 'text-sub hover:text-prime hover:bg-white/5'}`}><i data-lucide="trending-up" className="w-3.5 h-3.5 text-green-500"></i> Bullish Intel</button>}
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 space-y-6 md:space-y-8">
        
        <div className="lg:hidden flex flex-col items-center space-y-4 mb-2">
          <div className="glass-panel p-1 bg-[var(--bg-base)]/80 border border-[var(--border-line)] rounded-full flex items-center shadow-lg max-w-[340px] w-full mx-auto">
            {['gigs', 'community', 'traders', 'news'].map((nav) => (
              <button key={nav} onClick={() => setState(prev => ({ ...prev, view: nav }))} className={`btn-press flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all ${state.view === nav ? 'bg-[var(--primary-glow)] text-white shadow-md' : 'text-sub hover:text-prime'}`}>
                {nav === 'gigs' && <i data-lucide="briefcase" className="w-4 h-4"></i>}{nav === 'community' && <i data-lucide="users" className="w-4 h-4"></i>}{nav === 'traders' && <i data-lucide="trending-up" className="w-4 h-4"></i>}{nav === 'news' && <i data-lucide="newspaper" className="w-4 h-4"></i>}
                <span className="truncate">{nav}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center space-x-2 overflow-x-auto hide-scrollbar pb-1 w-full max-w-[340px]">
            <button onClick={() => setActiveFilter('all')} className={`btn-press px-4 py-1.5 rounded-full text-[9px] font-bold transition whitespace-nowrap ${activeFilter === 'all' ? 'bg-white/10 text-prime border border-[var(--border-line)]' : 'text-sub hover:text-prime'}`}>All</button>
            {state.view === 'gigs' && (
              <><button onClick={() => setActiveFilter('remote')} className={`btn-press px-4 py-1.5 rounded-full text-[9px] font-bold transition whitespace-nowrap ${activeFilter === 'remote' ? 'bg-white/10 text-prime border border-[var(--border-line)]' : 'text-sub hover:text-prime'}`}>Remote</button><button onClick={() => setActiveFilter('high_budget')} className={`btn-press px-4 py-1.5 rounded-full text-[9px] font-bold transition whitespace-nowrap flex items-center ${activeFilter === 'high_budget' ? 'bg-white/10 text-prime border border-[var(--border-line)]' : 'text-sub hover:text-prime'}`}><i data-lucide="flame" className="w-3 h-3 mr-1 pointer-events-none"></i> High Budget</button></>
            )}
            {state.view === 'community' && <button onClick={() => setActiveFilter('top_rated')} className={`btn-press px-4 py-1.5 rounded-full text-[9px] font-bold transition whitespace-nowrap flex items-center ${activeFilter === 'top_rated' ? 'bg-white/10 text-prime border border-[var(--border-line)]' : 'text-sub hover:text-prime'}`}><i data-lucide="trending-up" className="w-3 h-3 mr-1 pointer-events-none"></i> Top Rated</button>}
            {state.view === 'traders' && <button onClick={() => setActiveFilter('bullish')} className={`btn-press px-4 py-1.5 rounded-full text-[9px] font-bold transition whitespace-nowrap flex items-center ${activeFilter === 'bullish' ? 'bg-white/10 text-prime border border-[var(--border-line)]' : 'text-sub hover:text-prime'}`}><i data-lucide="trending-up" className="w-3 h-3 mr-1 pointer-events-none"></i> Bullish</button>}
          </div>
        </div>

        <div className="relative group flex items-center w-full">
          <i data-lucide="search" className="absolute left-4 w-4 h-4 text-sub group-hover:text-[var(--primary-glow)] transition pointer-events-none z-10"></i>
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[var(--bg-surface)] backdrop-blur-xl border border-[var(--border-line)] hover:border-[var(--primary-glow)]/50 rounded-2xl pl-11 pr-14 py-3 sm:py-4 text-sm text-prime outline-none focus:border-[var(--primary-glow)] transition-all shadow-sm font-medium" placeholder="Search skills, posts, or news..." />
          <button className="absolute right-2 p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-[var(--border-line)] text-sub hover:text-prime transition z-10 flex items-center justify-center" title="Advanced Filters">
            <i data-lucide="sliders-horizontal" className="w-4 h-4"></i>
          </button>
        </div>

        {/* UX: Locked Hero Layout (Fixed Height, No Jumping) */}
        {state.view === 'gigs' && (
          <div className="bento-card rounded-[2rem] px-4 py-8 sm:px-10 text-center relative overflow-hidden group h-[380px] sm:h-[420px] flex flex-col items-center justify-center">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--primary-glow)] opacity-10 blur-[80px] rounded-full pointer-events-none"></div>
            
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border surface-bg text-[9px] font-bold uppercase tracking-widest text-[var(--primary-glow)] mb-8">
              <i data-lucide="shield-check" className="w-3.5 h-3.5"></i><span>{t.badge_secure}</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-prime mb-3">
              {t.hero_static}
            </h1>
            
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight w-full flex justify-center items-center h-[80px] sm:h-[60px] mb-6">
              <Typewriter />
            </div>
            
            <p className="text-xs sm:text-sm text-sub max-w-lg mx-auto font-medium mt-4 px-4">{t.hero_sub}</p>
          </div>
        )}

        {(state.view === 'community' || state.view === 'traders') && (
          <div className="bento-card rounded-[2rem] p-5 sm:p-6 shadow-sm">
            <div className="flex items-start space-x-4">
              {renderAvatar(state.user ? state.user.avatar : 'U', "w-10 h-10 rounded-full flex-shrink-0 text-sm shadow-sm", state.user?.name[0])}
              <div className="flex-1">
                <input type="text" value={quickTitle} onChange={(e) => setQuickTitle(e.target.value)} placeholder={state.view === 'traders' ? 'Drop a trade signal...' : 'Start a discussion...'} className="w-full bg-transparent text-prime font-bold text-base sm:text-lg outline-none placeholder-[var(--text-muted)] mb-2" />
                <textarea rows="2" value={quickDesc} onChange={(e) => setQuickDesc(e.target.value)} placeholder="What are your thoughts?" className="w-full bg-transparent text-xs sm:text-sm text-prime outline-none resize-none placeholder-[var(--text-muted)] font-medium whitespace-pre-wrap"></textarea>
                
                {quickImage && (
                  <div className="relative mt-3 mb-2 w-fit">
                    <img src={quickImage} alt="Preview" className="h-32 rounded-xl border border-[var(--border-line)] object-cover shadow-sm" />
                    <button onClick={() => setQuickImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:scale-110 transition relative z-10"><i data-lucide="x" className="w-3 h-3 pointer-events-none"></i></button>
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-3 border-t border-[var(--border-line)] mt-3">
                  <div className="flex space-x-2 text-sub">
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="btn-press p-2 hover:text-prime hover:bg-[var(--border-line)] rounded-xl transition" title="Attach Image"><i data-lucide="image" className="w-4 h-4 pointer-events-none"></i></button>
                  </div>
                  <button onClick={handleQuickPost} className="btn-press px-8 py-2.5 rounded-xl text-white font-bold text-sm shadow-md relative z-10" style={{ background: 'var(--primary-glow)' }}>Post</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="text-sm font-bold text-sub uppercase tracking-widest">Latest Updates</h3>
          <div className="flex items-center space-x-2">
            {/* UX: Add News Button */}
            {state.view === 'news' && (
              <button onClick={() => setState(prev => ({...prev, activeModal: 'modal-add-news'}))} className="btn-press text-[10px] font-bold bg-white/5 border border-[var(--border-line)] hover:border-[var(--primary-glow)] text-prime px-3 py-1.5 rounded-lg shadow-sm flex items-center transition">
                <i data-lucide="plus" className="w-3 h-3 mr-1 text-[var(--primary-glow)]"></i> Add Source
              </button>
            )}
            <i data-lucide="arrow-down-up" className="w-3.5 h-3.5 text-sub"></i>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent text-xs font-bold text-prime outline-none cursor-pointer">
              <option value="newest" className="bg-[var(--bg-surface)]">Newest</option>
              {state.view === 'gigs' && <option value="price_desc" className="bg-[var(--bg-surface)]">Highest Price</option>}
              {(state.view === 'community' || state.view === 'gigs') && <option value="popular" className="bg-[var(--bg-surface)]">Popular</option>}
            </select>
          </div>
        </div>

        {isLoading ? (
          <Skeleton view={state.view} />
        ) : filteredData.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[var(--border-line)] rounded-3xl">
            <i data-lucide="filterX" className="w-8 h-8 text-sub mx-auto mb-3 opacity-50"></i>
            <p className="text-sm font-medium text-sub">No results match filter.</p>
            <button onClick={() => { setActiveFilter('all'); setSearchQuery(''); setDebouncedSearch(''); }} className="mt-4 px-4 py-2 rounded-lg surface-bg border border-[var(--border-line)] text-xs text-[var(--primary-glow)] font-bold hover-lift relative z-10">Clear Filters</button>
          </div>
        ) : (
          <div className={state.view === 'gigs' ? "grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8" : "flex flex-col space-y-4 sm:space-y-6 lg:space-y-8"}>
            {filteredData.map(item => {
              if (state.view === 'gigs') {
                return (
                  <div key={item.id} onClick={() => setState(prev => ({ ...prev, activeModal: 'modal-gig-detail', selectedItem: item }))} className="btn-press bento-card rounded-[2rem] p-6 sm:p-8 cursor-pointer flex flex-col justify-between h-[240px] lg:h-[260px] group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-glow)] opacity-0 group-hover:opacity-10 blur-[50px] transition-opacity duration-500 rounded-full pointer-events-none"></div>
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold uppercase text-sub surface-bg px-3 py-1 rounded-full border border-[var(--border-line)] shadow-sm pointer-events-none">{item.loc}</span>
                        <button onClick={(e) => handleReport(e, item)} className="relative z-10 text-gray-400 opacity-60 hover:opacity-100 hover:text-red-500 transition p-2 bg-black/5 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/30 shrink-0" title="Report"><i data-lucide="flag" className="w-4 h-4 pointer-events-none"></i></button>
                      </div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-prime mb-2 line-clamp-1 break-words pointer-events-none">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-sub line-clamp-2 leading-relaxed font-medium break-words whitespace-pre-wrap pointer-events-none">{item.desc}</p>
                    </div>
                    <div className="flex justify-between items-end mt-auto pt-4 border-t border-[var(--border-line)]/50">
                      <div onClick={(e) => openProfile(e, item.host, item.avatar)} className="relative z-10 hover:opacity-80 transition cursor-pointer flex items-center space-x-3">
                         {renderAvatar(item.avatar || item.host[0], "w-8 h-8 rounded-full text-xs shadow-sm", item.host[0])}
                         <div><p className="text-[9px] text-sub uppercase tracking-wider mb-0.5 font-bold break-words pointer-events-none">Host Identity</p><span className="text-sm font-bold text-prime hover:underline break-words pointer-events-none">{item.host}</span></div>
                      </div>
                      <button onClick={(e) => handleApply(e, item)} className="relative z-10 btn-press px-4 py-2 rounded-xl surface-bg border border-[var(--border-line)] flex items-center justify-center hover:border-[var(--primary-glow)] hover:text-[var(--primary-glow)] text-prime shadow-sm transition-all duration-300 font-bold text-xs gap-2 shrink-0">Apply <i data-lucide="arrow-up-right" className="w-3.5 h-3.5 pointer-events-none"></i></button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={item.id} onClick={() => setState(prev => ({ ...prev, activeModal: 'modal-gig-detail', selectedItem: item }))} className="btn-press bento-card rounded-[2rem] p-6 sm:p-8 cursor-pointer relative group">
                  <div className="flex justify-between items-start mb-4">
                    <div onClick={(e) => openProfile(e, item.host, item.avatar)} className="relative z-10 flex items-center space-x-3 hover:opacity-80 transition cursor-pointer w-fit">
                      {renderAvatar(item.avatar || item.host[0], "w-10 h-10 rounded-full text-sm shadow-sm", item.host[0])}
                      <div className="flex flex-col pointer-events-none"><span className="text-sm font-bold text-prime hover:underline break-words">{item.host}</span><span className="text-[9px] text-[var(--primary-glow)] flex items-center font-bold mt-0.5"><i data-lucide="shield-check" className="w-3 h-3 mr-1 pointer-events-none"></i> Verified</span></div>
                    </div>
                    <button onClick={(e) => handleReport(e, item)} className="relative z-10 text-gray-400 opacity-60 hover:opacity-100 hover:text-red-500 transition p-1.5 hover:bg-red-500/10 rounded-lg" title="Report"><i data-lucide="flag" className="w-4 h-4 pointer-events-none"></i></button>
                  </div>
                  
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-prime mb-3 leading-tight break-words pointer-events-none">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-sub mb-5 leading-relaxed font-medium break-words whitespace-pre-wrap pointer-events-none">{item.desc}</p>
                  
                  {item.image && (
                    <div className="mb-5 rounded-2xl overflow-hidden border border-[var(--border-line)] max-h-96 pointer-events-none">
                      <img src={item.image} alt="Attachment" loading="lazy" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.style.display='none'; }} />
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-6 text-sub text-xs font-medium border-t border-[var(--border-line)] pt-4">
                    {state.view === 'community' && (
                      <><button onClick={(e) => handleLike(e, item.id)} className={`relative z-10 btn-press flex items-center transition ${likedPosts[item.id] ? 'text-red-500' : 'hover:text-white'}`}><i data-lucide="heart" className={`w-4 h-4 mr-1.5 pointer-events-none transition-all ${likedPosts[item.id] ? 'fill-red-500 animate-heart-burst' : ''}`}></i> {likedPosts[item.id] ? (item.likes || 0) + 1 : (item.likes || 0)}</button><span className="flex items-center hover:text-white transition pointer-events-none"><i data-lucide="message-circle" className="w-4 h-4 mr-1.5"></i> {item.comments || 0}</span></>
                    )}
                    {state.view === 'traders' && (
                      <span className={`flex items-center px-3 py-1 rounded-full surface-bg border border-[var(--border-line)] shadow-sm text-[10px] sm:text-xs pointer-events-none ${item.sentiment === 'bullish' ? 'text-green-500' : 'text-red-500'}`}><i data-lucide="trending-up" className="w-3.5 h-3.5 mr-1.5 pointer-events-none"></i> {item.sentiment?.toUpperCase()}</span>
                    )}
                    {state.view === 'news' && (
                      <div className="flex items-center space-x-3"><span className="font-mono text-[9px] sm:text-[10px] surface-bg border border-[var(--border-line)] px-2 py-1 rounded shadow-sm pointer-events-none">SRC: {item.source || 'SYS'}</span><button className="relative z-10 text-[10px] font-bold text-[var(--primary-glow)] hover:underline flex items-center">Read Article <i data-lucide="external-link" className="w-3 h-3 ml-1 pointer-events-none"></i></button></div>
                    )}
                    <button onClick={(e) => handleShare(e)} className="relative z-10 btn-press text-sub hover:text-[var(--primary-glow)] p-1.5 rounded-lg hover:bg-white/5 transition"><i data-lucide="-2" className="w-4 h-4 pointer-events-none"></i></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <aside className="hidden lg:block w-56 xl:w-60 shrink-0">
        <div className="sticky top-[88px] space-y-6">
          <div className="glass-panel border rounded-3xl p-5 hover-lift">
            <h3 className="text-sm font-bold text-prime mb-4 flex items-center border-b border-[var(--border-line)] pb-2"><i data-lucide="trending-up" className="w-4 h-4 mr-2 text-[var(--primary-glow)]"></i> Trending Now</h3>
            <div className="space-y-4">
              <div className="cursor-pointer group"><p className="text-xs font-bold text-prime group-hover:text-[var(--primary-glow)] transition">#NFP Week</p><p className="text-[10px] text-sub mt-0.5">1,245 posts</p></div>
              <div className="cursor-pointer group"><p className="text-xs font-bold text-prime group-hover:text-[var(--primary-glow)] transition">Bitcoin Halving</p><p className="text-[10px] text-sub mt-0.5">858 posts</p></div>
            </div>
          </div>
          <div className="glass-panel border rounded-3xl p-5 hover-lift">
            <h3 className="text-sm font-bold text-prime mb-4 flex items-center border-b border-[var(--border-line)] pb-2"><i data-lucide="users" className="w-4 h-4 mr-2 text-sub"></i> Top Profiles</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between"><div className="flex items-center space-x-2"><div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">E</div><div><p className="text-xs font-bold text-prime hover:underline cursor-pointer">Elena R.</p><p className="text-[9px] text-sub">FX Mentor</p></div></div><button className="text-[10px] font-bold text-[var(--primary-glow)] bg-[var(--primary-glow)]/10 px-3 py-1 rounded-full hover:bg-[var(--primary-glow)] hover:text-white transition">Follow</button></div>
              <div className="flex items-center justify-between"><div className="flex items-center space-x-2"><div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold">D</div><div><p className="text-xs font-bold text-prime hover:underline cursor-pointer">David K.</p><p className="text-[9px] text-sub">Algo Trader</p></div></div><button className="text-[10px] font-bold text-[var(--primary-glow)] bg-[var(--primary-glow)]/10 px-3 py-1 rounded-full hover:bg-[var(--primary-glow)] hover:text-white transition">Follow</button></div>
            </div>
          </div>
          <div className="text-[10px] text-sub px-2 flex flex-wrap gap-x-3 gap-y-1"><a href="#" className="hover:underline hover:text-prime">Terms</a><a href="#" className="hover:underline hover:text-prime">Privacy Space</a><span>© 2026 Vennamis</span></div>
        </div>
      </aside>

    </div>
  );
}
