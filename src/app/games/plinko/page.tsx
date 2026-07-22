import React from 'react';
import { PlinkoGame } from '@/components/games/plinko/PlinkoGame';

export const metadata = {
  title: 'Plinko | Bb.GAME',
  description: 'Drop balls through pegs and land them in high-multiplier buckets. Verifiable provably fair outcomes.',
};

export default function PlinkoPage() {
  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">
          Plinko
        </h1>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
          Bb Original Game
        </p>
      </div>
      <PlinkoGame />
    </div>
  );
}
