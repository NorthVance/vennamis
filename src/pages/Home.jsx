import React, { useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { AppContext } from '../App';
import { Search, MapPin, Sparkles, ArrowRight, ShieldCheck, Filter } from 'lucide-react';
import { rotatingWords } from '../assets/glows/store';

const useTypewriter = (wordsArray, speed = 80, pause = 3000) => {
    const [text, setText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);

    useEffect(() => {
        if (!wordsArray || wordsArray.length === 0) return;
        const i = loopNum % wordsArray.length;
        const fullText = wordsArray[i];

        const timer = setTimeout(() => {
            setText(isDeleting ? fullText.substring(0, text.length - 1) : fullText.substring(0, text.length + 1));
            if (!isDeleting && text === fullText) {
                setTimeout(() => setIsDeleting(true), pause);
            } else if (isDeleting && text === '') {
                setIsDeleting(false);
                setLoopNum(prev => prev + 1);
            }
        }, isDeleting ? speed / 2 : speed);

        return () => clearTimeout(timer);
    }, [text, isDeleting, loopNum, wordsArray, speed, pause]);

    return text;
};

export default function Home() {
    const { state, setState, t } = useContext(AppContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true); 

    const currentWords = rotatingWords[state.lang] || rotatingWords['en'];
    const typedText = useTypewriter(currentWords);

    useEffect(() => {
        setIsLoading(true);
        const latencyTimer = setTimeout(() => { setIsLoading(false); }, 800); 
        return () => clearTimeout(latencyTimer);
    }, [state.view, state.lang]);

    const filteredData = useMemo(() => {
        const rawData = state.gigsData || [];
        return rawData.filter(item => {
            const titleStr = (item.title || '').toLowerCase();
            const descStr = (item.desc || '').toLowerCase();
            const q = searchQuery.toLowerCase();
            const matchesSearch = titleStr.includes(q) || descStr.includes(q);
            const matchesCat = categoryFilter === 'all' || item.tag.toLowerCase().includes(categoryFilter.toLowerCase());
            return matchesSearch && matchesCat;
        });
    }, [state.gigsData, state.view, searchQuery, categoryFilter]);

    const handleActionClick = useCallback((id, host) => {
        if (!state.user) {
            setState(prev => ({ ...prev, activeModal: 'login' }));
        } else {
            setState(prev => ({ ...prev, isChatOpen: true, chatHost: host }));
        }
    }, [state.user, setState]);

    return (
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12 sm:space-y-16">
            {state.view === 'gigs' && (
                <section className="text-center space-y-6 transition-all duration-500 animate-[fadeIn_0.5s_ease-out]">
                    <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border surface-bg text-[10px] font-bold uppercase tracking-widest text-sub shadow-sm">
                        <Sparkles size={14} style={{ color: 'var(--primary-glow)' }} />
                        <span>{t.badge_secure}</span>
                    </div>
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-tight text-prime">
                        <span>{t.hero_static}</span><br/>
                        <div className="h-[1.2em] mt-2 flex justify-center items-center">
                            <span className="glow-text italic type-cursor">{typedText}</span>
                        </div>
                    </h1>
                    <p className="text-sm sm:text-lg text-sub max-w-2xl mx-auto leading-relaxed px-4">{t.hero_sub}</p>

                    <div className="max-w-3xl mx-auto mt-8 px-2 sm:px-0">
                        <div className="glass-panel border border-[var(--border-line)] p-2 rounded-2xl sm:rounded-[2rem] shadow-xl flex flex-col sm:flex-row gap-2 hover-lift transition-all">
                            <div className="flex-1 flex items-center px-4 py-3 border-b sm:border-b-0 sm:border-r border-[var(--border-line)]">
                                <Search size={20} className="text-sub mr-3 flex-shrink-0" />
                                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-transparent border-none outline-none text-prime placeholder-[var(--text-muted)] text-sm sm:text-base" placeholder={state.lang === 'en' ? "Search for skills, languages, or tasks..." : "ค้นหาทักษะ, งาน, หรือภาษา..."} />
                            </div>
                            <div className="w-full sm:w-56 flex items-center px-4 py-3">
                                <Filter size={18} className="text-sub mr-3 flex-shrink-0" />
                                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full bg-transparent border-none outline-none text-sub text-sm font-bold cursor-pointer appearance-none">
                                    <option value="all">All Categories</option><option value="tech">Technology</option><option value="design">Design</option><option value="writing">Translation</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <section className={state.view === 'gigs' ? "max-w-6xl mx-auto" : "max-w-3xl mx-auto"}>
                <div className="flex items-center justify-between mb-8 px-2">
                    <div className="flex items-center space-x-3">
                        <span className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: 'var(--primary-glow)', boxShadow: '0 0 10px var(--primary-glow)' }}></span>
                        <h2 className="text-xl sm:text-2xl font-black text-prime tracking-tight">{t.title_feed}</h2>
                    </div>
                    {state.view === 'gigs' && (
                        <span className="text-xs font-bold text-sub hidden sm:block"><ShieldCheck size={14} className="inline mr-1 text-amber-500"/> Scammer Protected</span>
                    )}
                </div>

                {isLoading ? (
                    <div className={state.view === 'gigs' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col space-y-6"}>
                        {[1, 2, 3, 4, 5, 6].map(n => (
                            <div key={n} className="surface-bg border border-[var(--border-line)] rounded-3xl p-6 h-[240px] animate-pulse flex flex-col justify-between">
                                <div><div className="flex justify-between mb-4"><div className="w-20 h-6 bg-slate-700/30 rounded-full"></div><div className="w-16 h-6 bg-slate-700/30 rounded-lg"></div></div><div class="w-3/4 h-6 bg-slate-700/30 rounded-lg mb-3"></div><div class="w-full h-4 bg-slate-700/30 rounded-lg mb-2"></div><div class="w-5/6 h-4 bg-slate-700/30 rounded-lg"></div></div>
                                <div className="flex justify-between items-center pt-4 border-t border-[var(--border-line)]"><div className="w-24 h-5 bg-slate-700/30 rounded-lg"></div><div className="w-20 h-5 bg-slate-700/30 rounded-lg"></div></div>
                            </div>
                        ))}
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="col-span-full text-center py-20 border border-dashed border-[var(--border-line)] rounded-3xl surface-bg">
                        <div className="inline-flex p-4 rounded-full bg-slate-800/50 mb-4 text-sub"><Search size={32} /></div>
                        <h3 className="text-lg font-bold text-prime mb-1">No Gigs Found</h3>
                        <p className="text-sm text-sub">Try adjusting your search or filter settings.</p>
                    </div>
                ) : (
                    <div className={state.view === 'gigs' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col space-y-6"}>
                        {filteredData.map(item => (
                            <div key={item.id} onClick={() => handleActionClick(item.id, item.host)} className="surface-bg border glow-border rounded-3xl p-6 hover-lift cursor-pointer flex flex-col justify-between min-h-[240px] relative group shadow-lg">
                                <div className="absolute -top-3 -right-2 bg-amber-500 text-[#05070A] text-[9px] font-black px-3 py-1 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)] flex items-center transform rotate-3 group-hover:rotate-6 transition-transform">
                                    <ShieldCheck size={10} className="mr-1" /> Escrow Locked
                                </div>
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-[10px] font-bold uppercase text-sub px-2.5 py-1 rounded bg-white/5 border border-[var(--border-line)]">{item.tag}</span>
                                        {item.price > 0 && <span className="font-black text-lg glow-text">${item.price.toFixed(2)}</span>}
                                    </div>
                                    <h3 className="text-lg font-bold text-prime mb-2 line-clamp-2 group-hover:text-[var(--primary-glow)] transition-colors">{item.title}</h3>
                                    <p className="text-xs text-sub line-clamp-2 leading-relaxed">{item.desc}</p>
                                </div>
                                <div className="flex justify-between items-center border-t border-[var(--border-line)] pt-4 mt-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white shadow-inner">{item.host[0]}</div>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold text-prime leading-none">{item.host}</span>
                                            <span className="text-[9px] text-[var(--primary-glow)] flex items-center mt-0.5"><ShieldCheck size={8} className="mr-0.5"/> Verified</span>
                                        </div>
                                    </div>
                                    <button className="text-[11px] font-black text-[var(--primary-glow)] flex items-center bg-[var(--primary-glow)]/10 px-3 py-1.5 rounded-lg group-hover:bg-[var(--primary-glow)] group-hover:text-white transition-all">
                                        {t.applyBtn || 'Apply'} <ArrowRight size={12} className="ml-1 transition-transform group-hover:translate-x-1" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}