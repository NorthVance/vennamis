import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import { rotatingWords } from '../assets/glows/store';

// Advanced Custom Hook for Typewriter (Anti-Layout Shift)
const useTypewriter = (wordsArray, speed = 100, pause = 3000) => {
    const [text, setText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);

    useEffect(() => {
        const i = loopNum % wordsArray.length;
        const fullText = wordsArray[i];

        const timer = setTimeout(() => {
            setText(isDeleting ? fullText.substring(0, text.length - 1) : fullText.substring(0, text.length + 1));
            
            if (!isDeleting && text === fullText) {
                setTimeout(() => setIsDeleting(true), pause);
            } else if (isDeleting && text === '') {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
            }
        }, isDeleting ? speed / 2 : speed);

        return () => clearTimeout(timer);
    }, [text, isDeleting, loopNum, wordsArray, speed, pause]);

    return text;
};

export default function Home() {
    const { state, t } = useContext(AppContext);
    const currentWords = rotatingWords[state.lang] || rotatingWords['en'];
    const typedText = useTypewriter(currentWords);

    const currentData = state.data[state.currentView] || [];

    return (
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-16">
            
            {/* HERO SECTION (Only visible on Gigs view) */}
            {state.currentView === 'gigs' && (
                <section className="text-center space-y-6 transition-all duration-500">
                    <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border surface-bg text-[10px] font-bold uppercase tracking-widest text-sub">
                        <span className="text-[var(--primary-glow)]">✦</span>
                        <span>{t.badge_secure}</span>
                    </div>
                    
                    {/* Fixed Layout Shift Typewriter */}
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-tight text-prime">
                        <span>{t.hero_static}</span><br/>
                        <div className="h-[1.2em] mt-2 flex justify-center items-center">
                            <span className="glow-text italic type-cursor">{typedText}</span>
                        </div>
                    </h1>
                    <p className="text-sm sm:text-lg text-sub max-w-2xl mx-auto">{t.hero_sub}</p>

                    <div className="max-w-3xl mx-auto mt-8">
                        <div className="glass-panel border p-2 rounded-2xl flex flex-col sm:flex-row gap-2 shadow-xl hover-lift">
                            <div className="flex-1 flex items-center px-4 py-2 border-b sm:border-b-0 sm:border-r border-[var(--border-line)]">
                                <input type="text" className="w-full bg-transparent border-none outline-none text-prime placeholder-[var(--text-muted)]" placeholder="Search skills, posts, or news..." />
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* DYNAMIC FEED SECTION */}
            <section className={state.currentView === 'gigs' ? "max-w-6xl mx-auto" : "max-w-3xl mx-auto"}>
                <div className="flex items-center space-x-3 mb-8">
                    <span className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: 'var(--primary-glow)', boxShadow: '0 0 10px var(--primary-glow)' }}></span>
                    <h2 className="text-xl font-bold text-prime">{t.title_feed}</h2>
                </div>

                {/* Quick Post Box for Social Feeds */}
                {(state.currentView === 'community' || state.currentView === 'traders') && (
                    <div className="w-full surface-bg border border-[var(--border-line)] rounded-3xl p-6 mb-8 shadow-sm transition-all duration-300">
                        <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-black text-sm shadow-md" style={{ background: 'var(--primary-glow)' }}>U</div>
                            <div className="flex-1 space-y-3">
                                <input type="text" placeholder="Start a discussion..." className="w-full bg-transparent text-prime font-bold text-lg outline-none placeholder-[var(--text-muted)]" />
                                <div className="flex justify-end pt-3 border-t border-[var(--border-line)]">
                                    <button className="px-6 py-2 rounded-xl text-white font-bold text-xs hover-lift shadow-md" style={{ background: 'var(--primary-glow)' }}>Post</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Render Cards or Feed */}
                <div className={state.currentView === 'gigs' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col space-y-6"}>
                    {currentData.map(item => (
                        <div key={item.id} className="surface-bg border glow-border rounded-3xl p-6 hover-lift cursor-pointer flex flex-col justify-between min-h-[200px]">
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-[10px] font-bold uppercase text-sub px-2 py-1 rounded bg-white/5 border border-[var(--border-line)]">{item.tag}</span>
                                    {item.price > 0 && <span className="font-black glow-text">${item.price}</span>}
                                </div>
                                <h3 className="text-lg font-bold text-prime mb-2">{item.title}</h3>
                                <p className="text-xs text-sub line-clamp-2">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}