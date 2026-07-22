'use client';

import React, { useState, useEffect, useRef } from 'react';
import useAuthStore from '@/store/authStore';

export const SupportWidget = () => {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const guestIdRef = useRef<string>('');
  if (!guestIdRef.current) {
    if (typeof window !== 'undefined') {
      let stored = localStorage.getItem('bb_guest_id');
      if (!stored) {
        stored = 'guest_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('bb_guest_id', stored);
      }
      guestIdRef.current = stored;
    }
  }

  const userId = user?.id || user?.username || guestIdRef.current || 'guest_user';
  const username = user?.username || 'Guest User';

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/support', {
        headers: {
          'x-guest-id': userId
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      }
    } catch (err) {
      console.error('Error fetching support messages:', err);
    }
  };

  useEffect(() => {
    const handleOpenEvent = () => setIsOpen(true);
    window.addEventListener('open-support-widget', handleOpenEvent);
    return () => window.removeEventListener('open-support-widget', handleOpenEvent);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const textToSend = input.trim();
    if (!textToSend || sending) return;

    setInput('');
    setSending(true);

    // Immediate local optimistic add
    const tempMsg = {
      id: 'temp_' + Date.now(),
      sender: 'user',
      username,
      text: textToSend,
      message: textToSend,
      created_at: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      isAdmin: false,
    };

    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-guest-id': userId
        },
        body: JSON.stringify({
          text: textToSend,
          message: textToSend,
          user_id: userId,
          username
        }),
      });

      if (res.ok) {
        await fetchMessages();
      }
    } catch (err) {
      console.error('Error sending support message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans select-none">
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 h-[420px] bg-[#1a2c38] border border-[#00e701]/40 rounded-2xl shadow-[0_0_30px_rgba(0,231,1,0.2)] flex flex-col overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="bg-[#0f1923] p-3.5 border-b border-gray-800 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e701] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00e701]"></span>
              </span>
              <div className="flex flex-col">
                <span className="text-white font-black text-xs uppercase tracking-wider">Live Customer Service</span>
                <span className="text-[9px] text-[#00e701] font-bold">Official Support • 24/7 Agent Online</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 w-7 h-7 rounded-full flex items-center justify-center text-xs"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0f1923]/60 scrollbar-thin scrollbar-thumb-gray-800">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-2 py-6">
                <span className="text-4xl animate-bounce">🎧</span>
                <p className="text-white text-xs font-bold">
                  Welcome to Bb.GAME Support
                </p>
                <p className="text-gray-400 text-[11px] max-w-[220px]">
                  Send your inquiry below. Our support agents are active in real-time.
                </p>
              </div>
            ) : (
              messages.map((msg: any, idx: number) => {
                const isAdmin = msg.isAdmin || msg.sender === 'admin';
                const msgText = msg.text || msg.message || '';
                const timeStr = new Date(msg.created_at || msg.timestamp || Date.now()).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={msg.id || idx}
                    className={`flex flex-col max-w-[85%] ${
                      isAdmin ? 'self-start' : 'self-end'
                    }`}
                  >
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-xs font-semibold leading-relaxed ${
                        isAdmin
                          ? 'bg-[#213743] text-white border border-gray-700/60 rounded-tl-none shadow-md'
                          : 'bg-[#00e701]/20 text-white border border-[#00e701]/40 rounded-tr-none shadow-md'
                      }`}
                    >
                      {msgText}
                    </div>
                    <span
                      className={`text-[9px] font-bold text-gray-500 mt-1 px-1 ${
                        isAdmin ? 'text-left' : 'text-right'
                      }`}
                    >
                      {isAdmin ? '🎧 Official Agent' : 'You'} • {timeStr}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={sendMessage}
            className="p-3 border-t border-gray-800 bg-[#0f1923]"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message to support..."
                className="flex-1 bg-[#1a2c38] border border-gray-850 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#00e701]/60"
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                className="bg-[#00e701] text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-50 hover:bg-[#00c701] transition-colors"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 bg-[#1a2c38] border-2 border-[#00e701] hover:border-[#00e701] shadow-[0_0_20px_rgba(0,231,1,0.3)] hover:shadow-[0_0_30px_rgba(0,231,1,0.5)] transition-all duration-300 rounded-full px-5 py-3.5"
        >
          <span className="text-xl">🎧</span>
          <div className="flex flex-col text-left">
            <span className="text-[#00e701] font-black text-xs uppercase tracking-wider group-hover:text-white transition-colors">
              Customer Support
            </span>
            <span className="text-[9px] text-gray-400 font-bold">24/7 Agent Online</span>
          </div>
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e701] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#00e701]"></span>
          </span>
        </button>
      )}
    </div>
  );
};
