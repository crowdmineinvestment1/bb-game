'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { Crown, Sparkles, Award } from 'lucide-react';

interface VIPBadgeProps {
  xp: number;
}

export const VIPBadge: React.FC<VIPBadgeProps> = ({ xp }) => {
  // Determine VIP Tier from XP
  let tier = 'Bronze';
  let nextTier = 'Silver';
  let reqXp = 10000;
  let prevXp = 0;
  let bgGradient = 'from-amber-600/10 to-amber-900/10 border-amber-500/20';
  let badgeColor = 'text-amber-500 bg-amber-500/15 border-amber-500/30';
  let rakeback = '1.0%';

  if (xp >= 10000 && xp < 50000) {
    tier = 'Silver';
    nextTier = 'Gold';
    reqXp = 50000;
    prevXp = 10000;
    bgGradient = 'from-slate-400/10 to-slate-600/10 border-slate-400/20';
    badgeColor = 'text-slate-400 bg-slate-400/15 border-slate-400/30';
    rakeback = '1.5%';
  } else if (xp >= 50000 && xp < 200000) {
    tier = 'Gold';
    nextTier = 'Platinum';
    reqXp = 200000;
    prevXp = 50000;
    bgGradient = 'from-yellow-500/10 to-amber-600/10 border-yellow-500/20';
    badgeColor = 'text-yellow-500 bg-yellow-500/15 border-yellow-500/30';
    rakeback = '2.0%';
  } else if (xp >= 200000 && xp < 1000000) {
    tier = 'Platinum';
    nextTier = 'Diamond';
    reqXp = 1000000;
    prevXp = 200000;
    bgGradient = 'from-cyan-400/10 to-blue-600/10 border-cyan-400/20';
    badgeColor = 'text-cyan-400 bg-cyan-400/15 border-cyan-400/30';
    rakeback = '2.5%';
  } else if (xp >= 1000000) {
    tier = 'Diamond';
    nextTier = 'VIP Club';
    reqXp = 10000000;
    prevXp = 1000000;
    bgGradient = 'from-purple-500/10 to-indigo-700/10 border-purple-500/20';
    badgeColor = 'text-purple-500 bg-purple-500/15 border-purple-500/30 animate-pulse';
    rakeback = '3.5%';
  }

  // Calculate percentage
  const progressPercent = Math.min(100, Math.max(0, ((xp - prevXp) / (reqXp - prevXp)) * 100));

  return (
    <Card className={`p-5 bg-gradient-to-tr ${bgGradient} flex flex-col justify-between h-full relative overflow-hidden shadow-xl border`}>
      <div className="space-y-4 z-10">
        
        {/* Tier Name */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`p-2.5 rounded-xl border ${badgeColor} flex items-center justify-center`}>
              <Crown size={20} />
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-none">
                VIP Tier Status
              </span>
              <span className="text-xl font-black text-white uppercase tracking-wider mt-1.5">
                {tier} Club
              </span>
            </div>
          </div>
          
          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full">
            <Sparkles size={10} /> Active
          </span>
        </div>

        {/* XP progress details */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
            <span>{tier}</span>
            <span>{progressPercent.toFixed(1)}% to {nextTier}</span>
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 bg-primary border border-gray-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent rounded-full shadow-[0_0_8px_rgba(0,231,1,0.5)] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          
          <div className="flex justify-between text-[10px] font-mono text-gray-500 font-semibold mt-1">
            <span>XP: {xp.toLocaleString()}</span>
            <span>Next Level: {reqXp.toLocaleString()} XP</span>
          </div>
        </div>
      </div>

      {/* Rakeback / Perks summary */}
      <div className="border-t border-gray-800/80 pt-4 mt-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
          <Award size={14} className="text-accent" />
          <span>Active Rakeback Rate</span>
        </div>
        <span className="text-sm font-black text-accent">
          {rakeback}
        </span>
      </div>

      {/* Decorative background element */}
      <div className="absolute right-0 top-0 w-1/3 h-1/3 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.015),transparent_70%)] pointer-events-none" />
    </Card>
  );
};
