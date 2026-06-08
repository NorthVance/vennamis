import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function BentoBlock({ lang, translations }) {
    const t = translations[lang] || translations['en'];

    return (
        <div className="space-y-6">
            <div className="border-l-4 border-violet-500 pl-4">
                <h3 className="text-xs font-bold tracking-widest text-[var(--text-secondary)] uppercase">Block D: Bento-Box Spatial</h3>
                <p className="text-[10px] text-[var(--text-secondary)]">{t.descD}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Bento Card 1 (Large - 2 cols) */}
                <div className="md:col-span-2 bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/40 hover:scale-[1.01] rounded-3xl p-8 transition-all duration-500 flex flex-col justify-between h-[300px] shadow-lg">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-bold text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full uppercase tracking-wider">{t.cardD1Badge}</span>
                            <span className="text-[var(--text-primary)] font-bold text-lg font-sans">$2,500 - $3,200</span>
                        </div>
                        <h4 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] leading-tight">{t.cardD1Title}</h4>
                        <p className="text-xs text-[var(--text-secondary)] mt-2 max-w-lg leading-relaxed">{t.cardD1Desc}</p>
                    </div>
                    <div class="flex justify-between items-center pt-4 border-t border-[var(--border-color)]">
                        <div className="flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-xs text-[var(--text-secondary)]">{t.cardD1Status}</span>
                        </div>
                        <button className="bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold px-4 py-2 rounded-xl transition">{t.applyBtn}</button>
                    </div>
                </div>

                {/* Bento Card 2 (Small - 1 col) */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/40 hover:scale-[1.01] rounded-3xl p-6 transition-all duration-500 flex flex-col justify-between h-[300px] shadow-lg group">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] font-bold text-[var(--text-secondary)] bg-slate-800/10 px-2 py-1 rounded-lg border border-[var(--border-color)] uppercase">{t.cardD2Badge}</span>
                            <span className="text-emerald-500 text-sm font-bold font-mono">$150.00</span>
                        </div>
                        <h4 className="text-base font-bold text-[var(--text-primary)] leading-snug">{t.cardD2Title}</h4>
                        <p className="text-xs text-[var(--text-secondary)] mt-2 line-clamp-3">{t.cardD2Desc}</p>
                    </div>
                    <div className="pt-4 border-t border-[var(--border-color)] flex justify-between items-center">
                        <span className="text-[10px] text-[var(--text-secondary)]">{t.cardPostTime}</span>
                        <ArrowUpRight size={16} className="text-[var(--text-secondary)] group-hover:text-[var(--accent-color)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                </div>
            </div>
        </div>
    );
}