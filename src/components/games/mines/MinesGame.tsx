'use client';

import React, { useState } from 'react';
import { BetControls } from '../BetControls';
import { MinesGrid } from './MinesGrid';
import { BetHistory } from '../BetHistory';
import { ProvablyFairModal } from '../ProvablyFairModal';
import useWalletStore from '@/store/walletStore';
import { useGameStore } from '@/store/gameStore';
import { HelpCircle } from 'lucide-react';
import { Button } from '../../ui/Button';

export const MinesGame: React.FC = () => {
  const { selectedCoin, getBalance, updateBalance } = useWalletStore();
  const { clientSeed, nonce, incrementNonce } = useGameStore();

  const [betAmount, setBetAmount] = useState(10);
  const [mineCount, setMineCount] = useState<number>(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);
  
  // Game session states
  const [revealedTiles, setRevealedTiles] = useState<number[]>([]);
  const [minePositions, setMinePositions] = useState<number[]>([]);
  const [hitMineIndex, setHitMineIndex] = useState<number | null>(null);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [nextMultiplier, setNextMultiplier] = useState(1.0);
  
  const [provablyFairOpen, setProvablyFairOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [rotation, setRotation] = useState({ x: 8, y: 0 }); // 3D camera controls
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const balance = getBalance(selectedCoin);

  const handleStart = async () => {
    if (isPlaying || betAmount <= 0 || betAmount > balance) return;
    
    setIsPlaying(true);
    setGameId(null);
    setRevealedTiles([]);
    setMinePositions([]);
    setHitMineIndex(null);
    setCurrentMultiplier(1.0);
    setStatusMessage(null);

    // Deduct bet from balance
    updateBalance(selectedCoin, -betAmount);

    try {
      const response = await fetch('/api/games/mines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          amount: betAmount,
          currency: selectedCoin,
          clientSeed,
          mineCount,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to start game');

      setGameId(data.gameId);
      setCurrentMultiplier(1.0);
      setNextMultiplier(data.nextMultiplier);
    } catch (err: any) {
      console.error(err);
      // Refund balance
      updateBalance(selectedCoin, betAmount);
      setIsPlaying(false);
      setStatusMessage(err.message || 'Error starting game');
    }
  };

  const handleReveal = async (tileIndex: number) => {
    if (!isPlaying || !gameId) return;

    try {
      const response = await fetch('/api/games/mines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reveal',
          gameId,
          tileIndex,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Reveal failed');

      if (data.isMine) {
        // Exploded!
        setRevealedTiles(data.revealedTiles);
        setMinePositions(data.minePositions);
        setHitMineIndex(tileIndex);
        setIsPlaying(false);
        setStatusMessage('Boom! You hit a mine!');
        incrementNonce();
        setRefreshKey(prev => prev + 1);
      } else {
        // Safe tile
        setRevealedTiles(data.revealedTiles);
        setCurrentMultiplier(data.currentMultiplier);
        setNextMultiplier(data.nextMultiplier);

        if (data.gameOver && data.allSafeRevealed) {
          // Completed the grid safely
          setMinePositions(data.minePositions);
          setIsPlaying(false);
          updateBalance(selectedCoin, data.payout);
          setStatusMessage(`Victory! Clean Sweep +${(data.payout - betAmount).toFixed(2)}`);
          incrementNonce();
          setRefreshKey(prev => prev + 1);
        }
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleCashout = async () => {
    if (!isPlaying || !gameId || revealedTiles.length === 0) return;

    try {
      const response = await fetch('/api/games/mines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cashout',
          gameId,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Cashout failed');

      setMinePositions(data.minePositions);
      setIsPlaying(false);
      updateBalance(selectedCoin, data.payout);
      setStatusMessage(`Cashed out +${(data.payout - betAmount).toFixed(2)}`);
      incrementNonce();
      setRefreshKey(prev => prev + 1);
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 3D Game Cabinet Box */}
        <div 
          className="lg:col-span-2 bg-gradient-to-b from-[#122b1c] to-[#08140e] border-4 border-emerald-500/80 shadow-[0_0_25px_rgba(16,185,129,0.3)] rounded-3xl p-6 md:p-8 flex flex-col justify-between relative min-h-[420px] transition-transform duration-300"
          style={{
            transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.1)'
          }}
        >
          {/* Neon header indicator */}
          <div className="absolute top-2 left-4 text-[9px] font-black text-emerald-400 tracking-widest animate-pulse">💎 3D MINES CABINET 💎</div>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.2),transparent)] pointer-events-none" />

          {/* Top Panel Actions */}
          <div className="flex justify-between items-center pb-4 border-b border-white/5 relative z-10">
            <div className="flex items-center gap-2 bg-[#08140e] border border-white/5 rounded-lg px-2.5 py-1">
              <span className="text-[10px] text-gray-500 font-bold uppercase">Mines:</span>
              <select
                value={mineCount}
                onChange={(e) => setMineCount(parseInt(e.target.value))}
                disabled={isPlaying}
                className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
              >
                {Array.from({ length: 24 }, (_, i) => i + 1).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={() => setProvablyFairOpen(true)}
              className="text-gray-500 hover:text-white flex items-center gap-1 text-xs font-bold"
            >
              <HelpCircle size={14} /> Provably Fair
            </button>
          </div>

          {/* Mines Grid display */}
          <div className="flex-1 flex flex-col items-center justify-center py-6 relative z-10">
            <MinesGrid
              revealedTiles={revealedTiles}
              minePositions={minePositions}
              hitMineIndex={hitMineIndex}
              onReveal={handleReveal}
              disabled={!isPlaying}
            />

            {statusMessage && (
              <span className="text-xs font-black uppercase tracking-widest mt-4 text-accent">
                {statusMessage}
              </span>
            )}
          </div>

          {/* Multiplier stats */}
          {isPlaying && revealedTiles.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-4 border-t border-white/5 pt-4 bg-[#08140e] p-3 rounded-xl border border-white/5 relative z-10">
              <div className="text-center border-r border-white/5">
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">
                  Current Multiplier
                </span>
                <span className="text-sm font-black text-accent">{currentMultiplier.toFixed(2)}x</span>
              </div>
              <div className="text-center">
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">
                  Next Multiplier
                </span>
                <span className="text-sm font-black text-white">{nextMultiplier.toFixed(2)}x</span>
              </div>
            </div>
          )}

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
          {isPlaying && revealedTiles.length > 0 ? (
            <div className="bg-secondary/40 border border-gray-800/80 rounded-xl p-5 flex flex-col gap-4 shadow-xl">
              <div className="text-center py-2">
                <span className="text-xs text-gray-400 font-bold block uppercase mb-1">Potential Payout</span>
                <span className="text-2xl font-black text-accent">
                  {(betAmount * currentMultiplier).toFixed(4)} <span className="text-xs uppercase text-gray-400">{selectedCoin}</span>
                </span>
              </div>
              <Button
                onClick={handleCashout}
                variant="primary"
                size="lg"
                className="w-full font-black py-4 uppercase tracking-widest"
              >
                CASH OUT ({currentMultiplier.toFixed(2)}x)
              </Button>
            </div>
          ) : (
            <BetControls
              betAmount={betAmount}
              setBetAmount={setBetAmount}
              onBet={handleStart}
              isGameRunning={isPlaying}
              buttonText="START GAME"
            />
          )}
        </div>
      </div>

      {/* Provably Fair Modal */}
      <ProvablyFairModal isOpen={provablyFairOpen} onClose={() => setProvablyFairOpen(false)} />

      {/* Bet History */}
      <BetHistory gameType="mines" refreshKey={refreshKey} />
    </div>
  );
};
