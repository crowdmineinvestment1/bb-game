'use client';

import React from 'react';

interface BadgeProps {
  level: number;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ level, className = '' }) => {
  // Determine VIP Tier from level
  let tier = 'Bronze';
  let badgeColor = 'from-amber-700 to-amber-900 border-amber-600/50 text-amber-100';
  let glowColor = 'shadow-amber-500/20';

  if (level >= 10 && level < 25) {
    tier = 'Silver';
    badgeColor = 'from-slate-400 to-slate-600 border-slate-300/50 text-slate-100';
    glowColor = 'shadow-slate-400/20';
  } else if (level >= 25 && level < 50) {
    tier = 'Gold';
    badgeColor = 'from-yellow-500 to-amber-600 border-yellow-400/50 text-yellow-500';
    glowColor = 'shadow-yellow-500/30';
  } else if (level >= 50 && level < 80) {
    tier = 'Platinum';
    badgeColor = 'from-cyan-400 to-blue-600 border-cyan-300/50 text-cyan-100';
    glowColor = 'shadow-cyan-400/30';
  } else if (level >= 80) {
    tier = 'Diamond';
    badgeColor = 'from-purple-500 to-indigo-700 border-purple-400/50 text-purple-100 animate-pulse';
    glowColor = 'shadow-purple-500/40';
  }

  return (
    <span 
      className={`inline-flex items-center justify-center font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border bg-gradient-to-r shadow-sm ${badgeColor} ${glowColor} ${className}`}
    >
      VIP {level}
    </span>
  );
};
