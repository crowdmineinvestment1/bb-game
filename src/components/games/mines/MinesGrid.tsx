'use client';

import React from 'react';
import { ShieldAlert, Gem } from 'lucide-react';

interface MinesGridProps {
  revealedTiles: number[];
  minePositions: number[];
  hitMineIndex: number | null;
  onReveal: (index: number) => void;
  disabled: boolean;
}

export const MinesGrid: React.FC<MinesGridProps> = ({
  revealedTiles,
  minePositions,
  hitMineIndex,
  onReveal,
  disabled,
}) => {
  const gridSize = 25; // 5x5 grid

  const getTileContent = (index: number) => {
    const isRevealed = revealedTiles.includes(index);
    const isMine = minePositions.includes(index);
    const isExploded = hitMineIndex === index;

    if (isRevealed) {
      if (isMine) {
        return (
          <div className="w-full h-full flex items-center justify-center bg-red-600 rounded-lg text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]">
            <ShieldAlert size={20} />
          </div>
        );
      } else {
        return (
          <div className="w-full h-full flex items-center justify-center bg-accent/25 border border-accent/40 rounded-lg text-accent shadow-[0_0_15px_rgba(0,231,1,0.2)]">
            <Gem size={20} className="animate-bounce" />
          </div>
        );
      }
    }

    // Game is over, show remaining mines that weren't clicked
    if (minePositions.length > 0 && isMine) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-red-950/40 border border-red-500/20 rounded-lg text-red-500/60">
          <ShieldAlert size={16} />
        </div>
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-primary/40 border border-gray-800 group-hover:border-gray-700 rounded-lg text-gray-500 font-bold transition-all duration-200">
        ?
      </div>
    );
  };

  return (
    <div className="grid grid-cols-5 gap-2 max-w-[360px] mx-auto aspect-square bg-[#0d161f] border border-gray-850 p-3 rounded-2xl shadow-inner">
      {Array.from({ length: gridSize }).map((_, index) => {
        const isRevealed = revealedTiles.includes(index);
        const clickable = !isRevealed && !disabled;

        return (
          <button
            key={index}
            onClick={() => clickable && onReveal(index)}
            disabled={!clickable}
            className={`aspect-square relative p-0.5 rounded-lg group select-none transition-transform active:scale-95 disabled:active:scale-100 focus:outline-none`}
          >
            {getTileContent(index)}
          </button>
        );
      })}
    </div>
  );
};
