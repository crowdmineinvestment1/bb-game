'use client';

import React, { useState, useRef } from 'react';
import { BetControls } from '../BetControls';
import { PlinkoBoard, PlinkoBoardRef } from './PlinkoBoard';
import { BetHistory } from '../BetHistory';
import { ProvablyFairModal } from '../ProvablyFairModal';
import useWalletStore from '@/store/walletStore';
import { useGameStore } from '@/store/gameStore';
import { PlinkoRisk } from '@/lib/provably-fair';
import { HelpCircle } from 'lucide-react';

export const PlinkoGame: React.FC = () => {
  const { selectedCoin, getBalance, updateBalance } = useWalletStore();
  const { clientSeed, nonce, incrementNonce } = useGameStore();

  const [betAmount, setBetAmount] = useState(10);
  const [rows, setRows] = useState<number>(8);
  const [risk, setRisk] = useState<PlinkoRisk>('medium');
  const [isDropping, setIsDropping] = useState(false);
  const [provablyFairOpen, setProvablyFairOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [rotation, setRotation] = useState({ x: 8, y: 0 }); // 3D camera controls

  const boardRef = useRef<PlinkoBoardRef>(null);
  const balance = getBalance(selectedCoin);

  const handleDrop = async () => {
    if (betAmount <= 0 || betAmount > balance) return;
    
    // Set dropping state briefly to lock UI during call
    setIsDropping(true);

    // Deduct bet from balance
    updateBalance(selectedCoin, -betAmount);

    try {
      const response = await fetch('/api/games/plinko', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          betAmount,
          coin: selectedCoin,
          clientSeed,
          nonce,
          rows,
          risk,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Game failed');

      // Trigger ball drop on canvas with backend path
      boardRef.current?.dropBall(data.path);
      
      incrementNonce();
      
      // Let player drop multiple balls by setting dropping state back quickly
      setTimeout(() => {
        setIsDropping(false);
      }, 200);

    } catch (err) {
      console.error(err);
      // Refund balance
      updateBalance(selectedCoin, betAmount);
      setIsDropping(false);
    }
  };

  const handleBallLand = (bucketIndex: number, multiplier: number) => {
    // Add win to balance
    updateBalance(selectedCoin, betAmount * multiplier);
    
    // Refresh bet history table
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 3D Game Cabinet Box */}
        <div 
          className="lg:col-span-2 bg-gradient-to-b from-[#2a121d] to-[#12080d] border-4 border-pink-500/80 shadow-[0_0_25px_rgba(236,72,153,0.3)] rounded-3xl p-6 md:p-8 flex flex-col justify-between relative min-h-[450px] transition-transform duration-300"
          style={{
            transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.1)'
          }}
        >
          {/* Neon header indicator */}
          <div className="absolute top-2 left-4 text-[9px] font-black text-pink-400 tracking-widest animate-pulse">🔮 3D PLINKO CABINET 🔮</div>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.2),transparent)] pointer-events-none" />

          {/* Top panel */}
          <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4 relative z-10">
            <div className="flex gap-2">
              {/* Row Selector */}
              <div className="flex items-center gap-1.5 bg-[#12080d] border border-white/5 rounded-lg px-2.5 py-1">
                <span className="text-[10px] text-gray-500 font-bold uppercase">Rows:</span>
                <select
                  value={rows}
                  onChange={(e) => setRows(parseInt(e.target.value))}
                  disabled={isDropping}
                  className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
                >
                  {[8, 10, 12, 14, 16].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Risk Selector */}
              <div className="flex items-center gap-1.5 bg-[#12080d] border border-white/5 rounded-lg px-2.5 py-1">
                <span className="text-[10px] text-gray-500 font-bold uppercase">Risk:</span>
                <select
                  value={risk}
                  onChange={(e) => setRisk(e.target.value as PlinkoRisk)}
                  disabled={isDropping}
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
              className="text-gray-555 hover:text-white flex items-center gap-1 text-xs font-bold"
            >
              <HelpCircle size={14} /> Provably Fair
            </button>
          </div>

          {/* Canvas Board */}
          <div className="flex-1 relative z-10">
            <PlinkoBoard
              ref={boardRef}
              rows={rows}
              risk={risk}
              onFinish={handleBallLand}
            />
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

        {/* Bet controls */}
        <div className="lg:col-span-1">
          <BetControls
            betAmount={betAmount}
            setBetAmount={setBetAmount}
            onBet={handleDrop}
            isGameRunning={false} // Allow consecutive drops!
            buttonText="DROP BALL"
            disabled={isDropping}
          />
        </div>
      </div>

      {/* Provably Fair Modal */}
      <ProvablyFairModal isOpen={provablyFairOpen} onClose={() => setProvablyFairOpen(false)} />

      {/* Bet History */}
      <BetHistory gameType="plinko" refreshKey={refreshKey} />
    </div>
  );
};
