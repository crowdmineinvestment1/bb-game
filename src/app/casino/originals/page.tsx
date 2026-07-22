'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Rocket, Dice1, Triangle, Bomb, Zap, CircleDot,
  Hash, Grid3X3, ArrowUpDown, Building2, Search
} from 'lucide-react';

const ORIGINAL_GAMES = [
  {
    id: 'crash',
    name: 'Crash',
    description: 'Watch the multiplier rise and cash out before it crashes!',
    icon: Rocket,
    thumbnail: '/games/crash.jpg',
    gradient: 'from-red-500 via-orange-500 to-yellow-500',
    href: '/games/crash',
    players: 1247,
    maxWin: '1,000,000x',
  },
  {
    id: 'dice',
    name: 'Dice',
    description: 'Roll over or under your target number to win.',
    icon: Dice1,
    thumbnail: '/games/dice.jpg',
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    href: '/games/dice',
    players: 892,
    maxWin: '9,900x',
  },
  {
    id: 'plinko',
    name: 'Plinko',
    description: 'Drop the ball and watch it bounce to big multipliers!',
    icon: Triangle,
    thumbnail: '/games/plinko.jpg',
    gradient: 'from-purple-500 via-pink-500 to-rose-500',
    href: '/games/plinko',
    players: 654,
    maxWin: '1,000x',
  },
  {
    id: 'mines',
    name: 'Mines',
    description: 'Uncover gems while avoiding hidden mines.',
    icon: Bomb,
    thumbnail: '/games/mines.jpg',
    gradient: 'from-emerald-500 via-green-500 to-lime-500',
    href: '/games/mines',
    players: 1089,
    maxWin: '24,750x',
  },
  {
    id: 'limbo',
    name: 'Limbo',
    description: 'Set your target and hope the multiplier goes higher!',
    icon: Zap,
    thumbnail: '/games/limbo.jpg',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    href: '/games/limbo',
    players: 432,
    maxWin: '1,000,000x',
  },
  {
    id: 'wheel',
    name: 'Wheel',
    description: 'Spin the wheel of fortune for instant prizes.',
    icon: CircleDot,
    thumbnail: '/games/wheel.jpg',
    gradient: 'from-fuchsia-500 via-purple-500 to-indigo-500',
    href: '/games/wheel',
    players: 567,
    maxWin: '49.5x',
  },
  {
    id: 'hash-dice',
    name: 'Hash Dice',
    description: 'Provably fair dice game using blockchain hashes.',
    icon: Hash,
    thumbnail: '/games/dice.jpg',
    gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
    href: '/games/hash-dice',
    players: 321,
    maxWin: '9,900x',
  },
  {
    id: 'keno',
    name: 'Keno',
    description: 'Pick your numbers and watch the draw!',
    icon: Grid3X3,
    thumbnail: '/games/keno.jpg',
    gradient: 'from-teal-500 via-emerald-500 to-green-500',
    href: '/games/keno',
    players: 278,
    maxWin: '10,000x',
  },
  {
    id: 'hilo',
    name: 'Hi-Lo',
    description: 'Guess if the next card is higher or lower.',
    icon: ArrowUpDown,
    thumbnail: '/games/hilo.jpg',
    gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
    href: '/games/hilo',
    players: 445,
    maxWin: '1,000x',
  },
  {
    id: 'tower',
    name: 'Tower',
    description: 'Climb the tower by choosing safe tiles on each level.',
    icon: Building2,
    thumbnail: '/games/tower.jpg',
    gradient: 'from-yellow-500 via-amber-500 to-orange-500',
    href: '/games/tower',
    players: 389,
    maxWin: '5,000x',
  },
];

function GameCard({ game, index }: { game: typeof ORIGINAL_GAMES[0]; index: number }) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const [floatValues, setFloatValues] = useState({ delay: '0s', duration: '8s' });

  useEffect(() => {
    setFloatValues({
      delay: `${(Math.random() * 5).toFixed(2)}s`,
      duration: `${(6 + Math.random() * 4).toFixed(2)}s`,
    });
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMouseX(x);
    setMouseY(y);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateXValue = ((centerY - y) / centerY) * 10;
    const rotateYValue = ((x - centerX) / centerX) * 10;
    
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      style={{ perspective: 1000 }}
    >
      <Link href={game.href}>
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          animate={{ rotateX, rotateY }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="group relative bg-[#1a2c38]/90 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden cursor-pointer
                     hover:border-gray-600 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all duration-300 flex flex-col h-full"
        >
          {/* Image container with 4/3 aspect ratio */}
          <div className="relative w-full aspect-[4/3] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={game.thumbnail} 
              alt={game.name}
              className="game-card-img absolute inset-0 w-full h-full object-cover"
              style={{ 
                '--float-delay': floatValues.delay, 
                '--float-duration': floatValues.duration 
              } as React.CSSProperties}
            />
            
            {/* Vignette overlay */}
            <div 
              className="absolute inset-0"
              style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.45) 100%)' }}
            />
            
            {/* Shimmer sweep container */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 overflow-hidden pointer-events-none transition-opacity duration-300">
               <div className="game-card-shimmer absolute inset-0" />
            </div>

            {/* Hover play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100
                            transition-opacity duration-300 bg-black/40">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-3 rounded-full bg-gradient-to-r ${game.gradient} text-white font-bold text-lg
                           shadow-2xl`}
              >
                Play Now
              </motion.div>
            </div>
          </div>

          {/* Bottom Info Panel */}
          <div className="p-4 flex-1 flex flex-col justify-between relative bg-[#1a2c38]">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-white mb-1">{game.name}</h3>
              <p className="text-sm text-gray-400 line-clamp-2">{game.description}</p>
            </div>
            {/* Stats */}
            <div className="flex items-center justify-between text-xs mt-auto">
              <div className="flex items-center gap-1 text-gray-500">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>{game.players.toLocaleString()} playing</span>
              </div>
              <span className="text-[#00e701] font-semibold">Max {game.maxWin}</span>
            </div>

            {/* Sheen reflection across the whole card */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay"
              style={{
                background: `radial-gradient(circle at ${mouseX}px ${mouseY + (cardRef.current ? cardRef.current.offsetHeight * (4/7) : 0)}px, rgba(255,255,255,0.15) 0%, transparent 60%)`
              }}
            />
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

export default function OriginalsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGames = ORIGINAL_GAMES.filter(game =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0f1923] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-10 bg-[#00e701] rounded-full" />
            <div>
              <h1 className="text-3xl font-bold text-white">
                Bb <span className="text-[#00e701]">Originals</span>
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Provably fair games built exclusively for Bb.GAME
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#1a2c38] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm
                         focus:outline-none focus:border-[#00e701]/50 w-64 placeholder:text-gray-600"
            />
          </div>
        </div>

        {/* Stats banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#00e701]/10 via-[#1a2c38] to-[#00e701]/10 border border-[#00e701]/20
                     rounded-xl p-6 mb-8 flex items-center justify-between"
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-white">10</div>
            <div className="text-xs text-gray-400">Original Games</div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-center">
            <div className="text-2xl font-bold text-[#00e701]">Provably Fair</div>
            <div className="text-xs text-gray-400">Blockchain Verified</div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-center">
            <div className="text-2xl font-bold text-white">1,000,000x</div>
            <div className="text-xs text-gray-400">Max Multiplier</div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {ORIGINAL_GAMES.reduce((sum, g) => sum + g.players, 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">Players Online</div>
          </div>
        </motion.div>

        {/* Game grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {filteredGames.map((game, index) => (
            <GameCard key={game.id} game={game} index={index} />
          ))}
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No games found matching &ldquo;{searchQuery}&rdquo;</p>
          </div>
        )}
      </div>
    </div>
  );
}
