'use client';

import React, { useEffect, useState } from 'react';
import { formatNumber } from '@/lib/utils';
import { Trophy } from 'lucide-react';

interface Winner {
  username: string;
  game: string;
  payout: number;
  multiplier: number;
  coin: string;
}

export const TopWinners: React.FC = () => {
  const [winners, setWinners] = useState<Winner[]>([]);

  useEffect(() => {
    const defaultWinners: Winner[] = [
      { username: 'SatoshiGhost', game: 'Crash', payout: 1.543, multiplier: 84.5, coin: 'BTC' },
      { username: 'ElonFan', game: 'Mines', payout: 5400.0, multiplier: 18.2, coin: 'USDT' },
      { username: 'PlinkoKing', game: 'Plinko', payout: 4.87, multiplier: 130.0, coin: 'ETH' },
      { username: 'DiceGod', game: 'Dice', payout: 0.12, multiplier: 99.0, coin: 'BTC' },
      { username: 'LimboMaster', game: 'Limbo', payout: 850.5, multiplier: 450.0, coin: 'USDC' },
    ];
    setWinners(defaultWinners);
  }, []);

  return (
    <div className="bg-secondary/40 border border-gray-800/80 rounded-xl p-3.5 flex items-center gap-3 overflow-hidden shadow-lg mb-8 select-none">
      <div className="bg-accent/10 border border-accent/20 text-accent p-2 rounded-lg flex items-center justify-center flex-shrink-0 animate-pulse">
        <Trophy size={18} />
      </div>
      
      <div className="flex-1 overflow-hidden relative">
        {/* Scrolling text wrapper */}
        <div className="flex gap-8 whitespace-nowrap animate-scroll-slow">
          {/* Double map to ensure seamless looping */}
          {[...winners, ...winners].map((win, idx) => (
            <div key={idx} className="inline-flex items-center gap-2 text-xs font-bold">
              <span className="text-accent">{win.username}</span>
              <span className="text-gray-400">won</span>
              <span className="text-white font-black">{win.game}</span>
              <span className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-[10px] font-black">
                {win.multiplier.toFixed(1)}x
              </span>
              <span className="text-white">
                {formatNumber(win.payout, 3)} <span className="text-[9px] text-gray-500 uppercase">{win.coin}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
