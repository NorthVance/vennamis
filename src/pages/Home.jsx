import React, { useContext } from 'react';
import { AppContext } from '../App';
import { staticDict } from '../store';
import Typewriter from '../components/common/Typewriter';

export default function Home() {
  const { state, setState } = useContext(AppContext);
  const t = staticDict[state.lang] || staticDict['en'];

  const viewData = state.data[state.view] || [];

  return (
    <div className="space-y-10">
      
      {/* Hero Section */}
      {state.view === 'gigs' && (
        <div className="text-center space-y-6 transition-all duration-500">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border surface-bg text-[10px] font-bold uppercase tracking-widest text-sub">
            <i data-lucide="globe-2" className="w-3.5 h-3.5" style={{ color: 'var(--primary-glow)' }}></i><span>{t.badge_secure}</span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-tight text-prime">
            <span>{t.hero_static}</span><br/>
            <div className="h-[1.2em] mt-2 flex justify-center items-center">
              <Typewriter />
            </div>
          </h1>
          <p className="text-sm sm:text-lg text-sub max-w-2xl mx-auto">{t.hero_sub}</p>
        </div>
      )}

      {/* ช่องค้นหา - โชว์ทุกหน้า */}
      <div className="max-w-3xl mx-auto">
        <div className="glass-panel border p-2 rounded-2xl flex flex-col sm:flex-row gap-2 shadow-xl hover-lift">
          <div className="flex-1 flex items-center px-4 py-2">
            <i data-lucide="search" className="w-5 h-5 text-sub mr-3"></i>
            <input type="text" className="w-full bg-transparent border-none outline-none text-prime placeholder-[var(--text-muted)]" placeholder="Search skills, posts, or news..." />
          </div>
        </div>
      </div>

      {/* Tab เมนูเปลี่ยนหน้า */}
      <div className="nav-scroll flex justify-start gap-4 pb-2 border-b border-[var(--border-line)] overflow-x-auto">
        {['gigs', 'community', 'traders', 'news'].map((nav) => (
          <button 
            key={nav} onClick={() => setState(prev => ({ ...prev, view: nav }))}
            className={`relative transition-colors duration-300 whitespace-nowrap flex items-center gap-1 text-xs font-bold uppercase tracking-widest pb-1 ${state.view === nav ? 'text-[var(--primary-glow)]' : 'text-sub hover:text-prime'}`}
          >
            {nav === 'gigs' && <i data-lucide="briefcase" className="w-5 h-5"></i>}
            {nav === 'community' && <i data-lucide="users" className="w-5 h-5"></i>}
            {nav === 'traders' && <i data-lucide="trending-up" className="w-5 h-5"></i>}
            {nav === 'news' && <i data-lucide="newspaper" className="w-5 h-5"></i>}
            <span className="ml-1">{nav}</span>
            {state.view === nav && <span className="absolute bottom-[-4px] left-0 w-full h-[2px] bg-[var(--primary-glow)] rounded-full"></span>}
          </button>
        ))}
      </div>

      {/* ส่วนแสดงข้อมูล Grid */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <span className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: 'var(--primary-glow)', boxShadow: '0 0 10px var(--primary-glow)' }}></span>
            <h2 className="text-xl font-bold text-prime uppercase tracking-wider">{state.view} Stream</h2>
          </div>
          {state.view === 'news' && (
            <button onClick={() => setState(prev => ({ ...prev, activeModal: 'modal-add-news' }))} className="px-3 py-1.5 rounded-xl text-white text-xs font-bold hover-lift shadow-md flex items-center gap-1" style={{ background: 'var(--primary-glow)' }}>
              <i data-lucide="plus" className="w-3.5 h-3.5"></i> Add News
            </button>
          )}
        </div>

        {/* Quick Post สำหรับโซเชียลกับเทรดเดอร์ */}
        {(state.view === 'community' || state.view === 'traders') && (
          <div className="w-full max-w-3xl mx-auto surface-bg border border-[var(--border-line)] rounded-3xl p-6 mb-8 shadow-sm">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-black text-sm shadow-md" style={{ background: 'var(--primary-glow)' }}>{state.user ? state.user.avatar : 'U'}</div>
              <div className="flex-1 space-y-3">
                <input type="text" placeholder={state.view === 'traders' ? 'Share a trade signal...' : 'Start a discussion...'} className="w-full bg-transparent text-prime font-bold text-lg outline-none placeholder-[var(--text-muted)]" />
                <textarea rows="2" placeholder="What are your thoughts?" className="w-full bg-transparent text-sm text-prime outline-none resize-none placeholder-[var(--text-muted)]"></textarea>
                <div className="flex justify-between items-center pt-3 border-t border-[var(--border-line)]">
                  <div className="flex space-x-2 text-sub">
                    <button className="p-2 hover:text-[var(--primary-glow)] transition rounded-lg hover:bg-white/5"><i data-lucide="image" className="w-4 h-4"></i></button>
                  </div>
                  <button onClick={() => !state.user && setState(prev => ({ ...prev, activeModal: 'modal-login' }))} className="px-6 py-2 rounded-xl text-white font-bold text-xs hover-lift shadow-md" style={{ background: 'var(--primary-glow)' }}>Post</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* เรนเดอร์การ์ดข้อมูล */}
        {viewData.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-[var(--border-line)] rounded-3xl"><p className="text-sm text-sub">No data found.</p></div>
        ) : (
          <div className={`grid gap-6 ${state.view === 'gigs' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 max-w-3xl mx-auto'}`}>
            {viewData.map(item => (
              <div key={item.id} onClick={() => setState(prev => ({ ...prev, activeModal: 'modal-gig-detail', selectedItem: item }))} className="surface-bg border glow-border rounded-3xl p-6 hover-lift cursor-pointer flex flex-col justify-between relative">
                <button onClick={(e) => { e.stopPropagation(); alert('Reported!'); }} className="absolute top-4 right-4 text-sub hover:text-red-500 transition p-1" title="Report Post"><i data-lucide="flag" className="w-3.5 h-3.5"></i></button>
                <div>
                  <div className="flex justify-between items-start mb-3 pr-6">
                    <span className="text-[10px] font-bold uppercase text-sub px-2 py-1 rounded bg-white/5 border border-[var(--border-line)]">{item.loc || item.tag || item.source}</span>
                    {item.price > 0 && <span className="font-black glow-text">${item.price}</span>}
                  </div>
                  <h3 className="text-lg font-bold text-prime mb-2 line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-sub line-clamp-2 md:line-clamp-none mb-4">{item.desc}</p>
                </div>
                <div className="flex justify-between items-center border-t border-[var(--border-line)] pt-4 mt-auto">
                  <span className="text-xs text-sub font-mono flex items-center">
                    <div className="w-4 h-4 rounded-full bg-gray-600 mr-2 flex items-center justify-center text-[8px] text-white">{item.host[0]}</div> {item.host}
                  </span>
                  {state.view === 'gigs' && <span className="text-[10px] font-bold text-[var(--primary-glow)] flex items-center">Apply <i data-lucide="arrow-right" className="w-3 h-3 ml-1"></i></span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
