import React, { useState, useEffect, createContext } from 'react';
import Header from './components/layout/Header';
import Home from './pages/Home';
import Modals from './components/layout/Modals';
import ChatWidget from './components/security/ChatWidget';
import { initialGigsData, initialCommunityData, initialTradersData, initialNewsData } from './store';

export const AppContext = createContext();

export default function App() {
  const [state, setState] = useState({
    lang: 'en',
    theme: 'light',
    bg: 'cyber', // cyber, aurora, landscape
    view: 'gigs',
    user: null,
    activeModal: null,
    isChatOpen: false,
    chatHost: null,
    selectedItem: null,
    data: {
      gigs: initialGigsData || [],
      community: initialCommunityData || [],
      traders: initialTradersData || [],
      news: initialNewsData || [],
    }
  });

  // Theme Sync
  useEffect(() => {
    document.body.className = `theme-${state.theme} antialiased overflow-x-hidden transition-colors duration-500`;
  }, [state.theme]);

  // Slideshow Logic สำหรับ bg-landscape
  const [slideId, setSlideId] = useState(1);
  useEffect(() => {
    if (state.bg !== 'landscape') return;
    const interval = setInterval(() => {
      setSlideId(prev => (prev % 3) + 1);
    }, 6000);
    return () => clearInterval(interval);
  }, [state.bg]);

  // Lucide Icons Sync
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [state.view, state.data, state.bg]);

  return (
    <AppContext.Provider value={{ state, setState }}>
      {/* Background System */}
      {state.bg === 'cyber' && <div className="cyber-grid-container"></div>}
      
      {state.bg === 'landscape' && (
        <div className="fixed inset-0 z-[-2]">
          <div className={`absolute inset-0 bg-cover bg-center animate-[kenburns_20s_ease-in-out_infinite_alternate] transition-opacity duration-[2000ms] ${slideId === 1 ? 'opacity-100' : 'opacity-0'}`} style={{ backgroundImage: "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80')" }}></div>
          <div className={`absolute inset-0 bg-cover bg-center animate-[kenburns_20s_ease-in-out_infinite_alternate] transition-opacity duration-[2000ms] ${slideId === 2 ? 'opacity-100' : 'opacity-0'}`} style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80')" }}></div>
          <div className={`absolute inset-0 bg-cover bg-center animate-[kenburns_20s_ease-in-out_infinite_alternate] transition-opacity duration-[2000ms] ${slideId === 3 ? 'opacity-100' : 'opacity-0'}`} style={{ backgroundImage: "url('https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1920&q=80')" }}></div>
        </div>
      )}

      <div className="cyber-vignette"></div>
      
      {/* Aurora Effects */}
      {(state.bg === 'cyber' || state.bg === 'aurora') && (
        <>
          <div className="fixed top-[20%] left-[10%] w-[30vw] h-[30vw] rounded-full bg-[var(--primary-glow)] opacity-10 blur-[120px] animate-[pulseGlow_3s_ease-in-out_infinite] z-[-1]"></div>
          <div className="fixed bottom-[10%] right-[10%] w-[25vw] h-[25vw] rounded-full bg-violet-600 opacity-10 blur-[100px] animate-[pulseGlow_3s_ease-in-out_infinite] z-[-1]" style={{ animationDelay: '1.5s' }}></div>
        </>
      )}

      {/* Main Layout */}
      <div className="relative flex flex-col min-h-screen z-10">
        <Header />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <Home />
        </main>
      </div>

      <ChatWidget />
      <Modals />
    </AppContext.Provider>
  );
}
