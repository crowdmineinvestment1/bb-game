'use client';

import React, { useState } from 'react';
import { BetControls } from '../BetControls';
import { BetHistory } from '../BetHistory';
import { ProvablyFairModal } from '../ProvablyFairModal';
import useWalletStore from '@/store/walletStore';
import { useGameStore } from '@/store/gameStore';
import { HelpCircle } from 'lucide-react';
import { Input } from '../../ui/Input';

export const LimboGame: React.FC = () => {
  const { selectedCoin, getBalance, updateBalance } = useWalletStore();
  const { clientSeed, nonce, incrementNonce } = useGameStore();

  const [betAmount, setBetAmount] = useState(10);
  const [targetMultiplier, setTargetMultiplier] = useState(2.0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [finalResult, setFinalResult] = useState<number | null>(null);
  const [winStatus, setWinStatus] = useState<'win' | 'loss' | null>(null);

  const [provablyFairOpen, setProvablyFairOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [rotation, setRotation] = useState({ x: 8, y: 0 }); // 3D camera controls

  const balance = getBalance(selectedCoin);
  const winChance = 99 / targetMultiplier;

  const handleBet = async () => {
    if (isSpinning || betAmount <= 0 || betAmount > balance || targetMultiplier < 1.01) return;

    setIsSpinning(true);
    setFinalResult(null);
    setWinStatus(null);

    // Deduct bet
    updateBalance(selectedCoin, -betAmount);

    try {
      const response = await fetch('/api/games/limbo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          betAmount,
          coin: selectedCoin,
          clientSeed,
          nonce,
          targetMultiplier,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Game failed');

      // Multiplier roll-up animation
      let ticks = 0;
      const interval = setInterval(() => {
        setFinalResult(Math.random() * targetMultiplier * 1.5 + 1.0);
        ticks++;
        if (ticks > 15) {
          clearInterval(interval);
          
          const resultMult = data.multiplier;
          setFinalResult(resultMult);

          const isWin = resultMult >= targetMultiplier;
          setWinStatus(isWin ? 'win' : 'loss');

          if (isWin) {
            updateBalance(selectedCoin, betAmount * targetMultiplier);
          }

          incrementNonce();
          setRefreshKey(prev => prev + 1);
          setIsSpinning(false);
        }
      }, 50);

    } catch (err) {
      console.error(err);
      updateBalance(selectedCoin, betAmount);
      setIsSpinning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 3D Game Cabinet Box */}
        <div 
          className="lg:col-span-2 bg-gradient-to-b from-[#21122a] to-[#0f0914] border-4 border-purple-500/80 shadow-[0_0_25px_rgba(168,85,247,0.3)] rounded-3xl p-6 md:p-8 flex flex-col justify-between relative min-h-[350px] transition-transform duration-300"
          style={{
            transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.1)'
          }}
        >
          {/* Neon header indicator */}
          <div className="absolute top-2 left-4 text-[9px] font-black text-purple-400 tracking-widest animate-pulse">🚀 3D LIMBO CONSOLE 🚀</div>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.2),transparent)] pointer-events-none" />

          {/* Top Panel Actions */}
          <div className="flex justify-between items-center pb-4 border-b border-white/5 relative z-10">
            <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">
              Limbo 3D Sandbox
            </span>
            
            <button
              onClick={() => setProvablyFairOpen(true)}
              className="text-gray-555 hover:text-white flex items-center gap-1 text-xs font-bold"
            >
              <HelpCircle size={14} /> Provably Fair
            </button>
          </div>

          {/* Large display of result */}
          <div className="flex flex-col items-center justify-center flex-1 py-8 relative z-10">
            <div className={`text-6xl md:text-8xl font-black font-mono tracking-tighter transition-all duration-300
              ${winStatus === 'win' ? 'text-accent drop-shadow-[0_0_20px_rgba(0,231,1,0.25)]' : ''}
              ${winStatus === 'loss' ? 'text-red-500' : ''}
              ${!winStatus ? 'text-white' : ''}`}
            >
              {finalResult !== null ? `${finalResult.toFixed(2)}x` : '1.00x'}
            </div>
            
            {winStatus && (
              <span className={`text-xs font-black uppercase tracking-widest mt-2 px-3 py-1 rounded-full border
                ${winStatus === 'win' ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}
              >
                {winStatus === 'win' ? `Won +${(betAmount * targetMultiplier - betAmount).toFixed(2)}` : 'You Lost'}
              </span>
            )}
          </div>

          {/* Target controls */}
          <div className="grid grid-cols-2 gap-3 mt-4 border-t border-white/5 pt-4 relative z-10">
            <Input
              label="Target Multiplier"
              type="number"
              step="0.01"
              min="1.01"
              value={targetMultiplier}
              onChange={(e) => setTargetMultiplier(Math.max(1.01, parseFloat(e.target.value) || 1.01))}
              disabled={isSpinning}
            />
            <div className="bg-[#0b060f] border border-white/5 rounded-lg p-3 text-center flex flex-col justify-center">
              <span className="text-[9px] text-gray-555 font-bold uppercase tracking-wider block">
                Win Chance
              </span>
              <span className="text-sm font-black text-white">{winChance.toFixed(2)}%</span>
            </div>
          </div>

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
            onBet={handleBet}
            isGameRunning={isSpinning}
            buttonText={isSpinning ? 'WAITING...' : 'PLACE BET'}
          />
        </div>
      </div>

      {/* Provably Fair Modal */}
      <ProvablyFairModal isOpen={provablyFairOpen} onClose={() => setProvablyFairOpen(false)} />

      {/* Bet History */}
      <BetHistory gameType="limbo" refreshKey={refreshKey} />
    </div>
  );
};
