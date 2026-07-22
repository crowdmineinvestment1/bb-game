'use client';

import React, { useState } from 'react';
import { BetControls } from '../BetControls';
import { DiceSlider } from './DiceSlider';
import { BetHistory } from '../BetHistory';
import { ProvablyFairModal } from '../ProvablyFairModal';
import useWalletStore from '@/store/walletStore';
import { useGameStore } from '@/store/gameStore';
import { HelpCircle } from 'lucide-react';

export const DiceGame: React.FC = () => {
  const { selectedCoin, getBalance, updateBalance } = useWalletStore();
  const { clientSeed, nonce, incrementNonce } = useGameStore();

  const [betAmount, setBetAmount] = useState(10);
  const [sliderValue, setSliderValue] = useState(50);
  const [isRollOver, setIsRollOver] = useState(true);
  const [isRolling, setIsRolling] = useState(false);
  const [rollResult, setRollResult] = useState<number | null>(null);
  const [winStatus, setWinStatus] = useState<'win' | 'loss' | null>(null);
  
  const [provablyFairOpen, setProvablyFairOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [rotation, setRotation] = useState({ x: 8, y: 0 }); // 3D camera controls
  const [dice3D, setDice3D] = useState({ x: 30, y: 45, z: 0 }); // 3D Dice rotation angles

  const balance = getBalance(selectedCoin);
  const winChance = isRollOver ? 100 - sliderValue : sliderValue;
  const multiplier = 99 / winChance;

  const handleRoll = async () => {
    if (isRolling || betAmount <= 0 || betAmount > balance) return;
    setIsRolling(true);
    setRollResult(null);
    setWinStatus(null);

    // Deduct bet from balance locally
    updateBalance(selectedCoin, -betAmount);

    // Start rapid 3D rotation
    const spinInterval = setInterval(() => {
      setDice3D(prev => ({
        x: prev.x + Math.floor(Math.random() * 90) + 45,
        y: prev.y + Math.floor(Math.random() * 90) + 45,
        z: prev.z + Math.floor(Math.random() * 90) + 45,
      }));
    }, 45);

    try {
      const response = await fetch('/api/games/dice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          betAmount,
          coin: selectedCoin,
          clientSeed,
          nonce,
          target: sliderValue,
          isRollOver,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Game failed');

      // Ticker animation for number
      let ticks = 0;
      const interval = setInterval(() => {
        setRollResult(Math.random() * 100);
        ticks++;
        if (ticks > 15) {
          clearInterval(interval);
          clearInterval(spinInterval);
          
          // Settle real result
          const finalResult = data.result;
          setRollResult(finalResult);
          
          // Map result to a specific face rotation
          // 0-16.6: Face 1, 16.6-33.3: Face 2, 33.3-50: Face 3, 50-66.6: Face 4, 66.6-83.3: Face 5, 83.3-100: Face 6
          const face = Math.floor(finalResult / 16.67) + 1;
          const targetRotations: Record<number, { x: number, y: number, z: number }> = {
            1: { x: 360, y: 360, z: 360 },       // Front
            2: { x: 360, y: 270, z: 360 },       // Right
            3: { x: 360, y: 180, z: 360 },       // Back
            4: { x: 360, y: 90, z: 360 },        // Left
            5: { x: 270, y: 360, z: 360 },       // Top
            6: { x: 90, y: 360, z: 360 }         // Bottom
          };
          const target = targetRotations[face] || targetRotations[1];
          // Add extra full turns for realism
          setDice3D({
            x: target.x + 720,
            y: target.y + 720,
            z: target.z + 720
          });

          const isWin = data.isWin !== undefined ? data.isWin : (isRollOver ? finalResult > sliderValue : finalResult < sliderValue);
          setWinStatus(isWin ? 'win' : 'loss');

          // Credit balance if win
          if (isWin) {
            updateBalance(selectedCoin, betAmount * multiplier);
          }

          incrementNonce();
          setRefreshKey(prev => prev + 1);
          setIsRolling(false);
        }
      }, 50);

    } catch (err) {
      clearInterval(spinInterval);
      console.error(err);
      // Refund balance on error
      updateBalance(selectedCoin, betAmount);
      setIsRolling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 3D Game Cabinet Box */}
        <div 
          className="lg:col-span-2 bg-gradient-to-b from-[#16222f] to-[#0f1720] border-4 border-blue-500/80 shadow-[0_0_25px_rgba(59,130,246,0.3)] rounded-3xl p-6 md:p-8 flex flex-col justify-between relative min-h-[350px] transition-transform duration-300"
          style={{
            transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.1)'
          }}
        >
          {/* Neon header indicator */}
          <div className="absolute top-2 left-4 text-[9px] font-black text-blue-400 tracking-widest animate-pulse">🎲 3D CLASSIC DICE CABINET 🎲</div>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.2),transparent)] pointer-events-none" />

          {/* Top Panel Actions */}
          <div className="flex justify-between items-center pb-4 border-b border-white/5 relative z-10">
            <button
              onClick={() => setIsRollOver(!isRollOver)}
              className="px-3 py-1.5 bg-[#0b1016] border border-gray-850 rounded-lg text-xs font-bold text-gray-300 hover:text-white select-none uppercase tracking-wider"
            >
              Roll {isRollOver ? 'Over' : 'Under'}
            </button>
            
            <button
              onClick={() => setProvablyFairOpen(true)}
              className="text-gray-500 hover:text-white flex items-center gap-1 text-xs font-bold"
            >
              <HelpCircle size={14} /> Provably Fair
            </button>
          </div>

          {/* Large display of result & 3D Dice */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 flex-1 py-8 relative z-10">
            {/* 3D Dice Object */}
            <div className="w-24 h-24 relative select-none" style={{ perspective: '800px' }}>
              <div 
                className="w-full h-full relative transition-transform ease-out duration-1000"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateX(${dice3D.x}deg) rotateY(${dice3D.y}deg) rotateZ(${dice3D.z}deg)`,
                }}
              >
                {/* 6 faces of the 3D cube */}
                {[
                  { face: 1, style: 'rotateY(0deg) translateZ(48px)', dots: [4] },
                  { face: 2, style: 'rotateY(90deg) translateZ(48px)', dots: [1, 7] },
                  { face: 3, style: 'rotateY(180deg) translateZ(48px)', dots: [1, 4, 7] },
                  { face: 4, style: 'rotateY(-90deg) translateZ(48px)', dots: [0, 2, 6, 8] },
                  { face: 5, style: 'rotateX(90deg) translateZ(48px)', dots: [0, 2, 4, 6, 8] },
                  { face: 6, style: 'rotateX(-90deg) translateZ(48px)', dots: [0, 2, 3, 5, 6, 8] },
                ].map(({ face, style, dots }) => (
                  <div
                    key={face}
                    className="absolute inset-0 bg-[#16222f] border border-blue-500/80 rounded-2xl flex items-center justify-center shadow-[inset_0_0_15px_rgba(59,130,246,0.3)]"
                    style={{
                      transform: style,
                      backfaceVisibility: 'hidden',
                      width: '96px',
                      height: '96px',
                    }}
                  >
                    {/* Dice Dot pattern */}
                    <div className="grid grid-cols-3 gap-2 w-14 h-14">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-center w-3 h-3">
                          {dots.includes(i) && (
                            <div className="w-2.5 h-2.5 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Numeric Display */}
            <div className="flex flex-col items-center sm:items-start">
              <div className={`text-6xl md:text-7xl font-black font-mono tracking-tight transition-all duration-300
                ${winStatus === 'win' ? 'text-accent drop-shadow-[0_0_20px_rgba(0,231,1,0.25)]' : ''}
                ${winStatus === 'loss' ? 'text-red-500' : ''}
                ${!winStatus ? 'text-white' : ''}`}
              >
                {rollResult !== null ? rollResult.toFixed(2) : '50.00'}
              </div>
              
              {winStatus && (
                <span className={`text-xs font-black uppercase tracking-widest mt-2 px-3 py-1 rounded-full border
                  ${winStatus === 'win' ? 'bg-accent/10 border-accent/20 text-accent animate-pulse' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}
                >
                  {winStatus === 'win' ? `Won +${(betAmount * multiplier - betAmount).toFixed(2)}` : 'You Lost'}
                </span>
              )}
            </div>
          </div>

          {/* Slider Controls */}
          <DiceSlider 
            value={sliderValue} 
            onChange={setSliderValue} 
            isRollOver={isRollOver} 
            disabled={isRolling} 
          />

          {/* Camera controls */}
          <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[9px] text-gray-650 font-bold uppercase relative z-10 select-none">
            <span>3D PERSPECTIVE:</span>
            <div className="flex gap-2">
              <button onClick={() => setRotation({ x: rotation.x + 2, y: rotation.y })} className="px-2 py-0.5 bg-black/40 rounded hover:text-white">Tilt Up</button>
              <button onClick={() => setRotation({ x: rotation.x - 2, y: rotation.y })} className="px-2 py-0.5 bg-black/40 rounded hover:text-white">Tilt Down</button>
              <button onClick={() => setRotation({ x: 8, y: 0 })} className="px-2 py-0.5 bg-black/40 rounded hover:text-white">Reset</button>
            </div>
          </div>
        </div>

        {/* Bet Controls Panel */}
        <div className="lg:col-span-1">
          <BetControls
            betAmount={betAmount}
            setBetAmount={setBetAmount}
            onBet={handleRoll}
            isGameRunning={isRolling}
            buttonText={isRolling ? 'ROLLING...' : 'ROLL DICE'}
          />
        </div>
      </div>

      {/* Provably Fair Modal */}
      <ProvablyFairModal isOpen={provablyFairOpen} onClose={() => setProvablyFairOpen(false)} />

      {/* Bet History */}
      <BetHistory gameType="dice" refreshKey={refreshKey} />
    </div>
  );
};
