import React, { useContext, useState, useRef, useEffect } from 'react';
import { AppContext } from '../../App';
import io from 'socket.io-client';

// CFG
const SOCKET_URL = 'https://ใส่_URL_RENDER_ของมึงตรงนี้.onrender.com';
let socket;

export default function ChatWidget() {
  const { state, setState } = useContext(AppContext);
  const [messages, setMessages] = useState({});
  const [chatInput, setChatInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const chatEndRef = useRef(null);

  // MOCK
  const contacts = [
    { id: 'u1', name: 'Alex Corp', status: 'online', unread: 2 },
    { id: 'u2', name: 'Studio X', status: 'offline', unread: 0 },
    { id: 'u3', name: 'DataFlow', status: 'online', unread: 0 }
  ];

  // INIT
  useEffect(() => {
    socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('receive_message', (data) => {
      setMessages(prev => ({ ...prev, [data.senderName]: [...(prev[data.senderName] || []), { ...data, sender: 'host' }] }));
      if (!state.isChatOpen || state.chatHost !== data.senderName) {
        setState(prev => ({ ...prev, toast: { type: 'info', message: `New secure msg from ${data.senderName}` } }));
      }
    });
    return () => socket.disconnect();
  }, []);

  // EXEC
  const toggleChat = () => setState(prev => ({ ...prev, isChatOpen: !prev.isChatOpen }));
  const closeChat = () => setState(prev => ({ ...prev, isChatOpen: false }));
  
  const openRoom = (hostName) => {
    setState(prev => ({ ...prev, chatHost: hostName }));
    socket.emit('join_room', hostName);
    if (!messages[hostName]) setMessages(prev => ({ ...prev, [hostName]: [{ id: 'sys-1', sender: 'system', text: `End-to-end encrypted channel with ${hostName}.`, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }] }));
  };
  
  const backToContacts = () => setState(prev => ({ ...prev, chatHost: null }));

  const sendChat = () => {
    if (!chatInput.trim() || !state.chatHost) return;
    const msgData = { id: `m-${Date.now()}`, room: state.chatHost, senderName: state.user?.name || 'Guest', sender: 'me', text: chatInput, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    socket.emit('send_message', msgData);
    setMessages(prev => ({ ...prev, [state.chatHost]: [...(prev[state.chatHost] || []), msgData] }));
    setChatInput('');
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); if (window.lucide) window.lucide.createIcons(); }, [messages, state.chatHost, state.isChatOpen]);
  
  const getStatusColor = (status) => status === 'online' ? 'bg-green-500' : (status === 'away' ? 'bg-amber-500' : 'bg-gray-500');

  // RENDER
  return (
    <>
      <button onClick={toggleChat} className="btn-press fixed bottom-4 right-4 sm:bottom-6 sm:right-6 p-3 sm:p-4 rounded-full text-white shadow-[0_0_20px_var(--grid-color)] hover:scale-110 transition-transform z-[90]" style={{ background: 'var(--primary-glow)' }}>
        <i data-lucide="message-square" className="w-5 h-5 sm:w-6 sm:h-6"></i>
        {contacts.reduce((acc, c) => acc + c.unread, 0) > 0 && <span className="absolute top-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-red-500 border-2 border-[var(--bg-base)] rounded-full"></span>}
      </button>

      <div className={`fixed bottom-0 right-0 w-full h-[85vh] sm:h-[500px] sm:w-[360px] sm:bottom-24 sm:right-6 glass-panel border-t sm:border rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 z-[100] ${state.isChatOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-full sm:translate-y-5 pointer-events-none'}`}>
        <div className="p-3 sm:p-4 border-b border-[var(--border-line)] flex justify-between items-center bg-black/5 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            {state.chatHost ? (
              <><button onClick={backToContacts} className="btn-press text-sub hover:text-prime transition"><i data-lucide="chevron-left" className="w-5 h-5"></i></button><div className="relative"><div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center font-bold text-white text-xs">{state.chatHost[0]}</div><span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[var(--bg-glass)]"></span></div><div><h3 className="text-sm font-bold text-prime leading-none">{state.chatHost}</h3><span className="text-[9px] text-[var(--primary-glow)]">Encrypted Session</span></div></>
            ) : (
              <><div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--primary-glow)]/10 text-[var(--primary-glow)]"><i data-lucide="messages-square" className="w-4 h-4"></i></div><div><h3 className="text-sm font-bold text-prime leading-none">Secure Inbox</h3><span className={`text-[9px] ${isConnected ? 'text-green-500' : 'text-amber-500'}`}>{isConnected ? 'Connected to Relay' : 'Connecting...'}</span></div></>
            )}
          </div>
          <button onClick={closeChat} className="btn-press text-sub hover:text-prime transition bg-white/5 p-1.5 rounded-full"><i data-lucide="chevron-down" className="w-4 h-4 sm:hidden"></i><i data-lucide="x" className="w-4 h-4 hidden sm:block"></i></button>
        </div>

        {!state.chatHost ? (
          <div className="flex-1 overflow-y-auto p-2 space-y-1 hide-scrollbar bg-[var(--bg-surface)]">
            <div className="px-3 py-2 text-[10px] font-bold text-sub uppercase tracking-widest">Recent Conversations</div>
            {contacts.map(c => (
              <div key={c.id} onClick={() => openRoom(c.name)} className="btn-press flex items-center space-x-3 p-3 hover:bg-white/5 rounded-2xl cursor-pointer transition relative">
                <div className="relative"><div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center font-bold text-white border border-[var(--border-line)]">{c.name[0]}</div><span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${getStatusColor(c.status)} border-2 border-[var(--bg-glass)]`}></span></div>
                <div className="flex-1 min-w-0"><div className="flex justify-between items-baseline mb-1"><h4 className="text-sm font-bold text-prime truncate">{c.name}</h4><span className="text-[9px] text-sub flex-shrink-0">12:30 PM</span></div><p className={`text-xs truncate ${c.unread > 0 ? 'text-prime font-bold' : 'text-sub'}`}>{c.unread > 0 ? 'Encrypted attachment...' : 'Tap to view...'}</p></div>
                {c.unread > 0 && <div className="w-5 h-5 rounded-full bg-[var(--primary-glow)] flex items-center justify-center text-[9px] font-bold text-white shadow-md">{c.unread}</div>}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden bg-black/10">
            <div className="flex-1 p-3 sm:p-4 space-y-4 overflow-y-auto hide-scrollbar flex flex-col">
              {(messages[state.chatHost] || []).map((m) => (
                <div key={m.id} className={`flex flex-col ${m.sender === 'me' ? 'items-end' : 'items-start'}`}>
                  {m.sender === 'system' ? (
                    <div className="self-center bg-white/5 border border-[var(--border-line)] px-3 py-1.5 rounded-full text-[9px] text-sub flex items-center my-2"><i data-lucide="lock" className="w-3 h-3 mr-1.5"></i> {m.text}</div>
                  ) : (
                    <><div className={`max-w-[85%] p-3 text-sm shadow-sm ${m.sender === 'me' ? 'bg-[var(--primary-glow)] text-white rounded-2xl rounded-tr-sm' : 'surface-bg border border-[var(--border-line)] text-prime rounded-2xl rounded-tl-sm'}`}>{m.text}</div><div className="flex items-center mt-1 space-x-1"><span className="text-[9px] text-sub">{m.time}</span>{m.sender === 'me' && <i data-lucide="check-check" className="w-3 h-3 text-[var(--primary-glow)] opacity-80"></i>}</div></>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-3 bg-[var(--bg-surface)] border-t border-[var(--border-line)] pb-6 sm:pb-3">
              <div className="flex items-center gap-2 bg-black/20 border border-[var(--border-line)] rounded-2xl p-1 pr-1.5 focus-within:border-[var(--primary-glow)] transition-colors">
                <button className="btn-press p-2 text-sub hover:text-[var(--primary-glow)] transition rounded-xl"><i data-lucide="paperclip" className="w-4 h-4"></i></button>
                <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder="Secure message..." className="flex-1 bg-transparent text-xs sm:text-sm text-prime outline-none placeholder-[var(--text-muted)] py-1" />
                <button onClick={sendChat} disabled={!chatInput.trim()} className="btn-press p-2 rounded-xl text-white disabled:opacity-50 transition shadow-sm" style={{ background: 'var(--primary-glow)' }}><i data-lucide="send" className="w-4 h-4"></i></button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
