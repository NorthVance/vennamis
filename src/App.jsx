import React, { useState, useEffect, createContext } from 'react';
import Header from './components/layout/Header';
import Home from './pages/Home';
import { initialGigsData, initialCommunityData, initialTradersData, initialNewsData, sysTranslations } from './assets/glows/store';
import { icons } from 'lucide-react';

// Complex State Context for Deep Component Tree
export const AppContext = createContext();

export default function App() {
    const [state, setState] = useState({
        lang: 'en',
        theme: 'light',
        user: null,
        currentView: 'gigs',
        data: { gigs: initialGigsData, community: initialCommunityData, traders: initialTradersData, news: initialNewsData }
    });

    // Obfuscated Theme Injector
    useEffect(() => {
        document.body.className = `theme-${state.theme}`;
    }, [state.theme]);

    const dispatch = (action, payload) => {
        setState(prev => ({ ...prev, [action]: payload }));
    };

    return (
        <AppContext.Provider value={{ state, dispatch, t: sysTranslations[state.lang] }}>
            {/* Cyber Background Engine */}
            <div className="cyber-grid-container"></div>
            <div className="cyber-vignette"></div>
            <div className="fixed top-[20%] left-[10%] w-[30vw] h-[30vw] rounded-full bg-[var(--primary-glow)] opacity-10 blur-[120px] z-[-1]"></div>
            
            <div className="relative flex flex-col min-h-screen z-10">
                <Header />
                <Home />
            </div>
        </AppContext.Provider>
    );
}