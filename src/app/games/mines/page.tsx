import React from 'react';
import { MinesGame } from '@/components/games/mines/MinesGame';

export const metadata = {
  title: 'Mines | Bb.GAME',
  description: 'Reveal safe tiles to increase your multiplier. Avoid hidden mines and cash out anytime. Verifiable outcomes.',
};

export default function MinesPage() {
  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">
          Mines
        </h1>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
          Bb Original Game
        </p>
      </div>
      <MinesGame />
    </div>
  );
}
