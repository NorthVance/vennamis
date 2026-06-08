import React from 'react';

export default function EditorialBlock({ lang, translations }) {
    const t = translations[lang] || translations['en'];

    return (
        <div className="space-y-6">
            <div className="border-l-4 border-amber-400 pl-4">
                <h3 className="text-xs font-bold tracking-widest text-[var(--text-secondary)] uppercase font-serif">Block F: Editorial Luxury</h3>
                <p className="text-[10px] text-[var(--text-secondary)]">{t.descF}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Editorial Card 1 */}
                <div className="border-[0.5px] border-[var(--border-color)] p-6 hover:shadow-md transition-all duration-500 flex flex-col justify-between h-[240px] bg-[var(--bg-card)] text-[var(--text-primary)]">
                    <div>
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-light uppercase tracking-widest text-[var(--text-secondary)]">{t.cardF1Badge}</span>
                            <span className="text-[var(--text-primary)] text-xs font-medium italic">Estimate $1,200</span>
                        </div>
                        <h4 className="font-serif text-lg leading-tight font-medium text-[var(--text-primary)]">{t.cardF1Title}</h4>
                        <p className="text-xs text-[var(--text-secondary)] mt-2 line-clamp-2 italic leading-relaxed font-serif">{t.cardF1Desc}</p>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-[var(--border-color)]">
                        <span className="text-[9px] text-[var(--text-secondary)] tracking-wider uppercase">Bordeaux, France</span>
                        <button className="text-xs font-light uppercase tracking-widest border-b border-[var(--text-primary)] pb-0.5 hover:text-[var(--text-secondary)] hover:border-slate-300 transition text-[var(--text-primary)]">{t.inquireBtn}</button>
                    </div>
                </div>

                {/* Editorial Card 2 */}
                <div className="border-[0.5px] border-[var(--border-color)] p-6 hover:shadow-md transition-all duration-500 flex flex-col justify-between h-[240px] bg-[var(--bg-card)] text-[var(--text-primary)]">
                    <div>
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-light uppercase tracking-widest text-[var(--text-secondary)]">{t.cardF2Badge}</span>
                            <span className="text-[var(--text-primary)] text-xs font-medium italic">Estimate $800</span>
                        </div>
                        <h4 className="font-serif text-lg leading-tight font-medium text-[var(--text-primary)]">{t.cardF2Title}</h4>
                        <p className="text-xs text-[var(--text-secondary)] mt-2 line-clamp-2 italic leading-relaxed font-serif">{t.cardF2Desc}</p>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-[var(--border-color)]">
                        <span className="text-[9px] text-[var(--text-secondary)] tracking-wider uppercase">Kyoto, Japan</span>
                        <button className="text-xs font-light uppercase tracking-widest border-b border-[var(--text-primary)] pb-0.5 hover:text-[var(--text-secondary)] hover:border-slate-300 transition text-[var(--text-primary)]">{t.inquireBtn}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}