import React, { useState, useEffect, createContext } from 'react';
import Header from './components/layout/Header';
import Home from './pages/Home';
import Admin from './pages/Admin'; // <-- นำเข้าฟังก์ชัน Admin
import Modals from './components/layout/Modals';
import ChatWidget from './components/security/ChatWidget';
import { initialData } from './store';

export const AppContext = createContext();

export default function App() {
  const [state, setState] = useState({
    lang: 'en',
    transApi: 'google',
    theme: 'light',
    bg: 'cyber', 
    view: 'gigs', // gigs, community, traders, news, admin <-- เพิ่ม admin route
    user: null,
    activeModal: null,
    isChatOpen: false,
    chatHost: null,
    selectedItem: null,
    data: initialData,
    notifications: []
  });

  useEffect(() => {
    document.body.className = `theme-${state.theme} antialiased overflow-x-hidden transition-colors duration-500`;
  }, [state.theme]);

  const [slideId, setSlideId] = useState(1);
  useEffect(() => {
    if (state.bg !== 'landscape') return;
    const interval = setInterval(() => setSlideId(prev => (prev % 3) + 1), 6000);
    return () => clearInterval(interval);
  }, [state.bg]);

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [state.view, state.data, state.bg]);

  return (
    <AppContext.Provider value={{ state, setState }}>
      {/* Dynamic Backgrounds Render */}
      {state.bg === 'cyber' && <div className="cyber-grid-container"></div>}
      {state.bg === 'galaxy' && <div className="bg-galaxy"></div>}
      {state.bg === '3d-matrix' && <div className="bg-3d-matrix"></div>}
      
      {state.bg === 'landscape' && (
        <div className="fixed inset-0 z-[-2]">
          <div className={`absolute inset-0 bg-cover bg-center animate-[kenburns_20s_ease-in-out_infinite_alternate] transition-opacity duration-[2000ms] ${slideId === 1 ? 'opacity-100' : 'opacity-0'}`} style={{ backgroundImage: "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80')" }}></div>
          <div className={`absolute inset-0 bg-cover bg-center animate-[kenburns_20s_ease-in-out_infinite_alternate] transition-opacity duration-[2000ms] ${slideId === 2 ? 'opacity-100' : 'opacity-0'}`} style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80')" }}></div>
          <div className={`absolute inset-0 bg-cover bg-center animate-[kenburns_20s_ease-in-out_infinite_alternate] transition-opacity duration-[2000ms] ${slideId === 3 ? 'opacity-100' : 'opacity-0'}`} style={{ backgroundImage: "url('https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1920&q=80')" }}></div>
        </div>
      )}

      <div className="cyber-vignette"></div>
      
      {(state.bg === 'cyber' || state.bg === '3d-matrix') && (
        <>
          <div className="fixed top-[20%] left-[10%] w-[30vw] h-[30vw] rounded-full bg-[var(--primary-glow)] opacity-10 blur-[120px] animate-[pulseGlow_3s_ease-in-out_infinite] z-[-1] pointer-events-none"></div>
          <div className="fixed bottom-[10%] right-[10%] w-[25vw] h-[25vw] rounded-full bg-violet-600 opacity-10 blur-[100px] animate-[pulseGlow_3s_ease-in-out_infinite] z-[-1] pointer-events-none" style={{ animationDelay: '1.5s' }}></div>
        </>
      )}

      <div className="relative flex flex-col min-h-screen z-10">
        <Header />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {/* Router จำลอง: สลับหน้า Home กับ Admin */}
          {state.view === 'admin' ? <Admin /> : <Home />}
        </main>
      </div>

      <ChatWidget />
      <Modals />
    </AppContext.Provider>
  );
}
