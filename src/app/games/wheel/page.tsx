import React from 'react';
import { WheelGame } from '@/components/games/wheel/WheelGame';

export const metadata = {
  title: 'Wheel | Bb.GAME',
  description: 'Spin the segmented wheel with configurable risk and segment counts. Verify every outcome.',
};

export default function WheelPage() {
  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">
          Wheel
        </h1>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
          Bb Original Game
        </p>
      </div>
      <WheelGame />
    </div>
  );
}
