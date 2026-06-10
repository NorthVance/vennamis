import React, { createContext, useState, useEffect } from 'react';
import Header from './components/layout/Header';
import Home from './pages/Home';
import Modals from './components/layout/Modals';
import ChatWidget from './components/security/ChatWidget';
import './styles/theme.css';

export const AppContext = createContext();

export default function App() {
  const [state, setState] = useState({
    lang: 'en',
    theme: 'light',
    view: 'gigs',
    user: null,
    activeModal: null,
    isChatOpen: false,
    chatHost: null
  });

  // Effect สำหรับสลับธีมที่ body class
  useEffect(() => {
    document.body.className = `theme-${state.theme} antialiased`;
  }, [state.theme]);

  // Translate Helper (จำลอง API)
  const t = (key) => {
    const dict = require('./assets/glows/store').sysTranslations;
    return dict[state.lang]?.[key] || dict['en'][key] || key;
  };

  return (
    <AppContext.Provider value={{ state, setState, t }}>
      {/* Background System */}
      <div className="fixed inset-0 z-[-2] opacity-60 bg-[linear-gradient(var(--grid-color)_1px,transparent_1px),linear-gradient(90deg,var(--grid-color)_1px,transparent_1px)] bg-[size:50px_50px] animate-cyber-pan" style={{ transform: 'perspective(1000px) rotateX(60deg) translateY(-100px) translateZ(-200px)' }}></div>
      <div className="fixed inset-0 z-[-1] bg-[radial-gradient(circle_at_center,transparent_0%,var(--bg-base)_80%)]"></div>
      <div className="fixed top-[20%] left-[10%] w-[30vw] h-[30vw] rounded-full bg-[var(--primary-glow)] opacity-10 blur-[120px] animate-pulse-glow z-[-1]"></div>

      {/* Main Layout */}
      <div className="relative flex flex-col min-h-screen z-10">
        <Header />
        <Home />
      </div>

      {/* Overlays */}
      <ChatWidget />
      <Modals />
    </AppContext.Provider>
  );
}
