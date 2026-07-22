import React from 'react';
import { DiceGame } from '@/components/games/dice/DiceGame';

export const metadata = {
  title: 'Dice | Bb.GAME',
  description: 'Roll dice, adjust your multiplier and win chance, and verify outcomes with our provably fair engine.',
};

export default function DicePage() {
  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">
          Dice
        </h1>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
          Bb Original Game
        </p>
      </div>
      <DiceGame />
    </div>
  );
}
