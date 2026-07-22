'use client';

import React, { useState, useEffect } from 'react';
import useAuthStore from '@/store/authStore';
import { formatNumber, timeAgo } from '@/lib/utils';

interface BetHistoryProps {
  gameType?: string;
  refreshKey?: number;
}

export const BetHistory: React.FC<BetHistoryProps> = ({ gameType, refreshKey = 0 }) => {
  const { user } = useAuthStore();
  const [bets, setBets] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchBets = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set('type', activeTab);
        if (gameType) params.set('gameType', gameType);
        if (activeTab === 'my' && user?.username) {
          params.set('userId', user.username);
        }
        params.set('limit', '20');

        const res = await fetch(`/api/bets?${params.toString()}`);
        const data = await res.json();
        
        if (isMounted && data.success && Array.isArray(data.bets)) {
          setBets(data.bets);
        }
      } catch (err) {
        console.error('Error fetching bet history:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBets();

    // Poll every 2 seconds for real-time live bet updates & match result status updates
    const interval = setInterval(fetchBets, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [gameType, activeTab, user?.username, refreshKey]);

  return (
    <div className="bg-secondary/20 border border-gray-800/80 rounded-xl overflow-hidden shadow-lg mt-6 select-none">
      {/* Header Tabs */}
      <div className="flex items-center justify-between border-b border-gray-800 bg-primary/20 p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors duration-150
              ${activeTab === 'my' ? 'bg-secondary text-accent shadow-sm' : 'text-gray-400 hover:text-white'}`}
          >
            MY BETS
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors duration-150
              ${activeTab === 'all' ? 'bg-secondary text-accent shadow-sm' : 'text-gray-400 hover:text-white'}`}
          >
            ALL BETS
          </button>
        </div>
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3">
          ● Real-Time Sports & Game Activity
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-800 text-[10px] text-gray-500 font-bold uppercase tracking-wider bg-primary/10">
              <th className="py-3 px-4">Game / Match</th>
              <th className="py-3 px-4">Player</th>
              <th className="py-3 px-4">Time</th>
              <th className="py-3 px-4">Bet Amount</th>
              <th className="py-3 px-4">Multiplier</th>
              <th className="py-3 px-4 text-right">Result / Payout</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/40 text-xs font-semibold text-gray-300">
            {bets.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500 text-xs font-bold">
                  {loading ? 'Loading bets...' : 'No bets recorded yet. Place a bet to see live activity!'}
                </td>
              </tr>
            ) : (
              bets.map((bet) => {
                const isPending = bet.status === 'PENDING';
                const isWin = bet.status === 'WON' || ((bet.multiplier || 0) > 0 && (bet.payout || 0) >= bet.amount && !isPending);
                const isLoss = bet.status === 'LOST' || (!isWin && !isPending);
                const username = bet.users?.username || bet.username || 'Anonymous';
                
                return (
                  <tr key={bet.id} className="hover:bg-primary/20 transition-colors duration-150">
                    <td className="py-3.5 px-4 font-bold text-white capitalize flex items-center gap-2">
                      <span>{bet.game_type}</span>
                      {isPending && (
                        <span className="text-[9px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 font-black px-1.5 py-0.5 rounded animate-pulse">
                          IN PLAY
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-accent hover:underline cursor-pointer">{username}</td>
                    <td className="py-3.5 px-4 text-gray-500">{timeAgo(bet.created_at || '')}</td>
                    <td className="py-3.5 px-4 text-white">
                      {formatNumber(bet.amount, 4)} <span className="text-[10px] text-gray-500 uppercase">{bet.coin}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {bet.multiplier ? `${formatNumber(bet.multiplier, 2)}x` : '-'}
                    </td>
                    <td className={`py-3.5 px-4 text-right font-bold ${
                      isPending ? 'text-yellow-400' : isWin ? 'text-accent' : 'text-gray-500'
                    }`}>
                      {isPending ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider">⏳ In Play (Awaiting Full-Time)</span>
                      ) : isWin ? (
                        `+${formatNumber(bet.payout, 4)} ${bet.coin}`
                      ) : (
                        `0.00 ${bet.coin} (Lost)`
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
