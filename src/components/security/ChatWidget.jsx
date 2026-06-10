import React, { useContext, useState } from 'react';
import { AppContext } from '../../App';
import { X, Send } from 'lucide-react';

export default function ChatWidget() {
  const { state, setState } = useContext(AppContext);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: "System: End-to-end encryption enabled. Real-time translation active.", sender: 'system' }
  ]);

  if (!state.isChatOpen) return null;

  const handleSend = () => {
    if(!input.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), text: input, sender: 'user' }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now(), text: `${state.chatHost || 'Host'} is offline. Message saved securely to Database.`, sender: 'system' }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 w-[calc(100vw-2rem)] sm:w-80 h-[450px] glass-panel border border-[var(--border-line)] rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
      <div className="p-4 border-b border-[var(--border-line)] flex justify-between items-center bg-black/10">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <h3 className="text-sm font-bold text-prime">{state.chatHost ? `Chat with ${state.chatHost}` : 'Secure Comms'}</h3>
        </div>
        <button onClick={() => setState({...state, isChatOpen: false})} className="text-sub hover:text-prime"><X size={16} /></button>
      </div>
      
      <div className="flex-1 p-4 space-y-3 overflow-y-auto flex flex-col">
        {messages.map(msg => (
          <div key={msg.id} className={`max-w-[85%] p-2.5 rounded-2xl text-xs ${msg.sender === 'user' ? 'self-end text-white rounded-tr-none' : 'self-start surface-bg border border-[var(--border-line)] text-prime rounded-tl-none'}`} style={msg.sender === 'user' ? {background: 'var(--primary-glow)'} : {}}>
            {msg.text}
          </div>
        ))}
      </div>
      
      <div className="p-3 border-t border-[var(--border-line)] bg-black/10 flex gap-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="Type message..." className="flex-1 surface-bg border border-[var(--border-line)] rounded-xl px-3 py-2 text-xs text-prime outline-none focus:border-[var(--primary-glow)]" />
        <button onClick={handleSend} className="p-2 rounded-xl text-white hover-lift" style={{ background: 'var(--primary-glow)' }}><Send size={14} /></button>
      </div>
    </div>
  );
}
