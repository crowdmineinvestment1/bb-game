'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatNumber } from '@/lib/utils';
import { Trophy, Medal, Flame } from 'lucide-react';
import useWalletStore from '@/store/walletStore';

interface LeaderboardUser {
  rank: number;
  username: string;
  vipLevel: number;
  wagered: number;
  profit: number;
  prize: number;
}

export default function LeaderboardPage() {
  const { selectedCoin } = useWalletStore();
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [players, setPlayers] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    const list: LeaderboardUser[] = [
      { rank: 1, username: 'SatoshiGhost', vipLevel: 82, wagered: 1.543, profit: 0.85, prize: 0.15 },
      { rank: 2, username: 'CryptoKing', vipLevel: 65, wagered: 1.221, profit: 0.45, prize: 0.08 },
      { rank: 3, username: 'DiceGod', vipLevel: 45, wagered: 0.892, profit: 0.22, prize: 0.04 },
      { rank: 4, username: 'PlinkoPro', vipLevel: 38, wagered: 0.540, profit: -0.12, prize: 0.02 },
      { rank: 5, username: 'MinesWeeper', vipLevel: 27, wagered: 0.450, profit: 0.18, prize: 0.01 },
      { rank: 6, username: 'LimboMaster', vipLevel: 21, wagered: 0.320, profit: -0.05, prize: 0.005 },
      { rank: 7, username: 'SpinWin', vipLevel: 15, wagered: 0.150, profit: 0.04, prize: 0.002 },
    ];
    setPlayers(list);
  }, [activeTab]);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 p-1.5 rounded-full flex items-center justify-center">
            <Trophy size={16} />
          </div>
        );
      case 2:
        return (
          <div className="bg-slate-400/20 text-slate-400 border border-slate-300/30 p-1.5 rounded-full flex items-center justify-center">
            <Medal size={16} />
          </div>
        );
      case 3:
        return (
          <div className="bg-amber-700/20 text-amber-700 border border-amber-600/30 p-1.5 rounded-full flex items-center justify-center">
            <Medal size={16} />
          </div>
        );
      default:
        return (
          <span className="w-8 h-8 rounded-full bg-primary/40 border border-gray-800 flex items-center justify-center text-xs font-bold text-gray-500">
            {rank}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pt-4 pb-12">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">
          Leaderboard
        </h1>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
          Wager race & Big Wins
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800/80 pb-4">
        {['daily', 'weekly', 'monthly'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 text-xs font-black rounded-lg border uppercase tracking-wider transition-all
              ${activeTab === tab 
                ? 'border-accent bg-accent/5 text-accent shadow-md' 
                : 'border-gray-800 bg-secondary/30 text-gray-400 hover:text-white hover:border-gray-700'}`}
          >
            {tab} RACE
          </button>
        ))}
      </div>

      {/* Top 3 Podium Displays (Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {players.slice(0, 3).map((p) => (
          <Card 
            key={p.rank} 
            className={`p-5 flex flex-col items-center justify-center text-center gap-3 bg-secondary/50 border
              ${p.rank === 1 ? 'border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'border-gray-850'}`}
          >
            {getRankBadge(p.rank)}
            
            <div className="space-y-1">
              <span className="text-sm font-black text-white block">
                {p.username}
              </span>
              <Badge level={p.vipLevel} />
            </div>

            <div className="w-full grid grid-cols-2 gap-2 border-t border-gray-800/80 pt-4 mt-2 text-xs">
              <div className="border-r border-gray-800/60">
                <span className="text-[9px] text-gray-500 font-bold block uppercase tracking-wider">Wagered</span>
                <span className="text-white font-bold">{formatNumber(p.wagered, 3)} {selectedCoin}</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-500 font-bold block uppercase tracking-wider">Prize Share</span>
                <span className="text-accent font-bold">+{formatNumber(p.prize, 3)} {selectedCoin}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Table grid for remaining players */}
      <Card className="bg-secondary/40 border border-gray-800/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-800 text-[10px] text-gray-500 font-bold uppercase tracking-wider bg-primary/10">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">VIP Level</th>
                <th className="py-3 px-4">Total Wagered</th>
                <th className="py-3 px-4">Profit / Loss</th>
                <th className="py-3 px-4 text-right">Rank Prize</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/40 text-xs font-semibold text-gray-300">
              {players.map((p) => (
                <tr key={p.rank} className="hover:bg-primary/20 transition-colors duration-150">
                  <td className="py-3.5 px-4 font-bold text-white">{p.rank}</td>
                  <td className="py-3.5 px-4 text-white font-bold">{p.username}</td>
                  <td className="py-3.5 px-4">
                    <Badge level={p.vipLevel} />
                  </td>
                  <td className="py-3.5 px-4 text-white">
                    {formatNumber(p.wagered, 4)} <span className="text-[10px] text-gray-500 uppercase">{selectedCoin}</span>
                  </td>
                  <td className={`py-3.5 px-4 ${p.profit >= 0 ? 'text-accent' : 'text-red-500'}`}>
                    {p.profit >= 0 ? '+' : ''}{formatNumber(p.profit, 4)} <span className="text-[9px] uppercase text-gray-500">{selectedCoin}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-accent font-black">
                    +{formatNumber(p.prize, 4)} <span className="text-[9px] uppercase text-gray-500">{selectedCoin}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
