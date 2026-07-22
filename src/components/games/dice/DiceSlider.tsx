'use client';

import React from 'react';

interface DiceSliderProps {
  value: number;
  onChange: (value: number) => void;
  isRollOver: boolean;
  disabled?: boolean;
}

export const DiceSlider: React.FC<DiceSliderProps> = ({
  value,
  onChange,
  isRollOver,
  disabled = false,
}) => {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onChange(val);
  };

  // Determine percentages for coloring
  const winPercent = isRollOver ? 100 - value : value;
  const greenLeft = isRollOver ? value : 0;
  const greenWidth = isRollOver ? 100 - value : value;

  return (
    <div className="space-y-6 py-4">
      {/* Slider Track container */}
      <div className="relative h-6 bg-red-600 rounded-full overflow-hidden border border-gray-900 shadow-inner">
        {/* Win Zone (Green) */}
        <div 
          className="absolute top-0 bottom-0 bg-accent transition-all duration-150"
          style={{ 
            left: `${greenLeft}%`, 
            width: `${greenWidth}%` 
          }}
        />

        {/* Real slider input overlay */}
        <input
          type="range"
          min="2"
          max="98"
          step="1"
          value={value}
          onChange={handleSliderChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        {/* Floating Tick markers */}
        <div className="absolute inset-0 flex justify-between px-6 items-center pointer-events-none text-[10px] font-black text-white/50 select-none font-mono">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </div>

      {/* Target stats display */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-primary/40 border border-gray-800 rounded-lg p-3 text-center">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
            Roll {isRollOver ? 'Over' : 'Under'}
          </span>
          <span className="text-sm font-black text-white">{value.toFixed(0)}</span>
        </div>
        
        <div className="bg-primary/40 border border-gray-800 rounded-lg p-3 text-center">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
            Win Chance
          </span>
          <span className="text-sm font-black text-accent">{winPercent.toFixed(2)}%</span>
        </div>

        <div className="bg-primary/40 border border-gray-800 rounded-lg p-3 text-center">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
            Multiplier
          </span>
          <span className="text-sm font-black text-white">
            {(99 / winPercent).toFixed(4)}x
          </span>
        </div>
      </div>
    </div>
  );
};
