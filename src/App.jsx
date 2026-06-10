import React, { useState, useEffect, createContext } from 'react';
import Header from './components/layout/Header';
import Home from './pages/Home';
import Modals from './components/layout/Modals';
import ChatWidget from './components/security/ChatWidget';
import './styles/theme.css';
import { initialGigsData, sysTranslations } from './assets/glows/store';

export const AppContext = createContext();

export default function App() {
    const [state, setState] = useState({
        lang: 'en',
        theme: 'light', 
        view: 'gigs',
        user: null,
        activeModal: null, 
        isChatOpen: false,
        chatHost: null,
        gigsData: initialGigsData
    });

    useEffect(() => {
        document.body.className = `theme-${state.theme} antialiased overflow-x-hidden`;
    }, [state.theme]);

    const t = sysTranslations[state.lang];

    return (
        <AppContext.Provider value={{ state, setState, t }}>
            <div className="cyber-grid-container"></div>
            <div className="cyber-vignette"></div>
            <div className="fixed top-[20%] left-[10%] w-[30vw] h-[30vw] rounded-full bg-[var(--primary-glow)] opacity-10 blur-[120px] animate-[pulseGlow_3s_ease-in-out_infinite] z-[-1]"></div>
            <div className="fixed bottom-[10%] right-[10%] w-[25vw] h-[25vw] rounded-full bg-violet-600 opacity-10 blur-[100px] animate-[pulseGlow_3s_ease-in-out_infinite] z-[-1]" style={{animationDelay: '1.5s'}}></div>

            <div className="relative flex flex-col min-h-screen z-10">
                <Header />
                <Home />
                <Modals />
                <ChatWidget />
            </div>
        </AppContext.Provider>
    );
}