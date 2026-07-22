'use client';

import React from 'react';

interface BbGameLogoProps {
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

export const BbGameLogo: React.FC<BbGameLogoProps> = ({ size = 'md', glow = false }) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl md:text-2xl',
    lg: 'text-3xl md:text-4xl',
  };

  const dotSize = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3.5 h-3.5',
  };

  return (
    <div className={`flex items-center font-black tracking-tighter select-none ${sizeClasses[size]}`}>
      <span className={`text-accent font-black italic bg-gradient-to-r from-accent to-[#00c801] bg-clip-text text-transparent ${glow ? 'drop-shadow-[0_0_12px_rgba(0,231,1,0.5)]' : ''}`}>
        Bb
      </span>
      <span className="text-white font-extrabold flex items-center">
        <span className={`bg-accent rounded-full mx-0.5 inline-block ${dotSize[size]}`} />
        GAME
      </span>
    </div>
  );
};
