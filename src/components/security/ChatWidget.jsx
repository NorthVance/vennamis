import React, { useContext, useState, useRef, useEffect } from 'react';
import { AppContext } from '../../App';

export default function ChatWidget() {
  const { state, setState } = useContext(AppContext);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  const contacts = ['Alex Corp', 'Studio X', 'DataFlow', 'Sarah J.'];

  // ฟังก์ชันควบคุมการเปิด/ปิดแชท
  const toggleChat = () => setState(prev => ({ ...prev, isChatOpen: !prev.isChatOpen }));
  const closeChat = () => setState(prev => ({ ...prev, isChatOpen: false }));
  
  // ฟังก์ชันสลับไปห้องแชท
  const openRoom = (host) => {
    setState(prev => ({ ...prev, chatHost: host }));
    setMessages([{ sender: 'system', text: 'System: End-to-end encryption enabled.' }]);
  };
  const backToContacts = () => setState(prev => ({ ...prev, chatHost: null }));

  // ฟังก์ชันส่งข้อความ
  const sendChat = () => {
    if (!chatInput.trim()) return;
    setMessages(prev => [...prev, { sender: 'me', text: chatInput }]);
    setChatInput('');
    // จำลองระบบตอบกลับอัตโนมัติ
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'host', text: `${state.chatHost || 'Host'} is away. Message saved securely.` }]);
    }, 1000);
  };

  // เลื่อนจอแชทลงล่างสุดอัตโนมัติเวลาส่งข้อความ
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (window.lucide) window.lucide.createIcons();
  }, [messages, state.isChatOpen]);

  return (
    <>
      {/* Floating Button มุมขวาล่าง */}
      <button 
        onClick={toggleChat} 
        className="fixed bottom-6 right-6 p-4 rounded-full text-white shadow-[0_0_20px_var(--grid-color)] hover:scale-110 transition-transform z-40" 
        style={{ background: 'var(--primary-glow)' }}
      >
        <i data-lucide="message-square" className="w-6 h-6"></i>
      </button>

      {/* หน้าต่าง Chat Widget (Glass Panel) */}
      <div className={`fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-80 h-[450px] glass-panel border rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 z-50 ${state.isChatOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-5 pointer-events-none'}`}>
        
        {/* Header แชท */}
        <div className="p-4 border-b border-[var(--border-line)] flex justify-between items-center bg-black/10">
          <div className="flex items-center space-x-2">
            {state.chatHost && (
              <button onClick={backToContacts} className="text-sub hover:text-prime mr-1">
                <i data-lucide="chevron-left" className="w-5 h-5"></i>
              </button>
            )}
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <h3 className="text-sm font-bold text-prime">{state.chatHost || 'Messages'}</h3>
          </div>
          <button onClick={closeChat} className="text-sub hover:text-prime">
            <i data-lucide="x" className="w-4 h-4"></i>
          </button>
        </div>

        {/* สลับหน้าจอระหว่าง "รายชื่อ" กับ "ห้องแชท" */}
        {!state.chatHost ? (
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {contacts.map(c => (
              <div key={c} onClick={() => openRoom(c)} className="flex items-center space-x-3 p-3 hover:bg-[var(--bg-surface)] rounded-xl cursor-pointer transition">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-white">{c[0]}</div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-prime">{c}</h4>
                  <p className="text-[10px] text-sub truncate">Tap to view messages...</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 p-4 space-y-3 overflow-y-auto flex flex-col">
              {messages.map((m, i) => (
                <div key={i} className={m.sender === 'me' ? 'self-end max-w-[80%] p-3 rounded-2xl rounded-tr-none text-xs text-white mt-2' : 'self-start max-w-[85%] surface-bg border p-2.5 rounded-2xl rounded-tl-none text-xs text-prime'} style={m.sender === 'me' ? { background: 'var(--primary-glow)' } : {}}>
                  {m.text}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            {/* Input กล่องพิมพ์ */}
            <div className="p-3 border-t border-[var(--border-line)] bg-black/10 flex gap-2">
              <input 
                type="text" 
                value={chatInput} 
                onChange={e => setChatInput(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && sendChat()} 
                placeholder="Type message..." 
                className="flex-1 surface-bg border rounded-xl px-3 py-2 text-xs text-prime outline-none focus:border-[var(--primary-glow)] bg-transparent" 
              />
              <button onClick={sendChat} className="p-2 rounded-xl text-white hover-lift flex-shrink-0" style={{ background: 'var(--primary-glow)' }}>
                <i data-lucide="send" className="w-4 h-4"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}