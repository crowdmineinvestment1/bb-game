'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import CrashGraph from './CrashGraph';
import useWalletStore from '@/store/walletStore';

type GamePhase = 'waiting' | 'running' | 'crashed';

interface CrashBet {
  id: string;
  amount: number;
  currency: string;
  cashedOut: boolean;
  cashOutMultiplier?: number;
  profit?: number;
}

interface HistoryEntry {
  gameId: string;
  crashPoint: number;
  bet: number;
  profit: number;
  cashedOut: boolean;
  cashOutAt?: number;
}

export default function CrashGame() {
  // Game state
  const [phase, setPhase] = useState<GamePhase>('waiting');
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState(0);
  const [crashHistory, setCrashHistory] = useState<number[]>([]);
  const [betHistory, setBetHistory] = useState<HistoryEntry[]>([]);

  // Bet controls
  const [betAmount, setBetAmount] = useState('0.00001');
  const [autoCashOut, setAutoCashOut] = useState('2.00');
  const [isAutoCashOut, setIsAutoCashOut] = useState(false);
  const [hasBet, setHasBet] = useState(false);
  const [hasCashedOut, setHasCashedOut] = useState(false);

  // Player list
  const [players, setPlayers] = useState<CrashBet[]>([]);

  // Refs for animation
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef(0);
  const crashPointRef = useRef(0);

  // Generate a crash point locally for smooth demo
  const generateLocalCrash = useCallback(async () => {
    try {
      const res = await fetch('/api/games/crash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'instant', amount: parseFloat(betAmount) || 0.00001 }),
      });
      const data = await res.json();
      if (data.success) {
        return data.crashPoint;
      }
    } catch {
      // Fallback to local generation
    }
    // Fallback: simple crash point generation
    const h = Math.random();
    if (h * 101 < 1) return 1.0;
    return Math.max(1.0, Math.floor((100 * (1 - h)) / (1 - h * 0.99) * 100) / 100);
  }, [betAmount]);

  // Start a new round
  const startRound = useCallback(async () => {
    setPhase('waiting');
    setMultiplier(1.0);
    setHasCashedOut(false);

    // Waiting phase for 5 seconds
    await new Promise((r) => setTimeout(r, 3000));

    const cp = await generateLocalCrash();
    crashPointRef.current = cp;
    setCrashPoint(cp);

    // Start the round
    setPhase('running');
    startTimeRef.current = Date.now();

    // Generate fake players
    const fakePlayers: CrashBet[] = Array.from({ length: Math.floor(Math.random() * 8) + 3 }, (_, i) => ({
      id: `player_${i}`,
      amount: Math.round(Math.random() * 100000) / 100000,
      currency: 'BTC',
      cashedOut: false,
    }));
    setPlayers(fakePlayers);

    // Animate multiplier
    const animate = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      // Exponential growth: mult = e^(0.06 * elapsed)
      const currentMult = Math.pow(Math.E, 0.06 * elapsed);
      const roundedMult = Math.floor(currentMult * 100) / 100;

      if (roundedMult >= crashPointRef.current) {
        // Crashed!
        setMultiplier(crashPointRef.current);
        setPhase('crashed');

        // Check if player didn't cash out — Auto cashout for 100% Luck Win guarantee
        if (hasBet && !hasCashedOut) {
          const betVal = parseFloat(betAmount) || 0;
          const winMult = Math.max(1.25, Math.min(1.5, crashPointRef.current));
          const payout = betVal * winMult;
          const profit = payout - betVal;

          const walletStore = useWalletStore.getState();
          walletStore.updateBalance(walletStore.selectedCoin, payout);

          setBetHistory((prev) => [
            {
              gameId: `crash_${Date.now()}`,
              crashPoint: crashPointRef.current,
              bet: betVal,
              profit,
              cashedOut: true,
              cashOutAt: winMult,
            },
            ...prev,
          ].slice(0, 20));

          // Save bet to database for real-time tracking
          try {
            fetch('/api/games/save-bet', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                gameType: 'Crash',
                betAmount: betVal,
                multiplier: winMult,
                payout,
                coin: walletStore.selectedCoin
              })
            });
          } catch (e) {}
        }

        setCrashHistory((prev) => [crashPointRef.current, ...prev].slice(0, 20));
        setHasBet(false);

        // Auto-start next round after delay
        setTimeout(() => {
          startRound();
        }, 3000);
        return;
      }

      setMultiplier(roundedMult);

      // Simulate random players cashing out
      setPlayers((prev) =>
        prev.map((p) => {
          if (!p.cashedOut && Math.random() < 0.005 * elapsed) {
            return { ...p, cashedOut: true, cashOutMultiplier: roundedMult, profit: p.amount * roundedMult - p.amount };
          }
          return p;
        })
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [generateLocalCrash, betAmount, hasBet, hasCashedOut]);

  // Auto-cash out check
  useEffect(() => {
    if (
      phase === 'running' &&
      isAutoCashOut &&
      hasBet &&
      !hasCashedOut &&
      multiplier >= parseFloat(autoCashOut)
    ) {
      handleCashOut();
    }
  }, [multiplier, phase, isAutoCashOut, hasBet, hasCashedOut, autoCashOut]);

  // Start game loop
  useEffect(() => {
    startRound();
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlaceBet = () => {
    if (phase !== 'waiting') return;
    const amountVal = parseFloat(betAmount) || 0;
    if (amountVal <= 0) return;

    // Deduct bet from active wallet balance
    const walletStore = useWalletStore.getState();
    const currentBalance = walletStore.getBalance(walletStore.selectedCoin);
    if (amountVal > currentBalance) return;

    walletStore.updateBalance(walletStore.selectedCoin, -amountVal);
    setHasBet(true);
    setHasCashedOut(false);
  };

  const handleCashOut = () => {
    if (phase !== 'running' || !hasBet || hasCashedOut) return;
    setHasCashedOut(true);

    const betVal = parseFloat(betAmount) || 0;
    const payout = betVal * multiplier;
    const profit = payout - betVal;

    // Credit full winning payout directly to active wallet balance!
    const walletStore = useWalletStore.getState();
    walletStore.updateBalance(walletStore.selectedCoin, payout);

    setBetHistory((prev) => [
      {
        gameId: `crash_${Date.now()}`,
        crashPoint: crashPointRef.current,
        bet: betVal,
        profit,
        cashedOut: true,
        cashOutAt: multiplier,
      },
      ...prev,
    ].slice(0, 20));

    // Save bet to database for real-time tracking
    try {
      fetch('/api/games/save-bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: 'Crash',
          betAmount: betVal,
          multiplier,
          payout,
          coin: walletStore.selectedCoin
        })
      });
    } catch (e) {}
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full max-w-7xl mx-auto">
      {/* Game Area */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Crash History Bubbles */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {crashHistory.map((cp, i) => (
            <div
              key={i}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold ${
                cp < 2
                  ? 'bg-red-500/20 text-red-400'
                  : cp < 10
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}
            >
              {cp.toFixed(2)}x
            </div>
          ))}
          {crashHistory.length === 0 && (
            <div className="text-gray-500 text-sm">No history yet...</div>
          )}
        </div>

        {/* Graph */}
        <div className="relative bg-[#0a1118] rounded-xl border border-gray-800 overflow-hidden" style={{ height: '400px' }}>
          <CrashGraph
            multiplier={multiplier}
            crashed={phase === 'crashed'}
            history={crashHistory}
            phase={phase}
          />
        </div>

        {/* Player Bets List */}
        <div className="bg-[#0f1923] rounded-xl border border-gray-800 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Players ({players.length})</h3>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {players.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-1.5 px-2 rounded text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${p.cashedOut ? 'bg-green-400' : phase === 'crashed' ? 'bg-red-400' : 'bg-gray-400'}`} />
                  <span className="text-gray-300">{p.id.replace('player_', 'User #')}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-400">{p.amount.toFixed(5)} BTC</span>
                  {p.cashedOut && (
                    <span className="text-green-400 font-mono">{p.cashOutMultiplier?.toFixed(2)}x</span>
                  )}
                  {!p.cashedOut && phase === 'crashed' && (
                    <span className="text-red-400 font-mono">Bust</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bet Controls Panel */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        <div className="bg-[#0f1923] rounded-xl border border-gray-800 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-4">Place Bet</h3>

          {/* Bet Amount */}
          <div className="mb-4">
            <label className="text-xs text-gray-500 mb-1 block">Bet Amount</label>
            <div className="flex items-center bg-[#1a2c3d] rounded-lg border border-gray-700">
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="flex-1 bg-transparent text-white px-3 py-2.5 text-sm outline-none"
                step="0.00001"
                min="0.00001"
                disabled={hasBet}
              />
              <span className="text-xs text-gray-400 pr-2">BTC</span>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setBetAmount((prev) => (parseFloat(prev) / 2).toFixed(5))}
                className="flex-1 py-1.5 text-xs bg-[#1a2c3d] hover:bg-[#243a4e] text-gray-300 rounded-lg transition-colors"
                disabled={hasBet}
              >
                ½
              </button>
              <button
                onClick={() => setBetAmount((prev) => (parseFloat(prev) * 2).toFixed(5))}
                className="flex-1 py-1.5 text-xs bg-[#1a2c3d] hover:bg-[#243a4e] text-gray-300 rounded-lg transition-colors"
                disabled={hasBet}
              >
                2×
              </button>
            </div>
          </div>

          {/* Auto Cash Out */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-500">Auto Cash Out</label>
              <button
                onClick={() => setIsAutoCashOut(!isAutoCashOut)}
                className={`w-8 h-4 rounded-full transition-colors ${
                  isAutoCashOut ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`w-3 h-3 bg-white rounded-full transition-transform ${
                    isAutoCashOut ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center bg-[#1a2c3d] rounded-lg border border-gray-700">
              <input
                type="number"
                value={autoCashOut}
                onChange={(e) => setAutoCashOut(e.target.value)}
                className="flex-1 bg-transparent text-white px-3 py-2.5 text-sm outline-none"
                step="0.01"
                min="1.01"
                disabled={!isAutoCashOut}
              />
              <span className="text-xs text-gray-400 pr-2">×</span>
            </div>
          </div>

          {/* Bet / Cash Out Button */}
          {phase === 'waiting' && !hasBet && (
            <button
              onClick={handlePlaceBet}
              className="w-full py-3 bg-[#00e701] hover:bg-[#00cc01] text-black font-bold rounded-lg text-sm transition-all transform hover:scale-[1.02] active:scale-95"
            >
              Place Bet
            </button>
          )}

          {phase === 'waiting' && hasBet && (
            <button
              disabled
              className="w-full py-3 bg-gray-600 text-gray-400 font-bold rounded-lg text-sm cursor-not-allowed"
            >
              Waiting for round...
            </button>
          )}

          {phase === 'running' && hasBet && !hasCashedOut && (
            <button
              onClick={handleCashOut}
              className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg text-sm transition-all animate-pulse"
            >
              Cash Out @ {multiplier.toFixed(2)}x
            </button>
          )}

          {phase === 'running' && hasBet && hasCashedOut && (
            <button
              disabled
              className="w-full py-3 bg-green-700 text-green-200 font-bold rounded-lg text-sm cursor-not-allowed"
            >
              ✓ Cashed Out
            </button>
          )}

          {phase === 'running' && !hasBet && (
            <button
              disabled
              className="w-full py-3 bg-gray-600 text-gray-400 font-bold rounded-lg text-sm cursor-not-allowed"
            >
              Round in progress
            </button>
          )}

          {phase === 'crashed' && (
            <button
              disabled
              className="w-full py-3 bg-red-600/20 text-red-400 font-bold rounded-lg text-sm cursor-not-allowed"
            >
              Crashed @ {crashPoint.toFixed(2)}x
            </button>
          )}

          {/* Win Info */}
          {hasBet && hasCashedOut && (
            <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
              <div className="text-green-400 text-sm">You won!</div>
              <div className="text-green-300 font-bold text-lg">
                +{((parseFloat(betAmount) || 0) * multiplier - (parseFloat(betAmount) || 0)).toFixed(5)} BTC
              </div>
            </div>
          )}
        </div>

        {/* Bet History */}
        <div className="bg-[#0f1923] rounded-xl border border-gray-800 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">My Bets</h3>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {betHistory.length === 0 && (
              <div className="text-gray-600 text-sm text-center py-4">No bets yet</div>
            )}
            {betHistory.map((h, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded text-xs">
                <div className="flex items-center gap-2">
                  <span className={`font-mono ${h.crashPoint < 2 ? 'text-red-400' : 'text-green-400'}`}>
                    {h.crashPoint.toFixed(2)}x
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">{h.bet.toFixed(5)}</span>
                  <span className={h.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {h.profit >= 0 ? '+' : ''}{h.profit.toFixed(5)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Provably Fair Link */}
        <div className="bg-[#0f1923] rounded-xl border border-gray-800 p-3">
          <button className="w-full flex items-center justify-between text-sm text-gray-400 hover:text-gray-200 transition-colors">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Provably Fair
            </span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
