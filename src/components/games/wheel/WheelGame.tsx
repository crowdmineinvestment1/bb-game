'use client';

import React, { useState } from 'react';
import { BetControls } from '../BetControls';
import { WheelCanvas } from './WheelCanvas';
import { BetHistory } from '../BetHistory';
import { ProvablyFairModal } from '../ProvablyFairModal';
import useWalletStore from '@/store/walletStore';
import { useGameStore } from '@/store/gameStore';
import { PlinkoRisk, getWheelSegments } from '@/lib/provably-fair';
import { HelpCircle } from 'lucide-react';

export const WheelGame: React.FC = () => {
  const { selectedCoin, getBalance, updateBalance } = useWalletStore();
  const { clientSeed, nonce, incrementNonce } = useGameStore();

  const [betAmount, setBetAmount] = useState(10);
  const [segmentCount, setSegmentCount] = useState<number>(10);
  const [risk, setRisk] = useState<PlinkoRisk>('medium');
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [targetSegment, setTargetSegment] = useState<number | null>(null);
  const [winStatus, setWinStatus] = useState<'win' | 'loss' | null>(null);
  const [wonMultiplier, setWonMultiplier] = useState<number | null>(null);

  const [provablyFairOpen, setProvablyFairOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [rotation, setRotation] = useState({ x: 8, y: 0 }); // 3D camera controls

  const balance = getBalance(selectedCoin);
  const segments = getWheelSegments(segmentCount, risk);

  const handleSpin = async () => {
    if (isSpinning || betAmount <= 0 || betAmount > balance) return;
    
    setIsSpinning(true);
    setTargetSegment(null);
    setWinStatus(null);
    setWonMultiplier(null);

    // Deduct bet from balance
    updateBalance(selectedCoin, -betAmount);

    try {
      const response = await fetch('/api/games/wheel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          betAmount,
          coin: selectedCoin,
          clientSeed,
          nonce,
          segmentCount,
          risk,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Game failed');

      // Set target segment to trigger landing animation on canvas
      setTargetSegment(data.segment);
      setWonMultiplier(segments[data.segment].multiplier);

    } catch (err) {
      console.error(err);
      updateBalance(selectedCoin, betAmount);
      setIsSpinning(false);
    }
  };

  const handleSpinFinish = () => {
    if (wonMultiplier !== null && wonMultiplier > 0) {
      // Won
      setWinStatus('win');
      updateBalance(selectedCoin, betAmount * wonMultiplier);
    } else {
      // Lost or 0x multiplier
      setWinStatus('loss');
    }

    incrementNonce();
    setRefreshKey(prev => prev + 1);
    setIsSpinning(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 3D Game Cabinet Box */}
        <div 
          className="lg:col-span-2 bg-gradient-to-b from-[#2a2212] to-[#120f09] border-4 border-yellow-500/80 shadow-[0_0_25px_rgba(245,158,11,0.3)] rounded-3xl p-6 md:p-8 flex flex-col justify-between relative min-h-[420px] transition-transform duration-300"
          style={{
            transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.1)'
          }}
        >
          {/* Neon header indicator */}
          <div className="absolute top-2 left-4 text-[9px] font-black text-yellow-400 tracking-widest animate-pulse">🔮 3D WHEEL CABINET 🔮</div>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.2),transparent)] pointer-events-none" />

          {/* Top Panel Actions */}
          <div className="flex justify-between items-center pb-4 border-b border-white/5 relative z-10">
            <div className="flex gap-2">
              {/* Segments count */}
              <div className="flex items-center gap-1.5 bg-[#120f09] border border-white/5 rounded-lg px-2.5 py-1">
                <span className="text-[10px] text-gray-555 font-bold uppercase">Segments:</span>
                <select
                  value={segmentCount}
                  onChange={(e) => setSegmentCount(parseInt(e.target.value))}
                  disabled={isSpinning}
                  className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
                >
                  {[10, 20, 30, 40, 50].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Risk selector */}
              <div className="flex items-center gap-1.5 bg-[#120f09] border border-white/5 rounded-lg px-2.5 py-1">
                <span className="text-[10px] text-gray-555 font-bold uppercase">Risk:</span>
                <select
                  value={risk}
                  onChange={(e) => setRisk(e.target.value as PlinkoRisk)}
                  disabled={isSpinning}
                  className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer capitalize"
                >
                  {['low', 'medium', 'high'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <button
              onClick={() => setProvablyFairOpen(true)}
              className="text-gray-500 hover:text-white flex items-center gap-1 text-xs font-bold"
            >
              <HelpCircle size={14} /> Provably Fair
            </button>
          </div>

          {/* Canvas Wheel display */}
          <div className="flex-1 flex flex-col items-center justify-center py-6 relative z-10">
            <WheelCanvas
              segmentCount={segmentCount}
              risk={risk}
              targetSegmentIndex={targetSegment}
              isSpinning={isSpinning}
              onFinish={handleSpinFinish}
            />

            {winStatus && (
              <span className={`text-xs font-black uppercase tracking-widest mt-4 px-3 py-1 rounded-full border
                ${winStatus === 'win' ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}
              >
                {winStatus === 'win' 
                  ? `Won +${(betAmount * (wonMultiplier || 0) - betAmount).toFixed(2)} (${wonMultiplier}x)` 
                  : '0x Loss'}
              </span>
            )}
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
            onBet={handleSpin}
            isGameRunning={isSpinning}
            buttonText={isSpinning ? 'SPINNING...' : 'SPIN WHEEL'}
          />
        </div>
      </div>

      {/* Provably Fair Modal */}
      <ProvablyFairModal isOpen={provablyFairOpen} onClose={() => setProvablyFairOpen(false)} />

      {/* Bet History */}
      <BetHistory gameType="wheel" refreshKey={refreshKey} />
    </div>
  );
};
