'use client';

import React, { useState, useEffect } from 'react';
import { Bet } from '@/types';
import { formatNumber, timeAgo } from '@/lib/utils';
import { Play } from 'lucide-react';
import Link from 'next/link';

export const LiveBetFeed: React.FC = () => {
  const [bets, setBets] = useState<Bet[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchBets = async () => {
      try {
        const res = await fetch('/api/bets?limit=12');
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.bets)) {
          setBets(data.bets);
        }
      } catch (err) {
        console.error('Error fetching live bet feed:', err);
      }
    };

    fetchBets();

    // Poll every 2 seconds for live real-time updates
    const interval = setInterval(fetchBets, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="bg-secondary/40 border border-gray-800/80 rounded-xl p-4 shadow-xl">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse" />
          Live Bets Feed
        </span>
        <span className="text-[10px] text-gray-500 font-normal">Real-Time</span>
      </h3>
      
      <div className="space-y-2.5">
        {bets.length === 0 ? (
          <div className="py-6 text-center text-xs text-gray-500 font-bold">
            Waiting for live bets...
          </div>
        ) : (
          bets.map((bet) => {
            const isWin = (bet.multiplier || 0) > 0 && (bet.payout || 0) >= bet.amount;
            const username = (bet as any).users?.username || bet.username || 'Anonymous';

            return (
              <div 
                key={bet.id} 
                className="flex items-center justify-between bg-primary/40 border border-gray-800/60 p-2.5 rounded-lg text-xs hover:border-gray-700 transition-all duration-200"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-[10px] font-black uppercase text-accent">
                    {bet.game_type ? bet.game_type.substring(0, 2) : 'GM'}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-white capitalize text-[11px] leading-tight">
                      {bet.game_type}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {username}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className={`font-mono font-bold text-[11px] ${isWin ? 'text-accent' : 'text-gray-400'}`}>
                    {isWin ? `+${formatNumber(bet.payout, 4)}` : `${formatNumber(bet.amount, 4)}`} {bet.coin}
                  </span>
                  <span className="text-[9px] text-gray-500 font-mono">
                    {bet.multiplier ? `${formatNumber(bet.multiplier, 2)}x` : '1.00x'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
