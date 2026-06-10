import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import { initialGigsData, initialCommunityData, initialTradersData, initialNewsData, rotatingWords } from '../assets/glows/store';

export default function Home() {
  const { state, setState, t } = useContext(AppContext);
  const [typewriter, setTypewriter] = useState('');
  
  // Typewriter logic แบบรวบรัด
  useEffect(() => {
    let i = 0, isDel = false, wordIdx = 0;
    const words = rotatingWords[state.lang] || rotatingWords['en'];
    const timer = setInterval(() => {
      const fullWord = words[wordIdx % words.length];
      if (!isDel && i <= fullWord.length) { setTypewriter(fullWord.substring(0, i++)); }
      else if (isDel && i >= 0) { setTypewriter(fullWord.substring(0, i--)); }
      
      if (i > fullWord.length + 10) isDel = true;
      if (i < 0) { isDel = false; wordIdx++; i = 0; }
    }, 100);
    return () => clearInterval(timer);
  }, [state.lang]);

  const navs = [
    { id: 'gigs', icon: '💼', label: 'Gigs' }, { id: 'community', icon: '👥', label: 'Community' },
    { id: 'traders', icon: '📈', label: 'Traders' }, { id: 'news', icon: '📰', label: 'News' }
  ];

  const getFeedData = () => {
    switch(state.view) {
      case 'gigs': return initialGigsData;
      case 'community': return initialCommunityData;
      case 'traders': return initialTradersData;
      case 'news': return initialNewsData;
      default: return [];
    }
  };

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 space-y-10">
      
      {state.view === 'gigs' && (
        <div className="text-center space-y-6">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border surface-bg text-[10px] font-bold uppercase text-sub">
             🌐 {t('badge_secure')}
          </div>
          <h1 className="text-4xl md:text-7xl font-black text-prime">
            {t('hero_static')}<br/>
            <span className="glow-text italic">{typewriter}|</span>
          </h1>
          <p className="text-sm md:text-lg text-sub">{t('hero_sub')}</p>
        </div>
      )}

      {/* Search Bar */}
      <div className="max-w-3xl mx-auto glass-panel border p-2 rounded-2xl flex shadow-xl hover-lift">
        <input type="text" placeholder="Search skills, posts..." className="w-full bg-transparent px-4 py-2 outline-none text-prime placeholder-[var(--text-muted)]" />
      </div>

      {/* Navigation */}
      <div className="flex gap-4 pb-2 border-b border-[var(--border-line)] overflow-x-auto">
        {navs.map(nav => (
          <button key={nav.id} onClick={() => setState({...state, view: nav.id})} className={`whitespace-nowrap pb-2 text-xs font-bold uppercase tracking-widest transition-colors ${state.view === nav.id ? 'text-[var(--primary-glow)] border-b-2 border-[var(--primary-glow)]' : 'text-sub hover:text-prime'}`}>
            {nav.icon} {nav.label}
          </button>
        ))}
      </div>

      {/* Grid Feed */}
      <section>
        <div className="flex items-center space-x-3 mb-8">
          <span className="w-3 h-3 rounded-full bg-[var(--primary-glow)] animate-pulse shadow-[0_0_10px_var(--primary-glow)]"></span>
          <h2 className="text-xl font-bold text-prime">{t('title_feed')}</h2>
        </div>

        <div className={state.view === 'gigs' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col space-y-6 max-w-3xl mx-auto"}>
          {getFeedData().map(item => (
            <div key={item.id} className="surface-bg border glow-border rounded-3xl p-6 hover-lift cursor-pointer flex flex-col justify-between" onClick={() => setState({...state, activeModal: 'gigDetail'})}>
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold uppercase text-sub px-2 py-1 rounded bg-white/5 border border-[var(--border-line)]">{item.loc || item.tag}</span>
                  {item.price && <span className="font-black glow-text">${item.price}</span>}
                </div>
                <h3 className="text-lg font-bold text-prime mb-2">{item.title}</h3>
                <p className="text-xs text-sub line-clamp-2">{item.desc}</p>
              </div>
              <div className="flex justify-between items-center border-t border-[var(--border-line)] pt-4 mt-4">
                <span className="text-xs text-sub font-mono">{item.host}</span>
                <span className="text-[10px] font-bold text-[var(--primary-glow)]">{t('applyBtn')} →</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
