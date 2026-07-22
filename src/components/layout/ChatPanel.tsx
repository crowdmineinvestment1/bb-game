'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, Smile, ShieldCheck } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { Badge } from '../ui/Badge';
import { timeAgo } from '@/lib/utils';

interface ChatPanelProps {
  open: boolean;
}

const BOT_USERNAMES = [
  'SatoshiGhost', 'CryptoKing', 'PlinkoPro', 'MinesWeeper', 'LimboMaster',
  'SpinWin', 'CryptoNinja', 'LuckyRoller', 'VipDealer', 'AlphaTrader',
  'BetGod', 'DiceRoller99', 'ElonFan', 'MoonShooter', 'WhaleTrader'
];

const BOT_CONVERSATIONS = [
  'Just hit 4.5x multiplier on Limbo! 🔥',
  'anyone tried the 3D dice game? looks so smooth',
  'Plinko pink row is paying out nicely today',
  'gg to whoever just won on Crash!!',
  'Setting my target to 20x wish me luck guys',
  'Wheel of fortune landed on 14x jackpot!!',
  'BTC pumping + casino wins = perfect combo',
  'Rakeback bonus just claimed, thanks Bb.GAME! 🎁',
  'Good luck everyone in the English Room today 🍀',
  'Withdrawal came through in like 20 seconds, super fast!',
  'Mines 5 gems revealed, cashing out now 💎',
  'Who else is grinding VIP tier status today?'
];

export const ChatPanel: React.FC<ChatPanelProps> = ({ open }) => {
  const { user, isAuthenticated } = useAuthStore();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [onlineCount, setOnlineCount] = useState(148);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChatMessages = async () => {
    try {
      const res = await fetch('/api/chat?limit=50');
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Error fetching English room chat:', err);
    }
  };

  // Poll chat messages every 2 seconds
  useEffect(() => {
    fetchChatMessages();
    const interval = setInterval(fetchChatMessages, 2000);
    return () => clearInterval(interval);
  }, []);

  // Bot active chat generator loop — injects realistic active player chat into English Room
  useEffect(() => {
    const botInterval = setInterval(async () => {
      const randomBot = BOT_USERNAMES[Math.floor(Math.random() * BOT_USERNAMES.length)];
      const randomMsg = BOT_CONVERSATIONS[Math.floor(Math.random() * BOT_CONVERSATIONS.length)];

      try {
        await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: randomMsg,
            username: randomBot,
            isBot: true,
          }),
        });
        fetchChatMessages();
        // Slightly fluctuate online count
        setOnlineCount(prev => prev + Math.floor(Math.random() * 5) - 2);
      } catch (err) {
        // ignore bot errors
      }
    }, 7000);

    return () => clearInterval(botInterval);
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const msgText = text.trim();
    if (!msgText || !isAuthenticated || !user) return;

    setText('');

    // Optimistic local add
    const tempMsg = {
      id: 'temp_' + Date.now(),
      username: user.username,
      vip_level: user.vip_level || 1,
      message: msgText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msgText,
          username: user.username,
        }),
      });
      fetchChatMessages();
    } catch (err) {
      console.error('Error sending chat message:', err);
    }
  };

  if (!open) return null;

  return (
    <aside className="fixed top-16 right-0 z-35 w-80 h-[calc(100vh-64px)] bg-[#0f1923] border-l border-gray-800 flex flex-col hidden lg:flex select-none">
      {/* Header */}
      <div className="p-4 border-b border-gray-800/80 bg-[#1a2c38]/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse" />
          <div className="flex flex-col">
            <span className="text-xs font-black text-white uppercase tracking-wider">
              English Room
            </span>
            <span className="text-[9px] text-[#00e701] font-bold">Active Chat Community</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text.xs text-gray-400 font-bold bg-[#0f1923] px-2.5 py-1 rounded-lg border border-gray-800">
          <Users size={12} className="text-accent" />
          <span className="text-white text-xs">{onlineCount}</span>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-[#0d161f]">
        {messages.length === 0 ? (
          <div className="text-center text-xs text-gray-500 font-semibold mt-10">
            Joining English Room...
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={msg.id || idx} className="flex flex-col space-y-1 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Badge level={msg.vip_level || 1} className="scale-90 transform origin-left" />
                  <span className="text-[11px] font-bold text-white hover:text-accent cursor-pointer transition-colors">
                    {msg.username}
                  </span>
                </div>
                <span className="text-[9px] text-gray-500 font-semibold">
                  {timeAgo(msg.created_at || '')}
                </span>
              </div>
              <p className="text-xs text-gray-300 font-medium leading-relaxed break-words bg-[#1a2c38]/40 p-2.5 rounded-xl border border-gray-800/40 group-hover:border-gray-700/60 transition-colors">
                {msg.message}
              </p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-gray-800 bg-[#0f1923]">
        {isAuthenticated ? (
          <form onSubmit={handleSend} className="flex gap-2">
            <div className="relative flex-1 bg-[#1a2c38] border border-gray-800 focus-within:border-accent/60 rounded-xl overflow-hidden flex items-center pr-2">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Chat in English Room..."
                maxLength={200}
                className="w-full bg-transparent text-xs text-white placeholder-gray-500 py-2.5 px-3 focus:outline-none"
              />
              <button 
                type="button" 
                className="text-gray-500 hover:text-white p-1 rounded"
              >
                <Smile size={15} />
              </button>
            </div>
            <button
              type="submit"
              disabled={!text.trim()}
              className="bg-accent hover:bg-accent-hover text-black px-3.5 py-2.5 rounded-xl flex items-center justify-center transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={14} />
            </button>
          </form>
        ) : (
          <div className="text-center py-2 text-xs text-gray-400 font-bold bg-[#1a2c38]/40 rounded-xl border border-gray-800">
            Log in to join the English Room chat.
          </div>
        )}
      </div>
    </aside>
  );
};
