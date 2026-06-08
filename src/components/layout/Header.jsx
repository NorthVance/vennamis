import React from 'react';
import { MessageSquare, Settings, Bell } from 'lucide-react';

export default function Header({ 
    lang, 
    translations, 
    onToggleChat, 
    onToggleSettings, 
    onToggleProfile 
}) {
    const t = translations[lang] || translations['en'];

    return (
        <header className="border-b border-[var(--border-color)] bg-[var(--bg-viewport)]/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex justify-between items-center transition-colors duration-300">
            <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-tr from-violet-600 to-rose-500 rounded-lg flex items-center justify-center text-white font-bold text-base shadow-md">T</div>
                <span className="font-bold text-lg tracking-tight text-[var(--text-primary)]">TrustedGigs</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold tracking-wider uppercase">
                <a href="#" className="hover:text-[var(--text-primary)] transition text-[var(--accent-color)]">{t.navExplore}</a>
                <a href="#" className="hover:text-[var(--text-primary)] text-[var(--text-secondary)] transition">{t.navStyles}</a>
                <a href="#" className="hover:text-[var(--text-primary)] text-[var(--text-secondary)] transition">{t.navSafety}</a>
            </nav>

            <div className="flex items-center space-x-3">
                <button onClick={onToggleChat} className="p-2 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition hover:bg-slate-800/10">
                    <MessageSquare size={18} />
                </button>
                <button onClick={onToggleSettings} className="p-2 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition hover:bg-slate-800/10">
                    <Settings size={18} />
                </button>
                <button onClick={onToggleProfile} className="flex items-center space-x-2 p-1.5 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition hover:bg-slate-800/10">
                    <div className="w-7 h-7 bg-gradient-to-tr from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">JD</div>
                    <span className="text-xs font-bold hidden sm:inline text-[var(--text-primary)]">Jane D.</span>
                </button>
            </div>
        </header>
    );
}