import React, { useState, useEffect, createContext } from 'react';
import Header from './components/layout/Header';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Workspace from './pages/Workspace';
import Modals from './components/layout/Modals';
import ChatWidget from './components/security/ChatWidget';
import Toast from './components/common/Toast';
import { initialData } from './store';
import { supabase, AuthService } from './services/db';

export default function App() {
  
  // SEC: Cache Override v3 (Force Liquid Glass Default)
  const [state, setState] = useState(() => {
    const fallback = { lang: 'en', transApi: 'google', theme: 'light', bg: 'liquid-glass', view: 'gigs', user: null, activeModal: null, isChatOpen: false, chatHost: null, selectedItem: null, targetUser: null, data: initialData, notifications: [], refreshTick: 0, toast: null };
    try {
      const localMem = localStorage.getItem('vennamis_prefs_v3');
      if (localMem) {
        const p = JSON.parse(localMem);
        if (typeof p !== 'object' || p === null) throw new Error('Invalid Cache');
        return { ...fallback, lang: p.lang || 'en', transApi: p.transApi || 'google', theme: p.theme || 'light', bg: p.bg || 'liquid-glass' };
      }
    } catch (e) {
      console.warn("[SEC] Cache purged.");
      localStorage.removeItem('vennamis_prefs_v3');
    }
    return fallback;
  });

  useEffect(() => {
    localStorage.setItem('vennamis_prefs_v3', JSON.stringify({ lang: state.lang, transApi: state.transApi, theme: state.theme, bg: state.bg }));
  }, [state.lang, state.transApi, state.theme, state.bg]);

  useEffect(() => { 
    document.body.className = `theme-${state.theme} antialiased overflow-x-hidden transition-colors duration-500`; 
  }, [state.theme]);

  const [slideId, setSlideId] = useState(1);
  useEffect(() => {
    if (state.bg !== 'landscape') return;
    const interval = setInterval(() => setSlideId(prev => (prev % 3) + 1), 6000);
    return () => clearInterval(interval);
  }, [state.bg]);

  useEffect(() => { if (window.lucide) window.lucide.createIcons(); });

  useEffect(() => {
    if (!supabase) return;
    AuthService.getSession().then(({ data: { session } }) => {
      if (session) {
        const u = session.user;
        setState(prev => ({ ...prev, user: { id: u.id, email: u.email, name: u.user_metadata?.full_name || 'User', avatar: u.user_metadata?.avatar || 'U', balance: u.user_metadata?.balance || '$0.00', bio: 'Ready for global work.' } }));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const u = session.user;
        setState(prev => ({ ...prev, user: { id: u.id, email: u.email, name: u.user_metadata?.full_name || 'User', avatar: u.user_metadata?.avatar || 'U', balance: u.user_metadata?.balance || '$0.00', bio: 'Ready for global work.' } }));
      } else setState(prev => ({ ...prev, user: null }));
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AppContext.Provider value={{ state, setState }}>
      
      {/* UX: Apple-style Liquid Glass Background (The Wow Factor) */}
      {state.bg === 'liquid-glass' && (
        <div className="fixed inset-0 z-[-2] overflow-hidden bg-[var(--bg-base)]">
          <div className="absolute w-[60vw] h-[60vw] rounded-full bg-[var(--primary-glow)] opacity-30 blur-[100px] top-[-10%] left-[-10%] animate-[float1_15s_infinite_alternate]"></div>
          <div className="absolute w-[50vw] h-[50vw] rounded-full bg-blue-500 opacity-20 blur-[100px] bottom-[-10%] right-[-10%] animate-[float2_18s_infinite_alternate]"></div>
          <div className="absolute w-[40vw] h-[40vw] rounded-full bg-purple-500 opacity-20 blur-[100px] top-[30%] left-[30%] animate-[float3_20s_infinite_alternate]"></div>
        </div>
      )}

      {state.bg === 'cyber' && <div className="cyber-grid-container"></div>}
      {state.bg === 'galaxy' && <div className="bg-galaxy"></div>}
      {state.bg === 'aurora-mesh' && <div className="bg-aurora-mesh"></div>}
      
      {state.bg === 'landscape' && (
        <div className="fixed inset-0 z-[-2]">
          <div className={`absolute inset-0 bg-cover bg-center animate-[kenburns_20s_ease-in-out_infinite_alternate] transition-opacity duration-[2000ms] ${slideId === 1 ? 'opacity-100' : 'opacity-0'}`} style={{ backgroundImage: "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80')" }}></div>
          <div className={`absolute inset-0 bg-cover bg-center animate-[kenburns_20s_ease-in-out_infinite_alternate] transition-opacity duration-[2000ms] ${slideId === 2 ? 'opacity-100' : 'opacity-0'}`} style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80')" }}></div>
          <div className={`absolute inset-0 bg-cover bg-center animate-[kenburns_20s_ease-in-out_infinite_alternate] transition-opacity duration-[2000ms] ${slideId === 3 ? 'opacity-100' : 'opacity-0'}`} style={{ backgroundImage: "url('https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1920&q=80')" }}></div>
        </div>
      )}
      
      <div className="cyber-vignette"></div>
      
      <Toast />
      
      <div className="relative flex flex-col min-h-screen z-10 safe-area-bottom">
        <Header />
        <main className="flex-1 w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-8">
          {state.view === 'admin' ? <Admin /> : state.view === 'workspace' ? <Workspace /> : <Home />}
        </main>
      </div>

      <ChatWidget />
      <Modals />
    </AppContext.Provider>
  );
}
