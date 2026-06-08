import React, { useState } from 'react';
import { Send, X } from 'lucide-react';

export default function ChatWidget({ isOpen, onClose }) {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! All communication is monitored for security against scams. How can we assist you?", sender: 'system' }
    ]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages(prev => [...prev, { id: Date.now(), text: input, sender: 'user' }]);
        setInput('');
        
        setTimeout(() => {
            setMessages(prev => [...prev, { 
                id: Date.now() + 1, 
                text: "Message safely sent via secure protocol to partner database.", 
                sender: 'system' 
            }]);
        }, 1000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-6 right-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl w-80 h-[380px] shadow-2xl z-50 flex flex-col overflow-hidden text-[var(--text-primary)] transition-colors duration-300">
            <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center bg-slate-900/10">
                <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <h4 className="font-bold text-xs">Verified Chat Desk</h4>
                </div>
                <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><X size={16} /></button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs flex flex-col">
                {messages.map(msg => (
                    <div key={msg.id} className={`p-2.5 rounded-xl max-w-[85%] ${
                        msg.sender === 'user' 
                        ? 'bg-[var(--accent-color)] text-white self-end text-right' 
                        : 'bg-slate-800/10 border border-[var(--border-color)] text-[var(--text-secondary)] self-start'
                    }`}>
                        {msg.text}
                    </div>
                ))}
            </div>

            <div className="p-3 border-t border-[var(--border-color)] flex gap-2">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type safely here..." 
                    className="flex-1 bg-transparent border border-[var(--border-color)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none"
                />
                <button onClick={handleSend} className="bg-[var(--accent-color)] text-white p-2 rounded-xl">
                    <Send size={14} />
                </button>
            </div>
        </div>
    );
}D