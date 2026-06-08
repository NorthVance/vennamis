import React from 'react';

export default function RetroBlock({ lang, translations }) {
    const t = translations[lang] || translations['en'];

    return (
        <div className="space-y-6 font-mono">
            <div className="border-l-4 border-emerald-500 pl-4">
                <h3 className="text-xs font-bold tracking-widest text-[var(--text-secondary)] uppercase">Block E: Console Retro-Tech</h3>
                <p className="text-[10px] text-[var(--text-secondary)]">{t.descE}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Retro Card 1 */}
                <div className="bg-black/30 border border-[var(--border-color)] hover:border-emerald-500 rounded-none p-5 transition-all duration-300 flex flex-col justify-between h-[240px] relative overflow-hidden group">
                    <div className="absolute inset-x-0 h-0.5 bg-emerald-500/5 top-0 pointer-events-none animate-scanline"></div>
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/30">SYS_LOC: US_WEST</span>
                            <span className="text-[var(--text-primary)] text-xs font-bold">[ $450.00 ]</span>
                        </div>
                        <h4 className="font-bold text-[var(--text-primary)] group-hover:text-emerald-400 transition text-sm sm:text-base leading-tight">{t.cardE1Title}</h4>
                        <p className="text-xs text-[var(--text-secondary)] mt-2 line-clamp-2 leading-relaxed">{t.cardE1Desc}</p>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-[var(--border-color)]">
                        <span className="text-[10px] text-[var(--text-secondary)] font-sans">AGENT_ID: 902</span>
                        <button className="text-xs font-bold text-emerald-400 hover:underline">{t.runBtn}</button>
                    </div>
                </div>

                {/* Retro Card 2 */}
                <div className="bg-black/30 border border-[var(--border-color)] hover:border-emerald-500 rounded-none p-5 transition-all duration-300 flex flex-col justify-between h-[240px] relative overflow-hidden group">
                    <div className="absolute inset-x-0 h-0.5 bg-emerald-500/5 top-0 pointer-events-none animate-scanline"></div>
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <span class="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/30">SYS_LOC: GLOBAL</span>
                            <span className="text-[var(--text-primary)] text-xs font-bold">[ $75.00/HR ]</span>
                        </div>
                        <h4 class="font-bold text-[var(--text-primary)] group-hover:text-emerald-400 transition text-sm sm:text-base leading-tight">{t.cardE2Title}</h4>
                        <p className="text-xs text-[var(--text-secondary)] mt-2 line-clamp-2 leading-relaxed">{t.cardE2Desc}</p>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-[var(--border-color)]">
                        <span className="text-[10px] text-[var(--text-secondary)] font-sans">AGENT_ID: 104</span>
                        <button className="text-xs font-bold text-emerald-400 hover:underline">{t.runBtn}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}