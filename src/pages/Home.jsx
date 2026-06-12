import { useState, useEffect } from 'react';
import Typewriter        from '../components/common/Typewriter';
import BentoBlock        from '../components/common/BentoBlock';
import EditorialBlock    from '../components/common/EditorialBlock';
import RetroBlock        from '../components/common/RetroBlock';
import { PostsAPI, NotifAPI, AuthAPI } from '../services/api';
import { customNewsStore } from '../assets/glows/JS/gigsData';
import { NetworkTranslator, StaticDict } from '../assets/glows/JS/localization';

const VIEW_TITLES = { gigs: 'Live Gigs Stream', community: 'Global Community Hub', traders: 'Traders Alpha', news: 'Platform News' };

/**
 * @param {{
 *   user: object | null,
 *   lang: string,
 *   currentView: string,
 *   onSwitchView: (v: string) => void,
 *   onOpenModal: (id: string) => void,
 *   onOpenDetail: (item: object, view: string) => void,
 *   onReport: (id: string) => void
 * }} props
 */
export default function Home({ user, lang, currentView, onSwitchView, onOpenModal, onOpenDetail, onReport }) {
  const [data, setData]         = useState({ gigs: [], community: [], traders: [], news: [] });
  const [loading, setLoading]   = useState(true);
  const [translated, setTranslated] = useState({});

  // Load all feed data on mount
  useEffect(() => {
    (async () => {
      const [gigs, community, traders, news] = await Promise.all([
        PostsAPI.fetchByCategory('gigs'),
        PostsAPI.fetchByCategory('community'),
        PostsAPI.fetchByCategory('traders'),
        PostsAPI.fetchByCategory('news')
      ]);
      setData({ gigs, community, traders, news });
      setLoading(false);
    })();
  }, []);

  // Translate current feed when lang or view changes
  useEffect(() => {
    if (lang === 'en') { setTranslated({}); return; }
    const items = currentView === 'news'
      ? [...data[currentView], ...customNewsStore.getAll()]
      : data[currentView];

    (async () => {
      const map = {};
      for (const item of items) {
        map[item.id] = {
          title: await NetworkTranslator.translateText(item.title, lang),
          desc:  await NetworkTranslator.translateText(item.desc, lang)
        };
      }
      setTranslated(map);
    })();
  }, [lang, currentView, data]);

  const handleQuickPost = async (title, desc, view) => {
    if (!user) { onOpenModal('modal-login'); return; }
    const newPost = { id: 'p' + Date.now(), type: 'post', host: user.name, title, desc, price: 0, tag: view === 'traders' ? 'Signal' : 'Discussion' };
    await PostsAPI.create(newPost);
    setData(prev => ({ ...prev, [view]: [newPost, ...prev[view]] }));
  };

  const handleSubmitGig = async ({ title, desc, loc, price }) => {
    if (!user) { onOpenModal('modal-login'); return; }
    const newPost = { id: 'g' + Date.now(), type: 'gig', host: user.name, title, desc, price, loc, tag: 'New Gig' };
    await PostsAPI.create(newPost);
    setData(prev => ({ ...prev, gigs: [newPost, ...prev.gigs] }));
    onSwitchView('gigs');
  };

  const handleAddCustomNews = (item) => {
    customNewsStore.add(item);
    setData(prev => ({ ...prev })); // force re-render
  };

  const getTitle = (item) => lang === 'en' ? item.title : (translated[item.id]?.title || item.title);
  const getDesc  = (item) => lang === 'en' ? item.desc  : (translated[item.id]?.desc  || item.desc);

  const currentItems = currentView === 'news'
    ? [...data.news, ...customNewsStore.getAll()]
    : data[currentView];

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">

      {/* Hero — Gigs only */}
      {currentView === 'gigs' && (
        <div className="text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border surface-bg text-[10px] font-bold uppercase tracking-widest text-sub">
            <i data-lucide="globe-2" className="w-3.5 h-3.5" style={{ color: 'var(--primary-glow)' }} />
            <span>{StaticDict[lang]?.badge_secure || 'Global Ecosystem'}</span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-tight text-prime">
            <span>{StaticDict[lang]?.hero_static || 'Find trusted talent for'}</span>
            <br />
            <div className="h-[1.2em] mt-2 flex justify-center items-center">
              <Typewriter lang={lang} />
            </div>
          </h1>
          <p className="text-sm sm:text-lg text-sub max-w-2xl mx-auto">
            {StaticDict[lang]?.hero_sub || 'Connect with verified professionals globally. Powered by smart contracts.'}
          </p>
        </div>
      )}

      {/* Search bar */}
      <div className="max-w-3xl mx-auto">
        <div className="glass-panel border p-2 rounded-2xl flex flex-col sm:flex-row gap-2 shadow-xl hover-lift">
          <div className="flex-1 flex items-center px-4 py-2 border-b sm:border-b-0 sm:border-r border-[var(--border-line)]">
            <i data-lucide="search" className="w-5 h-5 text-sub mr-3" />
            <input
              type="text"
              className="w-full bg-transparent border-none outline-none text-prime placeholder-[var(--text-muted)]"
              placeholder="Search skills, posts, or news..."
            />
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="nav-scroll flex justify-start gap-4 pb-2 border-b border-[var(--border-line)]">
        {[
          { key: 'gigs',      icon: 'briefcase',  label: 'Gigs' },
          { key: 'community', icon: 'users',       label: 'Community' },
          { key: 'traders',   icon: 'trending-up', label: 'Traders' },
          { key: 'news',      icon: 'newspaper',   label: 'News' }
        ].map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => onSwitchView(key)}
            className={`nav-link flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-sub ${currentView === key ? 'active' : ''}`}
          >
            <i data-lucide={icon} className="w-5 h-5" /> {label}
          </button>
        ))}
      </div>

      {/* Feed section */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <span className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: 'var(--primary-glow)', boxShadow: '0 0 10px var(--primary-glow)' }} />
            <h2 className="text-xl font-bold text-prime">{VIEW_TITLES[currentView]}</h2>
          </div>
          {currentView === 'news' && (
            <button
              onClick={() => onOpenModal('modal-add-news')}
              className="px-3 py-1.5 rounded-xl text-white text-xs font-bold hover-lift shadow-md flex items-center gap-1"
              style={{ background: 'var(--primary-glow)' }}
            >
              <i data-lucide="plus" className="w-3.5 h-3.5" /> Add News Source
            </button>
          )}
        </div>

        {/* Quick post composer */}
        {(currentView === 'community' || currentView === 'traders') && (
          <RetroBlock
            viewType={currentView}
            userAvatar={user?.avatar || 'U'}
            onSubmit={(title, desc) => handleQuickPost(title, desc, currentView)}
          />
        )}

        {/* Feed grid */}
        {loading ? (
          <div className="text-center py-10">
            <span className="animate-pulse text-sub">Loading...</span>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-[var(--border-line)] rounded-3xl">
            <p className="text-sm text-sub">No data found.</p>
          </div>
        ) : currentView === 'gigs' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentItems.map(item => (
              <BentoBlock
                key={item.id}
                item={{ ...item, title: getTitle(item), desc: getDesc(item) }}
                onOpen={() => onOpenDetail(item, currentView)}
                onReport={onReport}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col space-y-6 max-w-3xl mx-auto w-full">
            {currentItems.map(item => (
              <EditorialBlock
                key={item.id}
                item={{ ...item, title: getTitle(item), desc: getDesc(item) }}
                viewType={currentView}
                onOpen={() => onOpenDetail(item, currentView)}
                onReport={onReport}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
