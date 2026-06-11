import React, { useState, useEffect, createContext } from 'react';
import Header from './components/layout/Header';
import Home from './pages/Home';
import Modals from './components/layout/Modals';
import ChatWidget from './components/security/ChatWidget';
// สมมติว่าดึงข้อมูลตั้งต้นมาจาก store.js
import { initialGigsData, initialCommunityData, initialTradersData, initialNewsData } from './store';

// Global State Context
export const AppContext = createContext();

export default function App() {
  const [state, setState] = useState({
    lang: 'en',
    theme: 'light',
    view: 'gigs',       // gigs, community, traders, news
    user: null,         // null = not logged in
    activeModal: null,  // 'modal-login', 'modal-post', 'modal-gig-detail', etc.
    isChatOpen: false,
    chatHost: null,
    
    // Data stores
    data: {
      gigs: initialGigsData || [],
      community: initialCommunityData || [],
      traders: initialTradersData || [],
      news: initialNewsData || [],
    },
    customNews: []
  });

  // Theme synchronization
  useEffect(() => {
    document.body.className = `theme-${state.theme} antialiased overflow-x-hidden`;
  }, [state.theme]);

  // Handle lucide icons re-render on view change
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [state.view, state.data]);

  return (
    <AppContext.Provider value={{ state, setState }}>
      {/* Background System */}
      <div className="cyber-grid-container"></div>
      <div className="cyber-vignette"></div>
      
      {/* Aurora Effects */}
      <div className="fixed top-[20%] left-[10%] w-[30vw] h-[30vw] rounded-full bg-[var(--primary-glow)] opacity-10 blur-[120px] animate-[pulseGlow_3s_ease-in-out_infinite] z-[-1]"></div>
      <div className="fixed bottom-[10%] right-[10%] w-[25vw] h-[25vw] rounded-full bg-violet-600 opacity-10 blur-[100px] animate-[pulseGlow_3s_ease-in-out_infinite] z-[-1]" style={{ animationDelay: '1.5s' }}></div>

      {/* Main Layout */}
      <div className="relative flex flex-col min-h-screen z-10">
        <Header />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <Home />
        </main>
      </div>

      {/* Floating UI */}
      <ChatWidget />
      <Modals />
    </AppContext.Provider>
  );
}