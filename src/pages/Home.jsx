import React, { useContext, useEffect, useState } from 'react';
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
  const [activeFilter, setActiveFilter] = useState('all');

  // INIT: Feed Engine
  useEffect(() => {
    let isMounted = true;
    const loadDataAndTranslate = async () => {
      setIsLoading(true);
      const data = await DatabaseService.getFeedData(state.view);
      
      if (data.length === 0 || state.lang === 'en') {
        if (isMounted) { setViewData(data); setFilteredData(data); setIsLoading(false); }
        return;
      }
      
      const translated = await Promise.all(data.map(async (item) => {
        const tTitle = await NetworkTranslator.translateText(item.title, state.lang, state.transApi);
        const tDesc = await NetworkTranslator.translateText(item.desc, state.lang, state.transApi);
        return { ...item, title: tTitle, desc: tDesc };
      }));
      
      if (isMounted) { setViewData(translated); setFilteredData(translated); setIsLoading(false); }
    };
    loadDataAndTranslate();
    return () => { isMounted = false; };
  }, [state.view, state.lang, state.transApi, state.refreshTick]);

  // EXEC: Filters
  useEffect(() => {
    if (activeFilter === 'all') setFilteredData(viewData);
    else if (activeFilter === 'remote') setFilteredData(viewData.filter(i => i.loc?.toLowerCase() === 'remote'));
    else if (activeFilter === 'high_budget') setFilteredData(viewData.filter(i => i.price >= 1000));
    else if (activeFilter === 'top_rated') setFilteredData(viewData.filter(i => (i.likes || 0) > 100));
    else if (activeFilter === 'bullish') setFilteredData(viewData.filter(i => i.sentiment === 'bullish'));
  }, [activeFilter, viewData]);

  useEffect(() => { setActiveFilter('all'); }, [state.view]);

  // EXEC: Core Actions
  const handleApply = (e, item) => {
    e.stopPropagation();
    if (!state.user) return setState(prev => ({ ...prev, activeModal: 'modal-login' }));
    setState(prev => ({ ...prev, activeModal: 'modal-escrow', selectedItem: item }));
  };

  const openProfile = (e, hostName, avatarData) => {
    e.stopPropagation();
    setState(prev => ({ ...prev, activeModal: 'modal-profile', targetUser: { name: hostName, avatar: avatarData || hostName[0] } }));
  };

  // 📍 EXEC: Share Action (Triggers Toast)
  const handleShare = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.href);
    setState(prev => ({ ...prev, toast: { type: 'success', message: 'Link copied to clipboard!' } }));
  };

  // 📍 EXEC: Report Action (Triggers Toast)
  const handleReport = (e) => {
    e.stopPropagation();
    setState(prev => ({ ...prev, toast: { type: 'info', message: 'Content flagged for review.' } }));
  };

  // 📍 EXEC: Quick Post (Triggers Toast & Notification)
  const handleQuickPost = async () => {
    if (!state.user) return setState(prev => ({ ...prev, activeModal: 'modal-login' }));
    if (!quickTitle.trim() || !quickDesc.trim()) {
      return setState(prev => ({ ...prev, toast: { type: 'error', message: 'Fields cannot be empty.' } }));
    }
    
    const newPost = { id: 'p' + Date.now(), type: 'post', host: state.user.name, avatar: state.user.avatar, title: quickTitle, desc: quickDesc, tag: state.view === 'traders' ? 'Signal' : 'Discussion', likes: 0, comments: 0 };
    await DatabaseService.createPost(newPost, state.view);
    
    setQuickTitle(''); setQuickDesc('');
    setState(prev => ({ 
      ...prev, 
      refreshTick: prev.refreshTick + 1,
      toast: { type: 'success', message: 'Post published successfully!' },
      notifications: [{ title: 'Post Published', desc: 'Your post is now live.' }, ...prev.notifications]
    }));
  };

  const renderAvatar = (avatarData, sizeClasses) => {
    if (avatarData && (avatarData.startsWith('http') || avatarData.startsWith('blob:'))) return <img src={avatarData} alt="Avatar" className={`object-cover ${sizeClasses}`} />;
    return <div className={`flex items-center justify-center text-white font-bold bg-gray-700 ${sizeClasses}`}>{avatarData ? avatarData[0] : 'U'}</div>;
  };

  return (
    <div className="space-y-10 sm:space-y-12 max-w-5xl mx-auto pb-20">
      
      {state.view === 'gigs' && (
        <div className="text-center space-y-4 sm:space-y-6 pt-4 sm:pt-8 transition-all duration-500">
          <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-full border surface-bg text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-sub">
            <i data-lucide="globe-2" className="w-3.5 h-3.5" style={{ color: 'var(--primary-glow)' }}></i>
            <span>{t.badge_secure}</span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-tight text-prime">
            <span>{t.hero_static}</span><br/>
            <div className="h-[1.2em] mt-1 sm:mt-2 flex justify-center items-center"><Typewriter /></div>
          </h1>
          <p className="text-xs sm:text-base text-sub max-w-2xl mx-auto px-4">{t.hero_sub}</p>
        </div>
      )}

      {/* Nav & Search */}
      <div className="glass-panel flex flex-col-reverse sm:flex-row justify-between items-center gap-4 sticky top-[72px] z-30 py-3 px-4 sm:px-5 rounded-3xl mt-4 shadow-xl">
        <div className="flex p-1.5 bg-black/5 border border-[var(--border-line)] rounded-2xl w-full sm:w-auto overflow-x-auto hide-scrollbar">
          {['gigs', 'community', 'traders', 'news'].map((nav) => (
            <button key={nav} onClick={() => setState(prev => ({ ...prev, view: nav }))} className={`btn-press flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 w-full sm:w-auto ${state.view === nav ? 'surface-bg text-prime shadow-md border border-[var(--border-line)]' : 'text-sub hover:text-prime hover:bg-white/5'}`}>
              {nav === 'gigs' && <i data-lucide="briefcase" className="w-4 h-4"></i>}
              {nav === 'community' && <i data-lucide="users" className="w-4 h-4"></i>}
              {nav === 'traders' && <i data-lucide="trending-up" className="w-4 h-4"></i>}
              {nav === 'news' && <i data-lucide="newspaper" className="w-4 h-4"></i>}
              <span className="hidden sm:inline">{nav}</span>
            </button>
          ))}
        </div>
        <div className="w-full sm:w-80 relative group">
          <i data-lucide="search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sub group-hover:text-[var(--primary-glow)] transition"></i>
          <input type="text" className="w-full bg-[var(--bg-base)] border border-[var(--border-line)] hover:border-[var(--primary-glow)]/50 rounded-2xl pl-11 pr-4 py-3 text-sm text-prime outline-none focus:border-[var(--primary-glow)] transition-all shadow-sm" placeholder="Search skills, posts, or news..." />
        </div>
      </div>

      <section>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 mt-6 gap-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full animate-pulse" style={{ backgroundColor: 'var(--primary-glow)', boxShadow: '0 0 10px var(--primary-glow)' }}></span>
            <h2 className="text-lg sm:text-xl font-black text-prime uppercase tracking-wider">{state.view} Stream</h2>
          </div>
          
          <div className="flex items-center space-x-2 overflow-x-auto hide-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
            <button onClick={() => setActiveFilter('all')} className={`btn-press px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition whitespace-nowrap ${activeFilter === 'all' ? 'bg-[var(--primary-glow)] text-white shadow-md' : 'surface-bg border border-[var(--border-line)] text-sub hover:text-prime'}`}>All</button>
            {state.view === 'gigs' && (
              <>
                <button onClick={() => setActiveFilter('remote')} className={`btn-press px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition whitespace-nowrap ${activeFilter === 'remote' ? 'bg-[var(--primary-glow)] text-white shadow-md' : 'surface-bg border border-[var(--border-line)] text-sub hover:text-prime'}`}>Remote Only</button>
                <button onClick={() => setActiveFilter('high_budget')} className={`btn-press px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition whitespace-nowrap flex items-center ${activeFilter === 'high_budget' ? 'bg-[var(--primary-glow)] text-white shadow-md' : 'surface-bg border border-[var(--border-line)] text-sub hover:text-prime'}`}><i data-lucide="flame" className="w-3 h-3 mr-1"></i> High Budget</button>
              </>
            )}
            {state.view === 'community' && <button onClick={() => setActiveFilter('top_rated')} className={`btn-press px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition whitespace-nowrap flex items-center ${activeFilter === 'top_rated' ? 'bg-[var(--primary-glow)] text-white shadow-md' : 'surface-bg border border-[var(--border-line)] text-sub hover:text-prime'}`}><i data-lucide="trending-up" className="w-3 h-3 mr-1"></i> Top Rated</button>}
            {state.view === 'traders' && <button onClick={() => setActiveFilter('bullish')} className={`btn-press px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition whitespace-nowrap flex items-center ${activeFilter === 'bullish' ? 'bg-green-500 text-white shadow-md' : 'surface-bg border border-[var(--border-line)] text-sub hover:text-prime'}`}><i data-lucide="trending-up" className="w-3 h-3 mr-1"></i> Bullish Intel</button>}
            {state.view === 'news' && <button onClick={() => setState(prev => ({ ...prev, activeModal: 'modal-add-news' }))} className="btn-press px-3 py-1.5 rounded-lg text-white text-[10px] sm:text-xs font-bold shadow-md flex items-center gap-1.5 hover-lift whitespace-nowrap ml-auto" style={{ background: 'var(--primary-glow)' }}><i data-lucide="plus" className="w-3.5 h-3.5"></i> Add News</button>}
          </div>
        </div>

        {/* QUICK POST */}
        {(state.view === 'community' || state.view === 'traders') && (
          <div className="bento-card rounded-[2rem] p-5 mb-8">
            <div className="flex items-start space-x-4">
              {renderAvatar(state.user ? state.user.avatar : 'U', "w-10 h-10 rounded-full flex-shrink-0 text-sm")}
              <div className="flex-1">
                <input type="text" value={quickTitle} onChange={(e) => setQuickTitle(e.target.value)} placeholder={state.view === 'traders' ? 'Drop a trade signal...' : 'Start a discussion...'} className="w-full bg-transparent text-prime font-bold text-base outline-none placeholder-[var(--text-muted)] mb-2" />
                <textarea rows="2" value={quickDesc} onChange={(e) => setQuickDesc(e.target.value)} placeholder="What are your thoughts?" className="w-full bg-transparent text-xs sm:text-sm text-prime outline-none resize-none placeholder-[var(--text-muted)]"></textarea>
                <div className="flex justify-between items-center pt-2 border-t border-[var(--border-line)] mt-2">
                  <div className="flex space-x-1 text-sub">
                    <button onClick={() => setState(prev => ({...prev, toast: {type:'info', message:'File upload coming soon.'}}))} className="btn-press p-2 hover:text-prime hover:bg-white/5 rounded-xl transition"><i data-lucide="image" className="w-4 h-4"></i></button>
                    <button onClick={() => setState(prev => ({...prev, toast: {type:'info', message:'Link attachment disabled.'}}))} className="btn-press p-2 hover:text-prime hover:bg-white/5 rounded-xl transition"><i data-lucide="link" className="w-4 h-4"></i></button>
                  </div>
                  <button onClick={handleQuickPost} className="btn-press px-6 py-2 rounded-xl text-white font-bold text-xs shadow-md" style={{ background: 'var(--primary-glow)' }}>Post</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FEED RENDER */}
        {isLoading ? (
          <Skeleton view={state.view} />
        ) : filteredData.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[var(--border-line)] rounded-3xl">
            <i data-lucide="filterX" className="w-8 h-8 text-sub mx-auto mb-3 opacity-50"></i>
            <p className="text-sm text-sub">No results match your current filter.</p>
            <button onClick={() => setActiveFilter('all')} className="mt-3 text-[10px] text-[var(--primary-glow)] uppercase tracking-widest hover:underline font-bold">Clear Filters</button>
          </div>
        ) : (
          <div className={state.view === 'gigs' ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "flex flex-col space-y-6"}>
            {filteredData.map(item => {
              
              if (state.view === 'gigs') {
                return (
                  <div key={item.id} onClick={() => setState(prev => ({ ...prev, activeModal: 'modal-gig-detail', selectedItem: item }))} className="btn-press bento-card rounded-[2rem] p-6 cursor-pointer flex flex-col justify-between h-[240px] group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-glow)] opacity-0 group-hover:opacity-10 blur-[60px] transition-opacity duration-500 rounded-full"></div>
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold uppercase text-sub surface-bg px-3 py-1 rounded-full border border-[var(--border-line)] shadow-sm">{item.loc}</span>
                        <button onClick={(e) => handleReport(e)} className="text-sub hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><i data-lucide="more-horizontal" className="w-4 h-4"></i></button>
                      </div>
                      <h3 className="text-xl font-bold text-prime mb-2 line-clamp-1">{item.title}</h3>
                      <p className="text-xs text-sub line-clamp-2 leading-relaxed">{item.desc}</p>
                    </div>
                    <div className="flex justify-between items-end mt-auto pt-4">
                      <div onClick={(e) => openProfile(e, item.host, item.avatar)} className="hover:opacity-80 transition cursor-pointer">
                        <p className="text-[10px] text-sub uppercase tracking-wider mb-1">Host Identity</p>
                        <span className="text-sm font-bold text-prime flex items-center hover:underline">
                          {renderAvatar(item.avatar || item.host[0], "w-5 h-5 rounded-full mr-2 text-[8px]")}
                          {item.host}
                        </span>
                      </div>
                      <button onClick={(e) => handleApply(e, item)} className="btn-press w-10 h-10 rounded-full surface-bg border border-[var(--border-line)] flex items-center justify-center hover:border-[var(--primary-glow)] hover:text-[var(--primary-glow)] text-prime shadow-sm transition-all duration-300">
                        <i data-lucide="arrow-up-right" className="w-5 h-5"></i>
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={item.id} onClick={() => setState(prev => ({ ...prev, activeModal: 'modal-gig-detail', selectedItem: item }))} className="btn-press bento-card rounded-[2rem] p-6 cursor-pointer relative group">
                  <button onClick={(e) => handleReport(e)} className="absolute top-6 right-6 text-sub hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><i data-lucide="more-horizontal" className="w-4 h-4"></i></button>
                  <div onClick={(e) => openProfile(e, item.host, item.avatar)} className="flex items-center space-x-3 mb-4 hover:opacity-80 transition cursor-pointer w-fit">
                    {renderAvatar(item.avatar || item.host[0], "w-10 h-10 rounded-full text-sm shadow-sm")}
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-prime hover:underline">{item.host}</span>
                      <span className="text-[10px] text-[var(--primary-glow)] flex items-center"><i data-lucide="shield-check" className="w-3 h-3 mr-1"></i> Verified</span>
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-prime mb-2">{item.title}</h3>
                  <p className="text-sm text-sub mb-6 leading-relaxed">{item.desc}</p>
                  
                  <div className="flex justify-between items-center border-t border-[var(--border-line)] pt-3 sm:pt-4">
                    {state.view === 'community' && (
                      <div className="flex space-x-4 sm:space-x-6 text-sub text-[11px] sm:text-xs font-medium">
                        <span onClick={(e) => {e.stopPropagation(); setState(prev=>({...prev, toast: {type:'success', message:'Post liked!'}}))}} className="flex items-center hover:text-[var(--primary-glow)] transition"><i data-lucide="heart" className="w-4 h-4 mr-1.5"></i> {item.likes || 0}</span>
                        <span className="flex items-center hover:text-[var(--primary-glow)] transition"><i data-lucide="message-circle" className="w-4 h-4 mr-1.5"></i> {item.comments || 0}</span>
                      </div>
                    )}
                    {state.view === 'traders' && (
                      <span className={`flex items-center px-3 py-1 rounded-full surface-bg border border-[var(--border-line)] shadow-sm ${item.sentiment === 'bullish' ? 'text-green-500' : 'text-red-500'}`}>
                        <i data-lucide={item.sentiment === 'bullish' ? 'trending-up' : 'trending-down'} className="w-3.5 h-3.5 mr-1.5"></i> {item.sentiment?.toUpperCase()}
                      </span>
                    )}
                    {state.view === 'news' && (
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[10px] surface-bg border border-[var(--border-line)] px-2 py-1 rounded shadow-sm">SRC: {item.source || 'SYS'}</span>
                        <button className="text-[10px] sm:text-xs font-bold text-[var(--primary-glow)] hover:underline flex items-center">Read Article <i data-lucide="external-link" className="w-3 h-3 ml-1"></i></button>
                      </div>
                    )}
                    <button onClick={(e) => handleShare(e)} className="btn-press text-sub hover:text-[var(--primary-glow)] p-1"><i data-lucide="share-2" className="w-4 h-4 sm:w-4.5 sm:h-4.5"></i></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
