'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, Search } from 'lucide-react';

const CATEGORIES = ['All', 'Blackjack', 'Roulette', 'Baccarat', 'Game Shows'];

const LIVE_GAMES = [
  // Blackjack
  { id: 1, name: 'Blackjack VIP', category: 'Blackjack', provider: 'Evolution', players: 42, minBet: 25, maxBet: 10000, dealer: 'Elena', gradient: 'from-emerald-700 to-green-900', thumbnail: '/games/blackjack.jpg' },
  { id: 2, name: 'Speed Blackjack', category: 'Blackjack', provider: 'Evolution', players: 67, minBet: 5, maxBet: 5000, dealer: 'Michael', gradient: 'from-emerald-600 to-teal-800', thumbnail: '/games/blackjack.jpg' },
  { id: 3, name: 'Infinite Blackjack', category: 'Blackjack', provider: 'Evolution', players: 189, minBet: 1, maxBet: 2500, dealer: 'Sophie', gradient: 'from-green-600 to-emerald-900', thumbnail: '/games/blackjack.jpg' },
  { id: 4, name: 'Lightning Blackjack', category: 'Blackjack', provider: 'Evolution', players: 156, minBet: 1, maxBet: 5000, dealer: 'James', gradient: 'from-yellow-600 to-amber-900', thumbnail: '/games/blackjack.jpg' },
  // Roulette
  { id: 5, name: 'Lightning Roulette', category: 'Roulette', provider: 'Evolution', players: 312, minBet: 0.20, maxBet: 10000, dealer: 'Anna', gradient: 'from-yellow-500 to-amber-800', thumbnail: '/games/roulette.jpg' },
  { id: 6, name: 'Immersive Roulette', category: 'Roulette', provider: 'Evolution', players: 98, minBet: 1, maxBet: 5000, dealer: 'David', gradient: 'from-red-700 to-rose-900', thumbnail: '/games/roulette.jpg' },
  { id: 7, name: 'Auto Roulette', category: 'Roulette', provider: 'Evolution', players: 234, minBet: 0.10, maxBet: 5000, dealer: 'Auto', gradient: 'from-red-600 to-orange-800', thumbnail: '/games/roulette.jpg' },
  { id: 8, name: 'Speed Roulette', category: 'Roulette', provider: 'Evolution', players: 145, minBet: 0.50, maxBet: 5000, dealer: 'Maria', gradient: 'from-rose-600 to-red-800', thumbnail: '/games/roulette.jpg' },
  // Baccarat
  { id: 9, name: 'Speed Baccarat', category: 'Baccarat', provider: 'Evolution', players: 87, minBet: 5, maxBet: 10000, dealer: 'Li Wei', gradient: 'from-red-800 to-yellow-900', thumbnail: '/games/baccarat.jpg' },
  { id: 10, name: 'Lightning Baccarat', category: 'Baccarat', provider: 'Evolution', players: 203, minBet: 1, maxBet: 5000, dealer: 'Sakura', gradient: 'from-amber-600 to-red-800', thumbnail: '/games/baccarat.jpg' },
  { id: 11, name: 'No Commission Baccarat', category: 'Baccarat', provider: 'Evolution', players: 56, minBet: 5, maxBet: 25000, dealer: 'Chen', gradient: 'from-yellow-700 to-orange-900', thumbnail: '/games/baccarat.jpg' },
  // Game Shows
  { id: 12, name: 'Crazy Time', category: 'Game Shows', provider: 'Evolution', players: 567, minBet: 0.10, maxBet: 2500, dealer: 'Multiple', gradient: 'from-yellow-400 to-orange-600', thumbnail: '/games/wheel.jpg' },
  { id: 13, name: 'Monopoly Live', category: 'Game Shows', provider: 'Evolution', players: 445, minBet: 0.10, maxBet: 2500, dealer: 'Mr. Monopoly', gradient: 'from-green-500 to-teal-700', thumbnail: '/games/wheel.jpg' },
  { id: 14, name: 'Dream Catcher', category: 'Game Shows', provider: 'Evolution', players: 234, minBet: 0.10, maxBet: 2500, dealer: 'Sarah', gradient: 'from-purple-500 to-pink-700', thumbnail: '/games/wheel.jpg' },
  { id: 15, name: 'Mega Ball', category: 'Game Shows', provider: 'Evolution', players: 178, minBet: 0.10, maxBet: 2500, dealer: 'Alex', gradient: 'from-blue-500 to-indigo-700', thumbnail: '/games/wheel.jpg' },
  { id: 16, name: 'Deal or No Deal', category: 'Game Shows', provider: 'Evolution', players: 123, minBet: 0.10, maxBet: 2500, dealer: 'Host', gradient: 'from-orange-500 to-red-700', thumbnail: '/games/wheel.jpg' },
];

function LiveGameCard({ game, index }: { game: typeof LIVE_GAMES[0]; index: number }) {
  const [coords, setCoords] = useState({ rotateX: 0, rotateY: 0, x: 50, y: 50, active: false });
  const [animationStyle] = useState(() => ({
    '--float-delay': `${Math.random()}s`,
    '--float-duration': `${Math.random() * 4 + 6}s`
  } as React.CSSProperties));

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    
    const rotateY = ((x / box.width) - 0.5) * 20; // -10deg to 10deg
    const rotateX = (0.5 - (y / box.height)) * 20; // -10deg to 10deg
    
    const sheenX = (x / box.width) * 100;
    const sheenY = (y / box.height) * 100;
    
    setCoords({ rotateX, rotateY, x: sheenX, y: sheenY, active: true });
  };

  const handleMouseLeave = () => {
    setCoords({ rotateX: 0, rotateY: 0, x: 50, y: 50, active: false });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="group"
    >
      <Link href={`/casino/live/${game.id}`}>
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: `perspective(600px) rotateX(${coords.rotateX}deg) rotateY(${coords.rotateY}deg) scale3d(${coords.active ? 1.05 : 1}, ${coords.active ? 1.05 : 1}, 1)`,
            transition: coords.active ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
            transformStyle: 'preserve-3d',
          }}
          className="relative rounded-xl overflow-hidden cursor-pointer hover:border-gray-600 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all duration-300"
        >
          {/* Sheen reflection overlay */}
          {coords.active && (
            <div
              style={{
                background: `radial-gradient(circle 120px at ${coords.x}% ${coords.y}%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 80%)`,
                mixBlendMode: 'overlay',
              }}
              className="absolute inset-0 z-30 pointer-events-none"
            />
          )}

          {/* Thumbnail */}
          <div className="aspect-video bg-gray-900 relative overflow-hidden"
            style={{ transform: 'translateZ(20px)' }}
          >
            <img 
              src={game.thumbnail} 
              alt={game.name}
              className="absolute inset-0 w-full h-full object-cover game-card-img"
              style={animationStyle}
            />

            <div 
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.45) 100%)' }}
            />

            {/* LIVE badge */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10" style={{ transform: 'translateZ(25px)' }}>
              <div className="flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                LIVE
              </div>
            </div>

            {/* Player count */}
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 text-white text-[10px]
                            px-2 py-1 rounded backdrop-blur-sm z-10"
              style={{ transform: 'translateZ(25px)' }}
            >
              <Users className="w-3 h-3" />
              {game.players}
            </div>

            {/* Hover overlay & Shimmer */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200
                            flex items-center justify-center z-20 overflow-hidden">
              <div className="game-card-shimmer pointer-events-none" />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#00e701] text-black font-bold px-6 py-2.5 rounded-lg text-sm z-10"
              >
                Join Table
              </motion.button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-[#1a2c38] border border-white/5 border-t-0 rounded-b-xl p-3"
            style={{ transform: 'translateZ(10px)' }}
          >
            <h3 className="text-white font-semibold text-sm truncate">{game.name}</h3>
            <div className="flex items-center justify-between mt-1">
              <span className="text-gray-500 text-xs">{game.provider}</span>
              <span className="text-gray-500 text-xs">
                ${game.minBet} - ${game.maxBet.toLocaleString()}
              </span>
            </div>
            <div className="text-gray-600 text-[10px] mt-1">Dealer: {game.dealer}</div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function LiveCasinoPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGames = LIVE_GAMES.filter(game => {
    const matchesCategory = selectedCategory === 'All' || game.category === selectedCategory;
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPlayers = LIVE_GAMES.reduce((sum, g) => sum + g.players, 0);

  return (
    <div className="min-h-screen bg-[#0f1923] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-10 bg-red-500 rounded-full" />
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                Live Casino
                <span className="flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  LIVE
                </span>
              </h1>
              <p className="text-gray-400 text-sm">
                {totalPlayers.toLocaleString()} players at {LIVE_GAMES.length} tables
              </p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search tables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#1a2c38] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm
                         focus:outline-none focus:border-red-500/50 w-64 placeholder:text-gray-600"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${selectedCategory === cat
                  ? 'bg-red-600 text-white'
                  : 'bg-[#1a2c38] text-gray-400 hover:text-white border border-white/5 hover:border-white/20'
                }`}
            >
              {cat}
              {cat !== 'All' && (
                <span className="ml-1.5 text-xs opacity-60">
                  ({LIVE_GAMES.filter(g => g.category === cat).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Games grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredGames.map((game, index) => (
            <LiveGameCard key={game.id} game={game} index={index} />
          ))}
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No live tables found</p>
          </div>
        )}
      </div>
    </div>
  );
}
