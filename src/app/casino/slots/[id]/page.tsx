'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import useWalletStore from '@/store/walletStore';
import useAuthStore from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  Coins, ArrowLeft, RotateCw, Volume2, VolumeX,
  Trophy, Flame, Sparkles
} from 'lucide-react';

const SLOT_GAMES = [
  { id: 1, name: 'Gates of Olympus', provider: 'Pragmatic Play', rtp: 96.5, maxWin: '5,000x', gradient: 'from-yellow-600 to-amber-900', theme: 'olympus' },
  { id: 2, name: 'Sweet Bonanza', provider: 'Pragmatic Play', rtp: 96.48, maxWin: '21,175x', gradient: 'from-pink-500 to-purple-600', theme: 'candy' },
  { id: 3, name: 'Big Bass Bonanza', provider: 'Pragmatic Play', rtp: 96.71, maxWin: '2,100x', gradient: 'from-blue-500 to-teal-600', theme: 'ocean' },
  { id: 4, name: 'The Dog House', provider: 'Pragmatic Play', rtp: 96.51, maxWin: '6,750x', gradient: 'from-amber-500 to-red-600', theme: 'default' },
  { id: 5, name: 'Starburst', provider: 'NetEnt', rtp: 96.09, maxWin: '500x', gradient: 'from-purple-500 to-blue-500', theme: 'default' },
  { id: 6, name: 'Gonzo\'s Quest', provider: 'NetEnt', rtp: 95.97, maxWin: '2,500x', gradient: 'from-green-600 to-emerald-800', theme: 'jungle' },
  { id: 7, name: 'Dead or Alive 2', provider: 'NetEnt', rtp: 96.8, maxWin: '111,111x', gradient: 'from-yellow-700 to-red-900', theme: 'western' },
  { id: 8, name: 'Divine Fortune', provider: 'NetEnt', rtp: 96.59, maxWin: 'Progressive', gradient: 'from-indigo-500 to-purple-700', theme: 'olympus' },
  { id: 9, name: 'Immortal Romance', provider: 'Microgaming', rtp: 96.86, maxWin: '12,150x', gradient: 'from-red-800 to-purple-900', theme: 'default' },
  { id: 10, name: 'Mega Moolah', provider: 'Microgaming', rtp: 88.12, maxWin: 'Progressive', gradient: 'from-yellow-500 to-green-700', theme: 'jungle' },
  { id: 11, name: 'Thunderstruck II', provider: 'Microgaming', rtp: 96.65, maxWin: '2,400,000', gradient: 'from-blue-700 to-indigo-900', theme: 'olympus' },
  { id: 12, name: 'Book of Dead', provider: 'Play\'n GO', rtp: 96.21, maxWin: '5,000x', gradient: 'from-amber-600 to-amber-900', theme: 'jungle' },
  { id: 13, name: 'Reactoonz', provider: 'Play\'n GO', rtp: 96.51, maxWin: '4,570x', gradient: 'from-purple-500 to-pink-600', theme: 'default' },
  { id: 14, name: 'Fire Joker', provider: 'Play\'n GO', rtp: 96.15, maxWin: '800x', gradient: 'from-red-500 to-orange-600', theme: 'default' },
  { id: 15, name: 'Bonanza', provider: 'Big Time Gaming', rtp: 96.0, maxWin: '10,000x', gradient: 'from-blue-600 to-cyan-700', theme: 'ocean' },
  { id: 16, name: 'Extra Chilli', provider: 'Big Time Gaming', rtp: 96.2, maxWin: '20,000x', gradient: 'from-red-500 to-yellow-600', theme: 'western' },
  { id: 17, name: 'Wanted Dead or Wild', provider: 'Hacksaw', rtp: 96.38, maxWin: '12,500x', gradient: 'from-amber-700 to-stone-800', theme: 'western' },
  { id: 18, name: 'Chaos Crew', provider: 'Hacksaw', rtp: 96.3, maxWin: '10,000x', gradient: 'from-cyan-500 to-blue-600', theme: 'default' },
  { id: 19, name: 'Mental', provider: 'Nolimit City', rtp: 96.09, maxWin: '66,666x', gradient: 'from-purple-600 to-red-700', theme: 'default' },
  { id: 20, name: 'San Quentin', provider: 'Nolimit City', rtp: 96.03, maxWin: '150,000x', gradient: 'from-orange-600 to-gray-800', theme: 'default' },
  { id: 21, name: 'Tombstone RIP', provider: 'Nolimit City', rtp: 96.08, maxWin: '300,000x', gradient: 'from-red-900 to-gray-900', theme: 'western' },
  { id: 22, name: 'Jammin\' Jars', provider: 'Push Gaming', rtp: 96.83, maxWin: '20,000x', gradient: 'from-purple-500 to-blue-600', theme: 'candy' },
  { id: 23, name: 'Money Train 3', provider: 'Relax Gaming', rtp: 96.1, maxWin: '100,000x', gradient: 'from-yellow-600 to-red-700', theme: 'western' },
  { id: 24, name: 'Vikings Go Berzerk', provider: 'Yggdrasil', rtp: 96.1, maxWin: '4,000x', gradient: 'from-blue-600 to-teal-800', theme: 'ocean' },
  { id: 25, name: 'Valley of the Gods', provider: 'Yggdrasil', rtp: 96.2, maxWin: '3,600x', gradient: 'from-amber-500 to-orange-700', theme: 'olympus' },
  { id: 26, name: 'Razor Shark', provider: 'Push Gaming', rtp: 96.7, maxWin: '50,000x', gradient: 'from-blue-500 to-cyan-700', theme: 'ocean' },
  { id: 27, name: 'Dream Drop Jackpot', provider: 'Relax Gaming', rtp: 94.0, maxWin: 'Progressive', gradient: 'from-indigo-500 to-violet-700', theme: 'default' },
  { id: 28, name: 'Mystery Museum', provider: 'Push Gaming', rtp: 96.65, maxWin: '25,000x', gradient: 'from-teal-600 to-emerald-800', theme: 'jungle' },
];

interface SlotTheme {
  cabinetClass: string;
  feltClass: string;
  borderClass: string;
  bgDecorations: React.ReactNode;
  symbols: { symbol: string; value: number; name: string }[];
}

const SLOT_THEMES: Record<string, SlotTheme> = {
  olympus: {
    cabinetClass: 'from-amber-400 via-yellow-600 to-amber-900',
    feltClass: 'bg-[#0f1d3a]',
    borderClass: 'border-yellow-400/80 shadow-[0_0_20px_rgba(234,179,8,0.3)]',
    bgDecorations: (
      <>
        <div className="absolute top-2 left-4 text-xs font-black text-yellow-300 tracking-widest animate-pulse">⚡ OLYMPIAN ZEUS POWER ⚡</div>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2),transparent)]" />
      </>
    ),
    symbols: [
      { symbol: '👑', value: 12, name: 'Zeus Crown' },
      { symbol: '⚡', value: 10, name: 'Lightning Bolt' },
      { symbol: '🏆', value: 8, name: 'Golden Chalice' },
      { symbol: '💍', value: 6, name: 'Zeus Ring' },
      { symbol: '⏳', value: 5, name: 'Hourglass' },
      { symbol: '⭐', value: 20, name: 'Divine Star' },
      { symbol: '💎', value: 4, name: 'Blue Jewel' },
    ]
  },
  candy: {
    cabinetClass: 'from-pink-400 via-rose-500 to-purple-800',
    feltClass: 'bg-[#2b1028]',
    borderClass: 'border-pink-400/80 shadow-[0_0_20px_rgba(244,63,94,0.3)]',
    bgDecorations: (
      <>
        <div className="absolute top-2 left-4 text-xs font-black text-pink-300 tracking-widest animate-bounce">🍭 CANDY LAND SWEETNESS 🍭</div>
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ff007f_1px,transparent_1px)] [background-size:12px_12px]" />
      </>
    ),
    symbols: [
      { symbol: '🍭', value: 15, name: 'Lollipop' },
      { symbol: '🍬', value: 8, name: 'Candy Cane' },
      { symbol: '🍓', value: 6, name: 'Strawberry' },
      { symbol: '🍎', value: 5, name: 'Sweet Apple' },
      { symbol: '🍌', value: 4, name: 'Banana' },
      { symbol: '🍇', value: 3, name: 'Juicy Grapes' },
      { symbol: '💖', value: 12, name: 'Candy Heart' },
    ]
  },
  ocean: {
    cabinetClass: 'from-blue-400 via-cyan-600 to-indigo-900',
    feltClass: 'bg-[#0a233a]',
    borderClass: 'border-cyan-400/80 shadow-[0_0_20px_rgba(34,211,238,0.3)]',
    bgDecorations: (
      <>
        <div className="absolute top-2 left-4 text-xs font-black text-cyan-300 tracking-widest animate-pulse">🫧 DEEP OCEAN BASS 🫧</div>
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:100%_8px]" />
      </>
    ),
    symbols: [
      { symbol: '🦈', value: 15, name: 'Razor Shark' },
      { symbol: '🚢', value: 8, name: 'Submarine' },
      { symbol: '🐟', value: 5, name: 'Big Bass' },
      { symbol: '⚓', value: 6, name: 'Iron Anchor' },
      { symbol: '🪝', value: 4, name: 'Fish Hook' },
      { symbol: '⭐', value: 10, name: 'Starfish' },
      { symbol: '🫧', value: 2.5, name: 'Bubble Wild' },
    ]
  },
  western: {
    cabinetClass: 'from-amber-800 via-yellow-900 to-stone-900',
    feltClass: 'bg-[#1e140d]',
    borderClass: 'border-yellow-700/80 shadow-[0_0_20px_rgba(180,83,9,0.3)]',
    bgDecorations: (
      <>
        <div className="absolute top-2 left-4 text-xs font-black text-amber-500 tracking-widest">🤠 WANTED DEAD OR WILD 🤠</div>
        <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,#000,#000_10px,transparent_10px,transparent_20px)]" />
      </>
    ),
    symbols: [
      { symbol: '🤠', value: 15, name: 'Outlaw Cowboy' },
      { symbol: '🔫', value: 12, name: 'Six Shooter' },
      { symbol: '🍾', value: 6, name: 'Whiskey Bottle' },
      { symbol: '🎖️', value: 8, name: 'Sheriff Badge' },
      { symbol: '🧲', value: 5, name: 'Lucky Horseshoe' },
      { symbol: '💀', value: 10, name: 'Skull Scatter' },
      { symbol: '🍀', value: 3, name: 'Four Leaf Clover' },
    ]
  },
  jungle: {
    cabinetClass: 'from-emerald-500 via-green-700 to-stone-850',
    feltClass: 'bg-[#0d1c12]',
    borderClass: 'border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.3)]',
    bgDecorations: (
      <>
        <div className="absolute top-2 left-4 text-xs font-black text-emerald-400 tracking-widest animate-pulse">🗿 GONZO JUNGLE RUINS 🗿</div>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_bottom,rgba(16,185,129,0.25),transparent_70%)]" />
      </>
    ),
    symbols: [
      { symbol: '🗿', value: 15, name: 'Tribal Mask' },
      { symbol: '🦁', value: 10, name: 'Jungle Lion' },
      { symbol: '🪲', value: 6, name: 'Golden Scarab' },
      { symbol: '🧭', value: 5, name: 'Compass' },
      { symbol: '🪙', value: 8, name: 'Ancient Coin' },
      { symbol: '💎', value: 12, name: 'Ruby Gem' },
      { symbol: '🐒', value: 4, name: 'Monkey Companion' },
    ]
  },
  default: {
    cabinetClass: 'from-purple-600 via-indigo-700 to-black',
    feltClass: 'bg-[#131126]',
    borderClass: 'border-purple-500/80 shadow-[0_0_20px_rgba(168,85,247,0.3)]',
    bgDecorations: (
      <>
        <div className="absolute top-2 left-4 text-xs font-black text-purple-400 tracking-widest">🎰 FUTURISTIC NEON SLOT 🎰</div>
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
      </>
    ),
    symbols: [
      { symbol: '👑', value: 10, name: 'Crown' },
      { symbol: '💎', value: 8, name: 'Diamond' },
      { symbol: '🔔', value: 5, name: 'Bell' },
      { symbol: '🍒', value: 4, name: 'Cherry' },
      { symbol: '🍇', value: 3, name: 'Grape' },
      { symbol: '🍋', value: 2, name: 'Lemon' },
      { symbol: '🍀', value: 1.5, name: 'Clover' },
      { symbol: '⭐', value: 15, name: 'Star' },
    ]
  }
};

export default function SlotGamePage({ params }: { params: { id: string } }) {
  const rawId = params.id;
  let gameId = parseInt(rawId);
  if (isNaN(gameId) && typeof rawId === 'string') {
    const match = rawId.match(/(\d+)/);
    if (match) {
      gameId = parseInt(match[1]);
    }
  }
  const game = SLOT_GAMES.find(g => g.id === gameId) || SLOT_GAMES[0];
  const themeKey = game.theme || 'default';
  const currentTheme = SLOT_THEMES[themeKey] || SLOT_THEMES.default;

  const { balances, selectedCoin, getBalance, deposit } = useWalletStore();
  const { user } = useAuthStore();

  const [betAmount, setBetAmount] = useState('0.0001');
  const [spinning, setSpinning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [rotation, setRotation] = useState({ x: 8, y: 0 }); // 3D perspective tilt
  
  // 3 Reels x 5 rows matrix (initially populated randomly using theme-specific symbols)
  const [reels, setReels] = useState<string[][]>([[], [], []]);

  const [winAmount, setWinAmount] = useState<number | null>(null);
  const [multiplierResult, setMultiplierResult] = useState<number>(0);
  const [recentPlays, setRecentPlays] = useState<any[]>([]);

  // Seed initial reels based on current theme's symbols
  useEffect(() => {
    const symbolList = currentTheme.symbols;
    setReels([
      Array.from({ length: 5 }, () => symbolList[Math.floor(Math.random() * symbolList.length)].symbol),
      Array.from({ length: 5 }, () => symbolList[Math.floor(Math.random() * symbolList.length)].symbol),
      Array.from({ length: 5 }, () => symbolList[Math.floor(Math.random() * symbolList.length)].symbol),
    ]);
  }, [themeKey]);

  // Function to spin the reels
  const handleSpin = async () => {
    if (spinning) return;
    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0) return;

    const currentBalance = getBalance(selectedCoin);
    if (currentBalance < amount) {
      alert('Insufficient balance! Deposit test credits in the wallet modal.');
      return;
    }

    setSpinning(true);
    setWinAmount(null);
    setMultiplierResult(0);

    // Deduct bet amount from wallet locally
    deposit(selectedCoin, -amount);

    // Perform spin reel animations (simulated with timers)
    let spinCycles = 0;
    const interval = setInterval(() => {
      setReels(prev => prev.map(() => 
        Array.from({ length: 5 }, () => currentTheme.symbols[Math.floor(Math.random() * currentTheme.symbols.length)].symbol)
      ));
      spinCycles++;
      if (spinCycles > 15) {
        clearInterval(interval);
        finalizeSpin(amount);
      }
    }, 90);
  };

  const finalizeSpin = (bet: number) => {
    // Generate final reel symbols
    const finalReels = Array.from({ length: 3 }, () => 
      Array.from({ length: 5 }, () => currentTheme.symbols[Math.floor(Math.random() * currentTheme.symbols.length)].symbol)
    );
    setReels(finalReels);

    // Check winnings (simple payline calculation on rows)
    let totalMultiplier = 0;
    
    // Check horizontal lines
    for (let row = 0; row < 5; row++) {
      const sym1 = finalReels[0][row];
      const sym2 = finalReels[1][row];
      const sym3 = finalReels[2][row];

      if (sym1 === sym2 && sym2 === sym3) {
        const matchingSymbol = currentTheme.symbols.find(s => s.symbol === sym1);
        totalMultiplier += matchingSymbol ? matchingSymbol.value : 1;
      }
    }

    // Check diagonal lines
    if (finalReels[0][0] === finalReels[1][1] && finalReels[1][1] === finalReels[2][2]) {
      const matchingSymbol = currentTheme.symbols.find(s => s.symbol === finalReels[1][1]);
      totalMultiplier += matchingSymbol ? matchingSymbol.value * 1.5 : 1.5;
    }
    if (finalReels[0][4] === finalReels[1][3] && finalReels[1][3] === finalReels[2][2]) {
      const matchingSymbol = currentTheme.symbols.find(s => s.symbol === finalReels[1][3]);
      totalMultiplier += matchingSymbol ? matchingSymbol.value * 1.5 : 1.5;
    }

    const winValue = bet * totalMultiplier;
    setMultiplierResult(totalMultiplier);
    
    if (totalMultiplier > 0) {
      setWinAmount(winValue);
      // Credit wallet
      deposit(selectedCoin, winValue);
    } else {
      setWinAmount(0);
    }

    // Save bet details to server for admin activities log
    fetch('/api/games/save-bet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameType: game.name,
        betAmount: bet,
        multiplier: totalMultiplier,
        payout: winValue,
        coin: selectedCoin
      })
    }).catch(err => console.error('Error logging slot bet:', err));

    // Add to history list
    setRecentPlays(prev => [
      {
        id: Math.random().toString(),
        username: user?.username || 'Anonymous',
        multiplier: totalMultiplier,
        payout: winValue,
        wager: bet,
        coin: selectedCoin,
        timestamp: new Date()
      },
      ...prev.slice(0, 7)
    ]);

    setSpinning(false);
  };

  return (
    <div className="min-h-screen bg-[#0f1923] p-4 md:p-6 text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Back header */}
        <div className="flex items-center justify-between">
          <Link href="/casino/slots" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-semibold">Back to Slots</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg bg-[#1a2c38] text-gray-400 hover:text-white border border-white/5"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <span className="text-xs text-gray-500 font-bold">RTP {game.rtp}%</span>
          </div>
        </div>

        {/* Outer 3D Play Console Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main 3D Slot Cabinet Screen */}
          <div className="lg:col-span-2 flex flex-col items-center">
            
            {/* Interactive 3D Cabinet Box */}
            <div 
              className={`w-full max-w-[580px] bg-gradient-to-b ${currentTheme.cabinetClass} border-4 ${currentTheme.borderClass} rounded-3xl p-6 shadow-2xl relative overflow-hidden transition-transform duration-300`}
              style={{
                transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.1)'
              }}
            >
              {/* Theme custom decorations */}
              {currentTheme.bgDecorations}
              
              {/* Cabinet Header Banner */}
              <div className={`w-full py-4 rounded-xl bg-gradient-to-r ${game.gradient} text-center mb-6 shadow-inner relative overflow-hidden`}>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15),transparent)] animate-pulse" />
                <h2 className="text-2xl font-black tracking-widest text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                  {game.name}
                </h2>
                <p className="text-[10px] text-white/70 font-semibold tracking-widest mt-0.5">
                  BY {game.provider.toUpperCase()}
                </p>
              </div>

              {/* Slot reels viewbox */}
              <div className={`w-full ${currentTheme.feltClass} rounded-2xl p-4 border border-white/5 relative flex items-center justify-between gap-2 shadow-inner`}>
                {/* Simulated vertical reel separators */}
                <div className="absolute top-0 bottom-0 left-[33%] w-px bg-white/10" />
                <div className="absolute top-0 bottom-0 left-[66%] w-px bg-white/10" />

                {/* Reels */}
                {reels.map((reel, rIdx) => (
                  <div key={rIdx} className="flex-1 flex flex-col items-center gap-3 py-2 overflow-hidden h-[300px]">
                    <AnimatePresence mode="popLayout">
                      {reel.map((symbol, sIdx) => (
                        <motion.div
                          key={`${rIdx}-${sIdx}-${symbol}`}
                          initial={{ y: -80, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: 80, opacity: 0 }}
                          transition={{ duration: spinning ? 0.08 : 0.4, ease: 'easeOut' }}
                          className="w-16 h-16 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-3xl shadow-inner select-none relative"
                        >
                          {symbol}
                          {/* 3D shadow on symbols */}
                          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-black/35 rounded-xl pointer-events-none" />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Win ticker panel */}
              <div className="mt-6 flex items-center justify-between bg-black/50 rounded-xl p-4 border border-white/5">
                <div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Last Multiplier</span>
                  <div className="text-xl font-mono font-black text-[#00e701]">
                    {multiplierResult > 0 ? `${multiplierResult}x` : '-'}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Status / Payout</span>
                  <div className="text-xl font-bold font-mono">
                    {spinning ? (
                      <span className="text-yellow-500 animate-pulse uppercase tracking-wider text-xs">Spinning...</span>
                    ) : winAmount !== null ? (
                      winAmount > 0 ? (
                        <span className="text-[#00e701] font-black animate-bounce">
                          WIN +{winAmount.toFixed(6)}
                        </span>
                      ) : (
                        <span className="text-gray-500">NO WIN</span>
                      )
                    ) : (
                      <span className="text-gray-600">READY TO SPIN</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 3D control tilt slider for user */}
              <div className="mt-6 flex justify-between items-center text-xs text-gray-600 font-bold uppercase">
                <span>Use keyboard / tilt:</span>
                <div className="flex gap-2">
                  <button onClick={() => setRotation({ x: rotation.x + 2, y: rotation.y })} className="px-2 py-1 bg-black/40 rounded hover:bg-black/80 hover:text-white">Tilt Up</button>
                  <button onClick={() => setRotation({ x: rotation.x - 2, y: rotation.y })} className="px-2 py-1 bg-black/40 rounded hover:bg-black/80 hover:text-white">Tilt Down</button>
                  <button onClick={() => setRotation({ x: 8, y: 0 })} className="px-2 py-1 bg-black/40 rounded hover:bg-black/80 hover:text-white">Reset</button>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Betting Console Sidebar */}
          <div className="space-y-6">
            
            <Card className="p-6 bg-secondary/80 backdrop-blur-md border border-white/5">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#00e701]" />
                Place Your Bet
              </h3>

              {/* Balance display */}
              <div className="bg-primary/50 border border-white/5 rounded-xl p-4 mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Available Balance</div>
                  <div className="text-lg font-mono font-bold mt-1 text-white">
                    {getBalance(selectedCoin).toFixed(6)}
                  </div>
                </div>
                <span className="text-xs font-black uppercase text-[#00e701] bg-[#00e701]/10 px-2.5 py-1 rounded">
                  {selectedCoin}
                </span>
              </div>

              {/* Bet amount input */}
              <div className="space-y-2 mb-6">
                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Bet Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    className="w-full bg-primary border border-white/10 rounded-lg py-3 pl-4 pr-24 font-mono text-white text-sm focus:outline-none focus:border-[#00e701]/50"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <button
                      onClick={() => setBetAmount((parseFloat(betAmount) / 2).toFixed(6))}
                      className="px-2 py-1 bg-[#1a2c38] text-xs font-bold text-gray-400 hover:text-white rounded"
                    >
                      ½
                    </button>
                    <button
                      onClick={() => setBetAmount((parseFloat(betAmount) * 2).toFixed(6))}
                      className="px-2 py-1 bg-[#1a2c38] text-xs font-bold text-gray-400 hover:text-white rounded"
                    >
                      2x
                    </button>
                  </div>
                </div>
              </div>

              {/* SPIN Button */}
              <Button
                variant="primary"
                fullWidth
                disabled={spinning}
                onClick={handleSpin}
                className="py-4 font-black uppercase tracking-wider text-base shadow-lg shadow-[#00e701]/20 flex items-center justify-center gap-2"
              >
                <RotateCw className={`w-5 h-5 ${spinning ? 'animate-spin' : ''}`} />
                {spinning ? 'Spinning...' : 'Spin'}
              </Button>
            </Card>

            {/* Paytable info */}
            <Card className="p-4 bg-secondary/80 backdrop-blur-md border border-white/5 text-xs">
              <h4 className="font-bold text-gray-400 mb-2 uppercase tracking-widest text-[10px]">Symbol Paytable</h4>
              <div className="grid grid-cols-2 gap-2 text-gray-300">
                {currentTheme.symbols.map(s => (
                  <div key={s.symbol} className="flex justify-between items-center p-1 bg-black/20 rounded">
                    <span>{s.symbol} {s.name}</span>
                    <span className="font-mono text-[#00e701] font-bold">{s.value}x</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent plays */}
            <Card className="p-4 bg-secondary/80 border border-white/5">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-yellow-500" /> Recent Hits
              </h4>
              <div className="space-y-2">
                {recentPlays.length === 0 ? (
                  <div className="text-center text-xs text-gray-600 py-4">No plays yet. Spin the reels!</div>
                ) : (
                  recentPlays.map(p => (
                    <div key={p.id} className="flex justify-between items-center text-xs p-2 bg-black/20 rounded border border-white/5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">{p.username}</span>
                        <span className="text-[10px] text-gray-500">Wagered {p.wager} {p.coin}</span>
                      </div>
                      <div className="text-right flex flex-col">
                        <span className="font-mono font-bold text-[#00e701]">+{p.payout.toFixed(6)}</span>
                        <span className="text-[10px] text-gray-500">{p.multiplier}x Multiplier</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

          </div>

        </div>

      </div>
    </div>
  );
}
