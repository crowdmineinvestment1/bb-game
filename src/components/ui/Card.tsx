'use client';

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverGlow?: boolean;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverGlow = false,
  glass = false,
  ...props
}) => {
  const baseStyles = 'bg-secondary border border-gray-800/80 rounded-lg overflow-hidden';
  const glassStyles = glass ? 'bg-secondary/40 backdrop-blur-md border-white/5' : '';
  const glowStyles = hoverGlow ? 'transition-all duration-300 hover:border-gray-700 hover:shadow-[0_0_20px_rgba(255,255,255,0.02)]' : '';

  return (
    <div 
      className={`${baseStyles} ${glassStyles} ${glowStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
