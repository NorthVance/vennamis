import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/layout/Header.jsx';
import ChatWidget from '../components/security/ChatWidget.jsx';
import ErrorBoundary from '../components/common/ErrorBoundary.jsx';
import { translations } from '../localization.js';
import { gigsData as initialGigsData } from '../gigsData.js';
import { Monitor, Smartphone, Sun, Moon, Sparkles, Search, MapPin, ArrowUpRight, Bell, Settings, X, Send, ShieldCheck, PlusCircle } from 'lucide-react';

export default function Home() {
    const [device, setDevice] = useState('pc'); 
    const [theme, setTheme] = useState('dark'); 
    const [lang, setLang] = useState('en'); 
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [gigs, setGigs] = useState(initialGigsData);
    
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isApplyOpen, setIsApplyOpen] = useState(false);
    const [isPostOpen, setIsPostOpen] = useState(false);
    const [isSafetyOpen, setIsSafetyOpen] = useState(false);
    const [isStylesOpen, setIsStylesOpen] = useState(false);

    // Dynamic Text Rotator States
    const [wordIndex, setWordIndex] = useState(0);
    const [wordFadeClass, setWordFadeClass] = useState('opacity-100 translate-y-0');

    // Slideshow Active Index
    const [activeSlide, setActiveSlide] = useState(0);

    // Active login sessions
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [activeTranslationEngine, setActiveTranslationEngine] = useState('deepl');

    const [notifications, setNotifications] = useState([
        { id: 1, text: { en: "Welcome to AuraTalent! Verify your account in profile.", th: "ยินดีต้อนรับสู่ AuraTalent! กรุณาตรวจสอบข้อมูลบัญชีในแถบโปรไฟล์" }, time: { en: "1h ago", th: "1 ชม. ที่แล้ว" }, read: false }
    ]);

    const t = translations[lang] || translations['en'];

    // 10 High-Contrast dynamic keywords (Vol 5 hybrid)
    const rotatingWords = {
        en: ["global work.", "independent talent.", "local helpers.", "student tutors.", "creative designers.", "trusted assistants.", "flexible gigs.", "secured escrow.", "verified help.", "safe payments."],
        th: ["งานสากลทั่วโลก", "ฟรีแลนซ์ฝีมือดี", "ผู้ช่วยที่ไว้ใจได้ใกล้บ้าน", "นักศึกษาติวเตอร์", "นักออกแบบสร้างสรรค์", "ผู้ช่วยส่วนตัวที่ไว้ใจได้", "งานอิสระที่ยืดหยุ่น", "ระบบมัดจำเงินที่ปลอดภัย", "ผู้ช่วยที่ผ่านการยืนยัน", "ระบบการเงินที่รัดกุม"]
    };

    const bgImages = [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80",
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80",
        "https://images.unsplash.com/photo-1517502884422-41eaaced0168?auto=format&fit=crop&w=1920&q=80"
    ];

    // React Dynamic Word Rotation effect loop (Smooth CSS Transition)
    useEffect(() => {
        const interval = setInterval(() => {
            setWordFadeClass('opacity-0 -translate-y-2');
            setTimeout(() => {
                setWordIndex((prevIndex) => (prevIndex + 1) % rotatingWords[lang].length);
                setWordFadeClass('opacity-100 translate-y-0');
            }, 500);
        }, 3000);
        return () => clearInterval(interval);
    }, [lang]);

    // React Background Slideshow effect loop
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % bgImages.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    // Filter Gigs Search logic
    const filteredGigs = gigs.filter(gig => {
        const titleText = (gig.title[lang] || gig.title['en']).toLowerCase();
        const descText = (gig.desc[lang] || gig.desc['en']).toLowerCase();
        const query = searchQuery.toLowerCase();
        
        const matchesSearch = titleText.includes(query) || descText.includes(query);
        const matchesCategory = filterCategory === 'all' || gig.category === filterCategory;
        
        return matchesSearch && matchesCategory;
    });

    const pushNotification = (enText, thText) => {
        const newNotif = {
            id: Date.now(),
            text: { en: enText, th: thText },
            time: { en: "Just now", th: "เมื่อสักครู่" },
            read: false
        };
        setNotifications(prev => [...prev, newNotif]);
    };

    return (
        <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased font-sans relative">
            
            {/* SIMULATOR PREVIEW CONTROLLER */}
            <div className="bg-[#0D0F17] border-b border-slate-800 p-4 sticky top-0 z-50 flex flex-wrap justify-between items-center gap-4 shadow-xl">
                <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-violet-500 rounded-full animate-ping"></span>
                    <span className="text-xs font-bold tracking-widest text-slate-400">AURATALENT WORKSPACE PREVIEW</span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-slate-950 p-1 rounded-xl flex border border-slate-800 text-xs">
                        <button onClick={() => setDevice('pc')} className={`px-3 py-1.5 rounded-lg flex items-center space-x-1 transition ${device === 'pc' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>
                            <Monitor size={14} /> <span>PC View</span>
                        </button>
                        <button onClick={() => setDevice('mobile')} className={`px-3 py-1.5 rounded-lg flex items-center space-x-1 transition ${device === 'mobile' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>
                            <Smartphone size={14} /> <span>Phone View</span>
                        </button>
                    </div>

                    <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none">
                        <option value="en">English (US/EU)</option>
                        <option value="th">ภาษาไทย (TH)</option>
                    </select>

                    <div className="bg-slate-950 p-1 rounded-xl flex border border-slate-800">
                        <button onClick={() => setTheme('light')} className={`p-1.5 rounded-lg transition ${theme === 'light' ? 'text-amber-500 bg-slate-800' : 'text-slate-400 hover:text-white'}`}>
                            <Sun size={16} />
                        </button>
                        <button onClick={() => setTheme('dark')} className={`p-1.5 rounded-lg transition ${theme === 'dark' ? 'text-violet-400 bg-slate-800' : 'text-slate-400 hover:text-white'}`}>
                            <Moon size={16} />
                        </button>
                        <button onClick={() => setTheme('luxury')} className={`p-1.5 rounded-lg transition ${theme === 'luxury' ? 'text-yellow-500 bg-slate-800' : 'text-slate-400 hover:text-white'}`}>
                            <Sparkles size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* DYNAMIC BACKDROP SLIDESHOW (Smooth fading in React) */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div id="bg-mask" className="absolute inset-0 z-10 transition-all duration-1000" style={{
                    backgroundColor: theme === 'light' ? "rgba(250, 249, 246, 0.88)" : theme === 'luxury' ? "rgba(14, 12, 10, 0.88)" : "rgba(9, 11, 17, 0.82)"
                }}></div>
                
                {bgImages.map((src, i) => (
                    <div 
                        key={src}
                        className="slide-image absolute inset-0 bg-cover bg-center scale-105"
                        style={{
                            backgroundImage: `url(${src})`,
                            opacity: activeSlide === i ? 1 : 0
                        }}
                    />
                ))}
            </div>

            {/* VIRTUAL WORKSPACE */}
            <div 
                id="device-viewport" 
                className={`device-frame w-full rounded-3xl shadow-2xl relative z-10 flex flex-col min-h-[85vh] overflow-hidden smooth-transition border border-theme ${
                    device === 'mobile' ? 'max-w-[420px] h-[880px] border-[12px] border-slate-800 rounded-[48px] theme-mobile-active' : 'max-w-7xl mx-auto my-8'
                } ${theme === 'light' ? 'theme-light' : theme === 'luxury' ? 'theme-luxury' : ''}`}
            >
                <Header 
                    lang={lang} 
                    translations={translations}
                    onToggleChat={() => setIsChatOpen(!isChatOpen)}
                    onToggleSettings={() => setIsSettingsOpen(!isSettingsOpen)}
                    onToggleProfile={() => setIsProfileOpen(!isProfileOpen)}
                />

                <main className="flex-1 overflow-y-auto pb-16">
                    {/* HERO SECTION */}
                    <section className="py-16 px-6 max-w-5xl mx-auto text-center space-y-6">
                        <span className="inline-flex items-center space-x-1.5 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full text-xs font-semibold accent-text-theme">
                            <span>{t.badgeText}</span>
                        </span>
                        
                        {/* Title with sliding-fade React loop */}
                        <h1 id="hero-title" className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight flex flex-col md:block items-center justify-center">
                            <span id="hero-title-static" className="text-primary-theme">{t.heroTitleStatic}</span>
                            <span id="rotate-word" className={`accent-text-theme italic inline-block transition-all duration-500 transform word-fade ${wordFadeClass}`}>
                                {rotatingWords[lang][wordIndex]}
                            </span>
                        </h1>

                        <p className="text-sm sm:text-base text-secondary-theme max-w-xl mx-auto leading-relaxed">
                            {t.heroSubtitle}
                        </p>
                    </section>

                    {/* GIG GRID CARD VIEW */}
                    <section className="max-w-6xl mx-auto px-6 space-y-12">
                        {/* Dynamic Gig cards rendering */}
                        <ErrorBoundary>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="gigs-grid">
                                {filteredGigs.map(gig => (
                                    <div key={gig.id} className="card-bg-theme border border-theme hover:border-[var(--accent-color)]/40 hover:scale-[1.01] rounded-3xl p-6 transition-all duration-500 flex flex-col justify-between h-[260px] shadow-lg group">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-[10px] font-bold text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-full uppercase">{gig.badge ? gig.badge[lang] : (gig.tags[lang] || gig.tags['en'])}</span>
                                                <span className="text-primary-theme font-bold text-sm">${gig.price.toFixed(2)}</span>
                                            </div>
                                            <h4 className="text-base font-bold text-primary-theme group-hover:accent-text-theme transition leading-snug">{gig.title[lang] || gig.title['en']}</h4>
                                            <p className="text-xs text-secondary-theme mt-2 line-clamp-2 leading-relaxed">{gig.desc[lang] || gig.desc['en']}</p>
                                        </div>
                                        <div className="pt-4 border-t border-theme flex justify-between items-center">
                                            <span className="text-[10px] text-secondary-theme">{gig.location[lang] || gig.location['en']}</span>
                                            <button onClick={() => alert("Simulating proposal submit...")} className="text-xs font-bold text-secondary-theme group-hover:accent-text-theme flex items-center transition">
                                                <span>Apply</span>
                                                <ArrowUpRight size={14} className="ml-1" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ErrorBoundary>
                    </section>
                </main>

                <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
            </div>
        </div>
    );
}