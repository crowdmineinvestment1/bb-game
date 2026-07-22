'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { formatNumber } from '@/lib/utils';
import { TrendingUp, Coins, Activity, Percent } from 'lucide-react';

interface UserStatsProps {
  selectedCoin: string;
}

export const UserStats: React.FC<UserStatsProps> = ({ selectedCoin }) => {
  const stats = [
    { name: 'Total Wagered', value: `1250.00`, unit: selectedCoin, icon: Coins, color: 'text-yellow-500' },
    { name: 'Total Profit', value: `+340.50`, unit: selectedCoin, icon: TrendingUp, color: 'text-accent' },
    { name: 'Total Bets', value: '450', unit: 'Bets', icon: Activity, color: 'text-blue-400' },
    { name: 'Win Rate', value: '54.5%', unit: 'Rate', icon: Percent, color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="p-4 bg-secondary/50 border border-gray-800 flex flex-col justify-between min-h-[110px] shadow-md">
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                  {stat.name}
                </span>
                <span className={`${stat.color} p-1 bg-primary/40 rounded-md border border-gray-800`}>
                  <Icon size={14} />
                </span>
              </div>
              <div className="mt-4">
                <span className="text-lg font-black text-white block leading-none">
                  {stat.value}
                </span>
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1 block">
                  {stat.unit}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Custom Win/Loss timeline visualizer */}
      <Card className="p-5 bg-secondary/40 border border-gray-800 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-white uppercase tracking-wider">
            Betting Performance History
          </h3>
          <span className="text-[10px] font-black text-accent uppercase bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full">
            Last 30 Days
          </span>
        </div>

        {/* Custom interactive bars representing wins and losses */}
        <div className="h-28 flex items-end gap-2.5 pt-4">
          {[35, 60, 45, 80, 50, 65, 75, 40, 95, 70, 85, 60].map((val, idx) => {
            const isWin = val > 50;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer">
                {/* Tooltip */}
                <div className="absolute bg-secondary border border-gray-800 text-white font-bold text-[9px] px-2 py-1 rounded shadow-xl -translate-y-12 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
                  {isWin ? 'Win' : 'Loss'}: {val}%
                </div>
                
                {/* Bar */}
                <div 
                  className={`w-full rounded-t-sm transition-all duration-300 group-hover:scale-y-[1.05]
                    ${isWin ? 'bg-accent/40 group-hover:bg-accent/60' : 'bg-red-500/20 group-hover:bg-red-500/40'}`}
                  style={{ height: `${val}px` }}
                />
                
                {/* Index marker */}
                <span className="text-[8px] text-gray-600 font-bold font-mono">
                  W{idx+1}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
