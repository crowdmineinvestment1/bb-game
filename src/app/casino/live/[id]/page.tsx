'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import useWalletStore from '@/store/walletStore';
import useAuthStore from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  ArrowLeft, Volume2, VolumeX, Sparkles,
  Play, RefreshCw, Send, Award, Users
} from 'lucide-react';

const LIVE_GAMES = [
  { id: 1, name: 'Blackjack VIP', category: 'Blackjack', provider: 'Evolution', players: 42, minBet: 25, maxBet: 10000, dealer: 'Elena', gradient: 'from-emerald-750 to-green-900', theme: 'blackjack' },
  { id: 2, name: 'Speed Blackjack', category: 'Blackjack', provider: 'Evolution', players: 67, minBet: 5, maxBet: 5000, dealer: 'Michael', gradient: 'from-emerald-600 to-teal-800', theme: 'blackjack' },
  { id: 3, name: 'Infinite Blackjack', category: 'Blackjack', provider: 'Evolution', players: 189, minBet: 1, maxBet: 2500, dealer: 'Sophie', gradient: 'from-green-600 to-emerald-900', theme: 'blackjack' },
  { id: 4, name: 'Lightning Blackjack', category: 'Blackjack', provider: 'Evolution', players: 156, minBet: 1, maxBet: 5000, dealer: 'James', gradient: 'from-yellow-600 to-amber-900', theme: 'blackjack' },
  { id: 5, name: 'Lightning Roulette', category: 'Roulette', provider: 'Evolution', players: 312, minBet: 0.20, maxBet: 10000, dealer: 'Anna', gradient: 'from-yellow-500 to-amber-800', theme: 'roulette' },
  { id: 6, name: 'Immersive Roulette', category: 'Roulette', provider: 'Evolution', players: 98, minBet: 1, maxBet: 5000, dealer: 'David', gradient: 'from-red-700 to-rose-900', theme: 'roulette' },
  { id: 7, name: 'Auto Roulette', category: 'Roulette', provider: 'Evolution', players: 234, minBet: 0.10, maxBet: 5000, dealer: 'Auto', gradient: 'from-red-600 to-orange-800', theme: 'roulette' },
  { id: 8, name: 'Speed Roulette', category: 'Roulette', provider: 'Evolution', players: 145, minBet: 0.50, maxBet: 5000, dealer: 'Maria', gradient: 'from-rose-600 to-red-800', theme: 'roulette' },
  { id: 9, name: 'Speed Baccarat', category: 'Baccarat', provider: 'Evolution', players: 87, minBet: 5, maxBet: 10000, dealer: 'Li Wei', gradient: 'from-red-800 to-yellow-900', theme: 'baccarat' },
  { id: 10, name: 'Lightning Baccarat', category: 'Baccarat', provider: 'Evolution', players: 203, minBet: 1, maxBet: 5000, dealer: 'Sakura', gradient: 'from-amber-600 to-red-800', theme: 'baccarat' },
  { id: 11, name: 'No Commission Baccarat', category: 'Baccarat', provider: 'Evolution', players: 56, minBet: 5, maxBet: 25000, dealer: 'Chen', gradient: 'from-yellow-700 to-orange-900', theme: 'baccarat' },
  { id: 12, name: 'Crazy Time', category: 'Game Shows', provider: 'Evolution', players: 567, minBet: 0.10, maxBet: 2500, dealer: 'Host', gradient: 'from-yellow-400 to-orange-600', theme: 'gameshow' },
  { id: 13, name: 'Monopoly Live', category: 'Game Shows', provider: 'Evolution', players: 445, minBet: 0.10, maxBet: 2500, dealer: 'Mr. Monopoly', gradient: 'from-green-500 to-teal-700', theme: 'gameshow' },
  { id: 14, name: 'Dream Catcher', category: 'Game Shows', provider: 'Evolution', players: 234, minBet: 0.10, maxBet: 2500, dealer: 'Sarah', gradient: 'from-purple-500 to-pink-700', theme: 'gameshow' },
  { id: 15, name: 'Mega Ball', category: 'Game Shows', provider: 'Evolution', players: 178, minBet: 0.10, maxBet: 2500, dealer: 'Alex', gradient: 'from-blue-500 to-indigo-700', theme: 'gameshow' },
  { id: 16, name: 'Deal or No Deal', category: 'Game Shows', provider: 'Evolution', players: 123, minBet: 0.10, maxBet: 2500, dealer: 'Host', gradient: 'from-orange-500 to-red-700', theme: 'gameshow' },
];

interface CardInfo {
  suit: string;
  value: string;
  score: number;
}

const CARD_SUITS = ['♠', '♥', '♦', '♣'];
const CARD_VALUES = [
  { val: '2', score: 2 }, { val: '3', score: 3 }, { val: '4', score: 4 },
  { val: '5', score: 5 }, { val: '6', score: 6 }, { val: '7', score: 7 },
  { val: '8', score: 8 }, { val: '9', score: 9 }, { val: '10', score: 10 },
  { val: 'J', score: 10 }, { val: 'Q', score: 10 }, { val: 'K', score: 10 },
  { val: 'A', score: 11 }
];

const SHOW_WHEEL_SEGMENTS = [
  { text: '1x', multiplier: 1, color: 'bg-zinc-700 text-white' },
  { text: '2x', multiplier: 2, color: 'bg-blue-600 text-white' },
  { text: '5x', multiplier: 5, color: 'bg-emerald-600 text-white' },
  { text: '10x', multiplier: 10, color: 'bg-yellow-500 text-black' },
  { text: 'CRAZY TIME', multiplier: 50, color: 'bg-red-600 text-white animate-pulse' },
  { text: 'MONOPOLY', multiplier: 25, color: 'bg-purple-600 text-white animate-pulse' },
];

export default function LiveDealerPage({ params }: { params: { id: string } }) {
  const rawId = params.id;
  let gameId = parseInt(rawId);
  if (isNaN(gameId) && typeof rawId === 'string') {
    const match = rawId.match(/(\d+)/);
    if (match) {
      gameId = parseInt(match[1]);
    }
  }
  const game = LIVE_GAMES.find(g => g.id === gameId) || LIVE_GAMES[0];
  const theme = game.theme || 'blackjack';

  const { balances, selectedCoin, getBalance, deposit } = useWalletStore();
  const { user } = useAuthStore();

  const [betAmount, setBetAmount] = useState('25');
  const [playing, setPlaying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [streamActive, setStreamActive] = useState(true);
  const [rotation, setRotation] = useState({ x: 12, y: 0 }); // 3D rotation

  // Simulated Live stream elements
  const [dealerChat, setDealerChat] = useState<string[]>([]);
  const [activeSide, setActiveSide] = useState<'Player' | 'Banker' | 'Tie'>('Player');
  
  // Cards State (for Blackjack/Baccarat)
  const [playerCards, setPlayerCards] = useState<CardInfo[]>([]);
  const [dealerCards, setDealerCards] = useState<CardInfo[]>([]);
  const [gameOutcome, setGameOutcome] = useState<string | null>(null);

  // Roulette States
  const [rouletteResult, setRouletteResult] = useState<number | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number>(17); // lucky 17 default
  const [wheelSpinning, setWheelSpinning] = useState(false);

  // Game Show States
  const [showResult, setShowResult] = useState<string | null>(null);
  const [selectedSegmentIdx, setSelectedSegmentIdx] = useState<number>(0);
  const [showWheelSpinAngle, setShowWheelSpinAngle] = useState(0);

  // Initialize dealer chat
  useEffect(() => {
    setDealerChat([
      `[Dealer ${game.dealer}]: Welcome to the table! Place your bets.`,
      `[System]: Table limit: $${game.minBet} - $${game.maxBet.toLocaleString()}`
    ]);
  }, [game]);

  const handlePlaceBet = async () => {
    if (playing) return;
    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount < game.minBet || amount > game.maxBet) {
      alert(`Invalid bet! Must be between $${game.minBet} and $${game.maxBet}`);
      return;
    }

    const currentBalance = getBalance(selectedCoin);
    if (currentBalance < amount) {
      alert('Insufficient balance! Deposit simulated funds in your wallet.');
      return;
    }

    setPlaying(true);
    setGameOutcome(null);

    // Deduct bet from store
    deposit(selectedCoin, -amount);

    setDealerChat(prev => [...prev, `[Dealer ${game.dealer}]: Bets closed. Good luck players!`]);

    if (theme === 'roulette') {
      triggerRoulette(amount);
    } else if (theme === 'baccarat') {
      triggerBaccarat(amount);
    } else if (theme === 'gameshow') {
      triggerGameShow(amount);
    } else {
      triggerBlackjack(amount);
    }
  };

  // Roulette Simulator
  const triggerRoulette = (wager: number) => {
    setWheelSpinning(true);
    setTimeout(() => {
      const luckyNumber = Math.floor(Math.random() * 37); // 0 to 36
      setRouletteResult(luckyNumber);
      setWheelSpinning(false);

      const win = luckyNumber === selectedNumber;
      const payout = win ? wager * 35 : 0;

      if (win) {
        setGameOutcome(`YOU WIN! Number was ${luckyNumber}!`);
        deposit(selectedCoin, payout);
      } else {
        setGameOutcome(`NO WIN. Result was ${luckyNumber}.`);
      }

      fetch('/api/games/save-bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: game.name,
          betAmount: wager,
          multiplier: win ? 35 : 0,
          payout,
          coin: selectedCoin
        })
      }).catch(err => console.error('Error logging roulette bet:', err));

      setDealerChat(prev => [
        ...prev, 
        `[Dealer ${game.dealer}]: Number is ${luckyNumber}!`,
        win ? `[Dealer ${game.dealer}]: Congratulations to the winner!` : `[Dealer ${game.dealer}]: Try again next round!`
      ]);
      setPlaying(false);
    }, 4000);
  };

  // Baccarat Simulator
  const triggerBaccarat = (wager: number) => {
    setTimeout(() => {
      const dealCard = (): CardInfo => {
        const suit = CARD_SUITS[Math.floor(Math.random() * CARD_SUITS.length)];
        const valInfo = CARD_VALUES[Math.floor(Math.random() * CARD_VALUES.length)];
        return { suit, value: valInfo.val, score: valInfo.score };
      };

      const p1 = dealCard();
      const p2 = dealCard();
      const b1 = dealCard();
      const b2 = dealCard();

      setPlayerCards([p1, p2]);
      setDealerCards([b1, b2]);

      const playerVal = (p1.score + p2.score) % 10;
      const bankerVal = (b1.score + b2.score) % 10;

      let winningSide: 'Player' | 'Banker' | 'Tie' = 'Tie';
      if (playerVal > bankerVal) winningSide = 'Player';
      else if (bankerVal > playerVal) winningSide = 'Banker';

      const win = activeSide === winningSide;
      let multiplier = 0;
      if (winningSide === 'Player' && activeSide === 'Player') multiplier = 2;
      else if (winningSide === 'Banker' && activeSide === 'Banker') multiplier = 1.95;
      else if (winningSide === 'Tie' && activeSide === 'Tie') multiplier = 9;

      const payout = win ? wager * multiplier : 0;
      
      setGameOutcome(
        `Result: Player ${playerVal} vs Banker ${bankerVal}. ${
          winningSide === 'Tie' ? "It's a TIE!" : `${winningSide} Wins!`
        }`
      );

      if (win) {
        deposit(selectedCoin, payout);
      }

      fetch('/api/games/save-bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: game.name,
          betAmount: wager,
          multiplier: win ? multiplier : 0,
          payout,
          coin: selectedCoin
        })
      }).catch(err => console.error('Error logging baccarat bet:', err));

      setDealerChat(prev => [
        ...prev, 
        `[Dealer ${game.dealer}]: Player has ${playerVal}, Banker has ${bankerVal}.`,
        `[Dealer ${game.dealer}]: ${winningSide === 'Tie' ? "Tie Game!" : `${winningSide} Wins!`}`
      ]);

      setPlaying(false);
    }, 3000);
  };

  // Blackjack Simulator
  const triggerBlackjack = (wager: number) => {
    setTimeout(() => {
      const dealCard = (): CardInfo => {
        const suit = CARD_SUITS[Math.floor(Math.random() * CARD_SUITS.length)];
        const valInfo = CARD_VALUES[Math.floor(Math.random() * CARD_VALUES.length)];
        return { suit, value: valInfo.val, score: valInfo.score };
      };

      const p1 = dealCard();
      const p2 = dealCard();
      const d1 = dealCard();

      setPlayerCards([p1, p2]);
      setDealerCards([d1]);

      const playerScore = p1.score + p2.score;
      const dealerScore = d1.score + Math.floor(Math.random() * 10 + 2);

      let win = false;
      let tie = false;
      
      if (playerScore === 21) {
        win = true;
      } else if (playerScore > 21) {
        win = false;
      } else if (dealerScore > 21 || playerScore > dealerScore) {
        win = true;
      } else if (playerScore === dealerScore) {
        tie = true;
      }

      const payout = win ? (playerScore === 21 ? wager * 2.5 : wager * 2) : tie ? wager : 0;

      if (win) {
        setGameOutcome(`YOU WIN! Player score: ${playerScore} vs Dealer: ${dealerScore}`);
        deposit(selectedCoin, payout);
      } else if (tie) {
        setGameOutcome(`PUSH (TIE). Both have ${playerScore}`);
        deposit(selectedCoin, payout);
      } else {
        setGameOutcome(`DEALER WINS. Player: ${playerScore} vs Dealer: ${dealerScore}`);
      }

      fetch('/api/games/save-bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: game.name,
          betAmount: wager,
          multiplier: win ? (playerScore === 21 ? 2.5 : 2) : tie ? 1 : 0,
          payout,
          coin: selectedCoin
        })
      }).catch(err => console.error('Error logging blackjack bet:', err));

      setDealerChat(prev => [
        ...prev,
        `[Dealer ${game.dealer}]: Player score: ${playerScore}. Dealer score: ${dealerScore}.`,
        win ? `[Dealer ${game.dealer}]: Player wins!` : tie ? `[Dealer ${game.dealer}]: Push.` : `[Dealer ${game.dealer}]: Dealer wins.`
      ]);

      setPlaying(false);
    }, 3000);
  };

  // Game Show Wheel Simulator
  const triggerGameShow = (wager: number) => {
    setWheelSpinning(true);
    // Add extra spin rotations
    const randomExtra = Math.floor(Math.random() * 6) * 60;
    const finalAngle = showWheelSpinAngle + 1440 + randomExtra;
    setShowWheelSpinAngle(finalAngle);

    setTimeout(() => {
      setWheelSpinning(false);
      
      // Determine landing segment
      const segmentIdx = Math.floor(Math.random() * SHOW_WHEEL_SEGMENTS.length);
      const landed = SHOW_WHEEL_SEGMENTS[segmentIdx];
      
      const win = selectedSegmentIdx === segmentIdx;
      const payout = win ? wager * landed.multiplier : 0;

      setShowResult(landed.text);
      setGameOutcome(`Wheel landed on ${landed.text}!`);

      if (win) {
        deposit(selectedCoin, payout);
      }

      fetch('/api/games/save-bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: game.name,
          betAmount: wager,
          multiplier: win ? landed.multiplier : 0,
          payout,
          coin: selectedCoin
        })
      }).catch(err => console.error('Error logging gameshow bet:', err));

      setDealerChat(prev => [
        ...prev,
        `[Host Sarah]: The wheel lands on ${landed.text}!`,
        win ? `[Host Sarah]: Wow! Congratulations to the winners!` : `[Host Sarah]: Place your bets for the next round!`
      ]);

      setPlaying(false);
    }, 4500);
  };

  return (
    <div className="min-h-screen bg-[#0f1923] p-4 md:p-6 text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header toolbar */}
        <div className="flex items-center justify-between">
          <Link href="/casino/live" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-semibold">Back to Live Casino</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg bg-[#1a2c38] text-gray-400 hover:text-white border border-white/5"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <span className="flex items-center gap-1.5 bg-red-600/90 text-[10px] font-black uppercase px-2 py-0.5 rounded-md animate-pulse">
              <span className="w-1 h-1 rounded-full bg-white animate-ping" />
              Live Stream
            </span>
          </div>
        </div>

        {/* Live Arena Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left panel: 3D Video Dealer Feed & virtual Felt Table */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Dealer Stream preview screen */}
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-black border border-gray-800 shadow-2xl">
              {streamActive ? (
                <div className={`absolute inset-0 bg-gradient-to-tr from-gray-900 via-neutral-900 to-[#10241b] flex items-center justify-center`}>
                  
                  {/* Neon HUD Overlay */}
                  <div className="absolute inset-0 pointer-events-none border-2 border-green-500/10 z-10" />

                  {/* Table details header */}
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-lg border border-white/5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                    <span className="text-[10px] uppercase font-bold text-gray-300">
                      {theme.toUpperCase()} TABLE 0{game.id} • {game.dealer}
                    </span>
                  </div>

                  {/* 3D Felt Layout depending on theme */}
                  {theme === 'roulette' ? (
                    /* ROULETTE Felt & Wheel */
                    <div 
                      className="w-full max-w-[500px] bg-[#0c3822] rounded-3xl p-6 border-8 border-[#322312] shadow-2xl relative flex flex-col justify-between h-[82%] transition-transform duration-300"
                      style={{ transform: `perspective(800px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
                    >
                      <div className="absolute inset-2 border-2 border-yellow-500/20 rounded-2xl pointer-events-none" />
                      <div className="flex-1 flex flex-col justify-center items-center gap-4">
                        <div className={`w-32 h-32 rounded-full border-8 border-yellow-600 bg-neutral-950 flex items-center justify-center relative shadow-inner ${wheelSpinning ? 'animate-spin' : ''}`}>
                          <div className="absolute w-2 h-16 bg-white top-2 rounded-full origin-bottom" />
                          <div className="text-white text-xs font-black">ROULETTE</div>
                        </div>

                        {/* Bet selection grid */}
                        <div className="grid grid-cols-6 gap-1 bg-[#092b1a] p-2 rounded-lg border border-yellow-500/20">
                          {Array.from({ length: 12 }, (_, i) => i + 12).map(n => (
                            <button
                              key={n}
                              onClick={() => setSelectedNumber(n)}
                              className={`w-8 h-8 rounded border font-mono font-bold flex items-center justify-center transition-all ${
                                selectedNumber === n ? 'bg-yellow-500 text-black border-yellow-600 scale-105' : 'bg-black/35 text-white/70 border-white/5 hover:text-white'
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider font-bold text-yellow-500">
                          Selected Sector: {selectedNumber} (Pays 35 to 1)
                        </div>
                      </div>
                    </div>
                  ) : theme === 'baccarat' ? (
                    /* BACCARAT Red Felt */
                    <div 
                      className="w-full max-w-[500px] bg-[#450e11] rounded-3xl p-6 border-8 border-[#322312] shadow-2xl relative flex flex-col justify-between h-[82%] transition-transform duration-300"
                      style={{ transform: `perspective(800px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
                    >
                      <div className="absolute inset-2 border-2 border-yellow-500/10 rounded-2xl pointer-events-none" />
                      <div className="flex-1 flex flex-col justify-between py-2 text-center relative">
                        {/* Dealer / Banker zone */}
                        <div>
                          <div className="text-[9px] uppercase tracking-widest font-black text-white/40 mb-2">Banker Hand</div>
                          <div className="flex justify-center gap-2">
                            {dealerCards.length === 0 ? (
                              <div className="w-12 h-16 rounded border border-dashed border-white/20 flex items-center justify-center text-white/20">🂠</div>
                            ) : (
                              dealerCards.map((c, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ scale: 0, rotateY: 180 }}
                                  animate={{ scale: 1, rotateY: 0 }}
                                  className="w-12 h-16 bg-white text-black font-bold rounded shadow-lg flex flex-col justify-between p-1 text-sm border border-neutral-200"
                                >
                                  <span>{c.value}</span>
                                  <span className="text-lg self-center text-red-650">{c.suit}</span>
                                </motion.div>
                              ))
                            )}
                          </div>
                        </div>

                        {gameOutcome && (
                          <div className="bg-black/95 px-4 py-2 border border-red-500/30 rounded-xl text-xs font-black tracking-wider text-red-500 shadow-xl uppercase">
                            {gameOutcome}
                          </div>
                        )}

                        {/* Player zone */}
                        <div>
                          <div className="flex justify-center gap-2 mb-2">
                            {playerCards.length === 0 ? (
                              <div className="w-12 h-16 rounded border border-dashed border-white/20 flex items-center justify-center text-white/20">🂠</div>
                            ) : (
                              playerCards.map((c, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ scale: 0, rotateY: -180 }}
                                  animate={{ scale: 1, rotateY: 0 }}
                                  className="w-12 h-16 bg-white text-black font-bold rounded shadow-lg flex flex-col justify-between p-1 text-sm border border-neutral-200"
                                >
                                  <span>{c.value}</span>
                                  <span className="text-lg self-center text-red-650">{c.suit}</span>
                                </motion.div>
                              ))
                            )}
                          </div>
                          <div className="text-[9px] uppercase tracking-widest font-black text-white/40">Player Hand</div>
                        </div>
                      </div>
                    </div>
                  ) : theme === 'gameshow' ? (
                    /* GAME SHOW Prize Wheel */
                    <div 
                      className="w-full max-w-[500px] bg-gradient-to-b from-indigo-900 to-black rounded-3xl p-6 border-8 border-purple-650 shadow-2xl relative flex flex-col justify-between h-[82%] transition-transform duration-300"
                      style={{ transform: `perspective(800px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent)] pointer-events-none" />
                      <div className="flex-1 flex flex-col justify-center items-center gap-4">
                        
                        {/* Spinning wheel */}
                        <div 
                          style={{ 
                            transform: `rotate(${showWheelSpinAngle}deg)`,
                            transition: wheelSpinning ? 'transform 4.5s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none'
                          }}
                          className="w-36 h-36 rounded-full border-4 border-yellow-500 bg-neutral-900 flex items-center justify-center relative shadow-2xl"
                        >
                          {/* Inner spokes */}
                          {SHOW_WHEEL_SEGMENTS.map((s, idx) => (
                            <div 
                              key={idx} 
                              style={{ transform: `rotate(${idx * 60}deg)` }}
                              className="absolute w-px h-full bg-white/20 origin-center"
                            />
                          ))}
                          <div className="text-yellow-500 text-xs font-black z-10 bg-black/80 px-2 py-1 rounded">SPIN SHOW</div>
                        </div>

                        {/* Top Indicator peg */}
                        <div className="w-4 h-6 bg-red-500 rounded-b-full border-2 border-white animate-bounce -mt-2 z-20" />

                        {/* Bet selection chips */}
                        <div className="grid grid-cols-3 gap-1.5 w-full">
                          {SHOW_WHEEL_SEGMENTS.map((s, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedSegmentIdx(idx)}
                              className={`py-1.5 px-2 rounded-lg font-bold text-[10px] uppercase border transition-all ${
                                selectedSegmentIdx === idx ? 'bg-yellow-500 text-black border-yellow-600 scale-105 shadow-md shadow-yellow-500/20' : 'bg-black/45 text-white/70 border-white/5 hover:text-white'
                              }`}
                            >
                              {s.text} ({s.multiplier}x)
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* BLACKJACK Green Felt */
                    <div 
                      className="w-full max-w-[500px] bg-[#0c3822] rounded-3xl p-6 border-8 border-[#322312] shadow-2xl relative flex flex-col justify-between h-[82%] transition-transform duration-300"
                      style={{ transform: `perspective(800px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
                    >
                      <div className="absolute inset-2 border-2 border-yellow-500/20 rounded-2xl pointer-events-none" />
                      <div className="flex-1 flex flex-col justify-between py-2 text-center relative">
                        {/* Dealer */}
                        <div>
                          <div className="text-[9px] uppercase tracking-widest font-black text-white/50 mb-2">Dealer Hand</div>
                          <div className="flex justify-center gap-2">
                            {dealerCards.length === 0 ? (
                              <div className="w-12 h-16 rounded border border-dashed border-white/20 flex items-center justify-center text-white/20">🂠</div>
                            ) : (
                              dealerCards.map((c, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ scale: 0, rotateY: 180 }}
                                  animate={{ scale: 1, rotateY: 0 }}
                                  className="w-12 h-16 bg-white text-black font-bold rounded shadow-lg flex flex-col justify-between p-1 text-sm border border-neutral-200"
                                >
                                  <span>{c.value}</span>
                                  <span className="text-lg self-center">{c.suit}</span>
                                </motion.div>
                              ))
                            )}
                          </div>
                        </div>

                        {gameOutcome && (
                          <div className="bg-black/85 px-4 py-2 border border-yellow-500/30 rounded-xl text-xs font-black tracking-wider text-yellow-500 shadow-xl uppercase">
                            {gameOutcome}
                          </div>
                        )}

                        {/* Player */}
                        <div>
                          <div className="flex justify-center gap-2 mb-2">
                            {playerCards.length === 0 ? (
                              <div className="w-12 h-16 rounded border border-dashed border-white/20 flex items-center justify-center text-white/20">🂠</div>
                            ) : (
                              playerCards.map((c, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ scale: 0, rotateY: -180 }}
                                  animate={{ scale: 1, rotateY: 0 }}
                                  className="w-12 h-16 bg-white text-black font-bold rounded shadow-lg flex flex-col justify-between p-1 text-sm border border-neutral-200"
                                >
                                  <span>{c.value}</span>
                                  <span className="text-lg self-center">{c.suit}</span>
                                </motion.div>
                              ))
                            )}
                          </div>
                          <div className="text-[9px] uppercase tracking-widest font-black text-white/50">Your Hand</div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
                  <span className="text-xs text-zinc-650">STREAM OFFLINE</span>
                </div>
              )}
            </div>

            {/* Adjust table camera controls */}
            <div className="flex gap-2 justify-end text-xs font-bold text-gray-500">
              <button onClick={() => setRotation({ x: rotation.x + 2, y: rotation.y })} className="px-2 py-1 bg-[#1a2c38] rounded border border-white/5 hover:text-white">Tilt Up</button>
              <button onClick={() => setRotation({ x: rotation.x - 2, y: rotation.y })} className="px-2 py-1 bg-[#1a2c38] rounded border border-white/5 hover:text-white">Tilt Down</button>
              <button onClick={() => setRotation({ x: 12, y: 0 })} className="px-2 py-1 bg-[#1a2c38] rounded border border-white/5 hover:text-white">Reset Camera</button>
            </div>
          </div>

          {/* Right Panel: Betting Console & Dealer Chat */}
          <div className="space-y-6">
            
            <Card className="p-6 bg-secondary/80 border border-white/5">
              <h3 className="text-base font-bold mb-4 uppercase tracking-wider">Betting Panel</h3>

              {/* Balance */}
              <div className="bg-primary/50 border border-white/5 rounded-xl p-4 mb-4 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Selected Wallet</span>
                  <div className="text-base font-mono font-bold mt-1 text-white">
                    {getBalance(selectedCoin).toFixed(6)}
                  </div>
                </div>
                <span className="text-xs font-black uppercase text-[#00e701] bg-[#00e701]/10 px-2 rounded">
                  {selectedCoin}
                </span>
              </div>

              {/* Baccarat player/banker toggle */}
              {theme === 'baccarat' && (
                <div className="grid grid-cols-3 gap-1 mb-4">
                  {(['Player', 'Banker', 'Tie'] as const).map(side => (
                    <button
                      key={side}
                      onClick={() => setActiveSide(side)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        activeSide === side ? 'bg-green-600 text-white border-green-700' : 'bg-[#1a2c38] text-gray-400 border-white/5 hover:text-white'
                      }`}
                    >
                      {side}
                    </button>
                  ))}
                </div>
              )}

              {/* Bet Amount */}
              <div className="space-y-2 mb-4">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Bet Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    className="w-full bg-primary border border-white/10 rounded-lg py-2.5 pl-4 pr-16 font-mono text-white text-sm focus:outline-none focus:border-[#00e701]/50"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <button
                      onClick={() => setBetAmount((parseFloat(betAmount) / 2).toFixed(0))}
                      className="px-1.5 py-0.5 bg-[#1a2c38] text-[10px] font-bold text-gray-400 hover:text-white rounded"
                    >
                      ½
                    </button>
                    <button
                      onClick={() => setBetAmount((parseFloat(betAmount) * 2).toFixed(0))}
                      className="px-1.5 py-0.5 bg-[#1a2c38] text-[10px] font-bold text-gray-400 hover:text-white rounded"
                    >
                      2x
                    </button>
                  </div>
                </div>
              </div>

              {/* Place Bet Button */}
              <Button
                variant="primary"
                fullWidth
                disabled={playing}
                onClick={handlePlaceBet}
                className="py-3 font-bold uppercase tracking-wider text-xs shadow-lg flex items-center justify-center gap-1.5"
              >
                {playing ? 'Dealing...' : 'Place Bet'}
              </Button>
            </Card>

            {/* Simulated Live Feed Dealer Chat */}
            <Card className="p-4 bg-secondary/80 border border-white/5 flex flex-col h-[280px] justify-between">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e701] animate-ping" />
                Live Dealer Chat
              </h4>

              {/* Chat list */}
              <div className="flex-1 overflow-y-auto space-y-1.5 py-1 scrollbar-thin scrollbar-thumb-gray-800 pr-1 text-xs">
                {dealerChat.map((msg, idx) => (
                  <div key={idx} className="p-1.5 rounded bg-black/20 border border-white/5 font-semibold text-gray-300 leading-relaxed">
                    {msg}
                  </div>
                ))}
              </div>

              {/* Input field */}
              <div className="mt-3 relative">
                <input
                  type="text"
                  placeholder="Chat with the dealer..."
                  className="w-full bg-primary border border-white/5 rounded-lg py-2 pl-3 pr-10 text-xs focus:outline-none focus:border-[#00e701]/30 placeholder:text-gray-600"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      const text = e.currentTarget.value.trim();
                      setDealerChat(prev => [...prev, `[You]: ${text}`]);
                      e.currentTarget.value = '';
                      setTimeout(() => {
                        setDealerChat(prev => [...prev, `[Dealer ${game.dealer}]: Good luck, placing bets soon.`]);
                      }, 1500);
                    }
                  }}
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  <Send size={12} />
                </button>
              </div>
            </Card>

          </div>

        </div>

      </div>
    </div>
  );
}
