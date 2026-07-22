import React from 'react';
import { LimboGame } from '@/components/games/limbo/LimboGame';

export const metadata = {
  title: 'Limbo | Bb.GAME',
  description: 'Bet on target multipliers and win if the generated multiplier exceeds your target. Fully verifiable RNG.',
};

export default function LimboPage() {
  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">
          Limbo
        </h1>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
          Bb Original Game
        </p>
      </div>
      <LimboGame />
    </div>
  );
}
