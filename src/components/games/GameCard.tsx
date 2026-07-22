'use client';

import React from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';

interface GameCardProps {
  id: string;
  name: string;
  type: string;
  category: string;
  thumbnail?: string;
  provider?: string;
  isLive?: boolean;
}

// Each card gets a random animation delay/duration so they don't all move in sync
const getRandomDelay = () => `${(Math.random() * 5).toFixed(1)}s`;
const getRandomDuration = () => `${6 + Math.random() * 4}s`;

export const GameCard: React.FC<GameCardProps> = ({
  id,
  name,
  type,
  category,
  thumbnail,
  provider = 'Bb Originals',
  isLive = false,
}) => {
  const [coords, setCoords] = React.useState({ rotateX: 0, rotateY: 0, x: 50, y: 50, active: false });
  const [animVars] = React.useState(() => ({
    '--float-delay': getRandomDelay(),
    '--float-duration': getRandomDuration(),
  } as React.CSSProperties));

  // Define a nice gradient matching the type/style if thumbnail is absent
  const gradients: Record<string, string> = {
    crash: 'from-orange-500 to-red-600',
    dice: 'from-blue-600 to-indigo-700',
    plinko: 'from-pink-500 to-rose-600',
    mines: 'from-purple-600 to-violet-800',
    limbo: 'from-teal-500 to-emerald-600',
    wheel: 'from-yellow-500 to-orange-600',
    slot: 'from-amber-600 to-yellow-800',
    live: 'from-rose-600 to-red-800',
  };

  let gamePath = `/games/${type}`;
  let typeGradientKey = type;

  if (category === 'slots') {
    gamePath = `/casino/slots/${id}`;
    typeGradientKey = 'slot';
  } else if (category === 'live') {
    gamePath = `/casino/live/${id}`;
    typeGradientKey = 'live';
  }

  const gradient = gradients[typeGradientKey] || 'from-gray-700 to-gray-900';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    
    const rotateY = ((x / box.width) - 0.5) * 24;
    const rotateX = (0.5 - (y / box.height)) * 24;
    
    const sheenX = (x / box.width) * 100;
    const sheenY = (y / box.height) * 100;
    
    setCoords({ rotateX, rotateY, x: sheenX, y: sheenY, active: true });
  };

  const handleMouseLeave = () => {
    setCoords({ rotateX: 0, rotateY: 0, x: 50, y: 50, active: false });
  };

  return (
    <Link href={gamePath} className="block group">
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(600px) rotateX(${coords.rotateX}deg) rotateY(${coords.rotateY}deg) scale3d(${coords.active ? 1.05 : 1}, ${coords.active ? 1.05 : 1}, 1)`,
          transition: coords.active ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
          transformStyle: 'preserve-3d',
        }}
        className="aspect-[4/3] relative flex flex-col bg-secondary border border-gray-800 rounded-xl overflow-hidden cursor-pointer select-none hover:border-gray-600 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-shadow duration-500"
      >
        {/* Sheen reflection overlay */}
        {coords.active && (
          <div
            style={{
              background: `radial-gradient(circle 120px at ${coords.x}% ${coords.y}%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 80%)`,
              mixBlendMode: 'overlay' as const,
            }}
            className="absolute inset-0 z-30 pointer-events-none"
          />
        )}
        
        {/* Thumbnail area — image takes full space, clean with no text overlay */}
        <div className={`flex-1 bg-gradient-to-tr ${gradient} relative overflow-hidden`}
          style={{ transform: 'translateZ(20px)' }}
        >
          {/* 3D Animated game thumbnail image */}
          {thumbnail && (
            <img
              src={thumbnail}
              alt={name}
              className="absolute inset-0 w-full h-full object-cover z-[1] game-card-img"
              loading="lazy"
              style={animVars}
            />
          )}

          {/* Subtle vignette overlay for depth */}
          <div className="absolute inset-0 z-[2] pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.45) 100%)',
            }}
          />

          {/* Shimmer sweep effect on hover */}
          <div className="absolute inset-0 z-[3] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden">
            <div className="game-card-shimmer" />
          </div>

          {/* Hover Overlay Play button */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
            <div className="bg-accent text-black p-3 rounded-full shadow-lg transform scale-75 group-hover:scale-100 transition-all duration-300">
              <Play size={18} fill="currentColor" className="ml-0.5" />
            </div>
          </div>

          {/* Live Indicator */}
          {isLive && (
            <span className="absolute top-2 left-2 bg-red-600 text-[9px] font-black uppercase px-2 py-0.5 rounded-md animate-pulse text-white z-30">
              Live
            </span>
          )}
        </div>

        {/* Info panel — name shown cleanly below the image */}
        <div className="bg-primary/95 px-3 py-2 flex flex-col border-t border-gray-800/80"
          style={{ transform: 'translateZ(10px)' }}
        >
          <span className="text-[11px] font-bold text-white tracking-wide truncate leading-tight">
            {name}
          </span>
          <span className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5">
            {provider}
          </span>
        </div>
      </div>
    </Link>
  );
};
