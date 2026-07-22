'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Search, Star, Flame, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const PROVIDERS = [
  'All', 'Pragmatic Play', 'NetEnt', 'Microgaming', 'Evolution',
  'Play\'n GO', 'Red Tiger', 'Big Time Gaming', 'Hacksaw', 'Nolimit City',
  'Push Gaming', 'Relax Gaming', 'Yggdrasil',
];

const SLOT_GAMES = [
  { id: 1, name: 'Gates of Olympus', provider: 'Pragmatic Play', badge: 'popular', rtp: 96.5, maxWin: '5,000x', gradient: 'from-yellow-600 to-amber-900' },
  { id: 2, name: 'Sweet Bonanza', provider: 'Pragmatic Play', badge: 'popular', rtp: 96.48, maxWin: '21,175x', gradient: 'from-pink-500 to-purple-600' },
  { id: 3, name: 'Big Bass Bonanza', provider: 'Pragmatic Play', badge: null, rtp: 96.71, maxWin: '2,100x', gradient: 'from-blue-500 to-teal-600' },
  { id: 4, name: 'The Dog House', provider: 'Pragmatic Play', badge: 'popular', rtp: 96.51, maxWin: '6,750x', gradient: 'from-amber-500 to-red-600' },
  { id: 5, name: 'Starburst', provider: 'NetEnt', badge: 'popular', rtp: 96.09, maxWin: '500x', gradient: 'from-purple-500 to-blue-500' },
  { id: 6, name: 'Gonzo\'s Quest', provider: 'NetEnt', badge: null, rtp: 95.97, maxWin: '2,500x', gradient: 'from-green-600 to-emerald-800' },
  { id: 7, name: 'Dead or Alive 2', provider: 'NetEnt', badge: null, rtp: 96.8, maxWin: '111,111x', gradient: 'from-yellow-700 to-red-900' },
  { id: 8, name: 'Divine Fortune', provider: 'NetEnt', badge: 'new', rtp: 96.59, maxWin: 'Progressive', gradient: 'from-indigo-500 to-purple-700' },
  { id: 9, name: 'Immortal Romance', provider: 'Microgaming', badge: null, rtp: 96.86, maxWin: '12,150x', gradient: 'from-red-800 to-purple-900' },
  { id: 10, name: 'Mega Moolah', provider: 'Microgaming', badge: 'popular', rtp: 88.12, maxWin: 'Progressive', gradient: 'from-yellow-500 to-green-700' },
  { id: 11, name: 'Thunderstruck II', provider: 'Microgaming', badge: null, rtp: 96.65, maxWin: '2,400,000', gradient: 'from-blue-700 to-indigo-900' },
  { id: 12, name: 'Book of Dead', provider: 'Play\'n GO', badge: 'popular', rtp: 96.21, maxWin: '5,000x', gradient: 'from-amber-600 to-amber-900' },
  { id: 13, name: 'Reactoonz', provider: 'Play\'n GO', badge: null, rtp: 96.51, maxWin: '4,570x', gradient: 'from-purple-500 to-pink-600' },
  { id: 14, name: 'Fire Joker', provider: 'Play\'n GO', badge: null, rtp: 96.15, maxWin: '800x', gradient: 'from-red-500 to-orange-600' },
  { id: 15, name: 'Bonanza', provider: 'Big Time Gaming', badge: 'popular', rtp: 96.0, maxWin: '10,000x', gradient: 'from-blue-600 to-cyan-700' },
  { id: 16, name: 'Extra Chilli', provider: 'Big Time Gaming', badge: 'new', rtp: 96.2, maxWin: '20,000x', gradient: 'from-red-500 to-yellow-600' },
  { id: 17, name: 'Wanted Dead or Wild', provider: 'Hacksaw', badge: 'new', rtp: 96.38, maxWin: '12,500x', gradient: 'from-amber-700 to-stone-800' },
  { id: 18, name: 'Chaos Crew', provider: 'Hacksaw', badge: null, rtp: 96.3, maxWin: '10,000x', gradient: 'from-cyan-500 to-blue-600' },
  { id: 19, name: 'Mental', provider: 'Nolimit City', badge: 'new', rtp: 96.09, maxWin: '66,666x', gradient: 'from-purple-600 to-red-700' },
  { id: 20, name: 'San Quentin', provider: 'Nolimit City', badge: 'popular', rtp: 96.03, maxWin: '150,000x', gradient: 'from-orange-600 to-gray-800' },
  { id: 21, name: 'Tombstone RIP', provider: 'Nolimit City', badge: null, rtp: 96.08, maxWin: '300,000x', gradient: 'from-red-900 to-gray-900' },
  { id: 22, name: 'Jammin\' Jars', provider: 'Push Gaming', badge: null, rtp: 96.83, maxWin: '20,000x', gradient: 'from-purple-500 to-blue-600' },
  { id: 23, name: 'Money Train 3', provider: 'Relax Gaming', badge: 'popular', rtp: 96.1, maxWin: '100,000x', gradient: 'from-yellow-600 to-red-700' },
  { id: 24, name: 'Vikings Go Berzerk', provider: 'Yggdrasil', badge: null, rtp: 96.1, maxWin: '4,000x', gradient: 'from-blue-600 to-teal-800' },
  { id: 25, name: 'Valley of the Gods', provider: 'Yggdrasil', badge: 'new', rtp: 96.2, maxWin: '3,600x', gradient: 'from-amber-500 to-orange-700' },
  { id: 26, name: 'Razor Shark', provider: 'Push Gaming', badge: 'popular', rtp: 96.7, maxWin: '50,000x', gradient: 'from-blue-500 to-cyan-700' },
  { id: 27, name: 'Dream Drop Jackpot', provider: 'Relax Gaming', badge: 'new', rtp: 94.0, maxWin: 'Progressive', gradient: 'from-indigo-500 to-violet-700' },
  { id: 28, name: 'Mystery Museum', provider: 'Push Gaming', badge: null, rtp: 96.65, maxWin: '25,000x', gradient: 'from-teal-600 to-emerald-800' },
];

const ITEMS_PER_PAGE = 12;

function SlotCard({ game, index }: { game: typeof SLOT_GAMES[0]; index: number }) {
  const [coords, setCoords] = useState({ rotateX: 0, rotateY: 0, x: 50, y: 50, active: false });

  // Use useMemo to generate float delays only once to prevent hydration mismatch
  const floatProps = useMemo(() => {
    return {
      '--float-delay': `${Math.random() * 2}s`,
      '--float-duration': `${3 + Math.random() * 2}s`
    } as React.CSSProperties;
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    
    const rotateY = ((x / box.width) - 0.5) * 24; // -12deg to 12deg
    const rotateX = (0.5 - (y / box.height)) * 24; // -12deg to 12deg
    
    const sheenX = (x / box.width) * 100;
    const sheenY = (y / box.height) * 100;
    
    setCoords({ rotateX, rotateY, x: sheenX, y: sheenY, active: true });
  };

  const handleMouseLeave = () => {
    setCoords({ rotateX: 0, rotateY: 0, x: 50, y: 50, active: false });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className="group relative"
    >
      <Link href={`/casino/slots/${game.id}`}>
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: `perspective(600px) rotateX(${coords.rotateX}deg) rotateY(${coords.rotateY}deg) scale3d(${coords.active ? 1.05 : 1}, ${coords.active ? 1.05 : 1}, 1)`,
            transition: coords.active ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
            transformStyle: 'preserve-3d',
          }}
          className="relative rounded-xl overflow-hidden cursor-pointer border border-transparent hover:border-gray-600 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-colors duration-300"
        >
          {/* Sheen reflection overlay */}
          {coords.active && (
            <div
              style={{
                background: `radial-gradient(circle 150px at ${coords.x}% ${coords.y}%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 80%)`,
                mixBlendMode: 'overlay',
              }}
              className="absolute inset-0 z-30 pointer-events-none"
            />
          )}

          {/* Thumbnail area */}
          <div className={`aspect-[3/4] bg-gradient-to-br ${game.gradient} relative overflow-hidden`}
            style={{ transform: 'translateZ(20px)' }}
          >
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-20" style={{ transform: 'translateZ(10px)' }}>
              <div className="absolute top-4 left-4 w-20 h-20 border-2 border-white/30 rounded-full" />
              <div className="absolute bottom-8 right-4 w-16 h-16 border-2 border-white/20 rounded-lg rotate-45" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/10 rounded-full" />
            </div>

            {/* 3D floating animation emoji */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="game-card-img text-[80px] opacity-40 select-none drop-shadow-2xl"
                style={{
                  transform: 'translateZ(40px)',
                  ...floatProps
                }}
              >
                🎰
              </div>
            </div>
            
            {/* Vignette overlay */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.45) 100%)', transform: 'translateZ(20px)' }} />

            {/* Badges */}
            {game.badge === 'popular' && (
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-orange-500/90 text-white text-[10px]
                              font-bold px-2 py-1 rounded-md z-10"
                style={{ transform: 'translateZ(30px)' }}
              >
                <Flame className="w-3 h-3" />
                HOT
              </div>
            )}
            {game.badge === 'new' && (
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#00e701]/90 text-black text-[10px]
                              font-bold px-2 py-1 rounded-md z-10"
                style={{ transform: 'translateZ(30px)' }}
              >
                <Sparkles className="w-3 h-3" />
                NEW
              </div>
            )}

            {/* Hover overlay & Shimmer */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200
                            flex flex-col items-center justify-center gap-3 z-20 overflow-hidden">
              <div className="game-card-shimmer" />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#00e701] text-black font-bold px-6 py-2.5 rounded-lg text-sm"
              >
                Play Now
              </motion.button>
              <button className="text-white/80 text-xs hover:text-white flex items-center gap-1">
                <Star className="w-3 h-3" /> Add to Favorites
              </button>
            </div>
          </div>

          {/* Info bar */}
          <div className="bg-[#1a2c38] border border-white/5 border-t-0 rounded-b-xl px-3 py-2 flex flex-col gap-1"
            style={{ transform: 'translateZ(10px)' }}
          >
            <div className="flex justify-between items-start">
              <span className="text-white text-sm font-bold truncate">{game.name}</span>
              <span className="text-[10px] text-[#00e701] font-semibold whitespace-nowrap ml-2">Max {game.maxWin}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-white/60 truncate">{game.provider}</span>
              <span className="text-[10px] text-gray-500 whitespace-nowrap ml-2">RTP {game.rtp}%</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function SlotsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredGames = useMemo(() => {
    return SLOT_GAMES.filter(game => {
      const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProvider = selectedProvider === 'All' || game.provider === selectedProvider;
      return matchesSearch && matchesProvider;
    });
  }, [searchQuery, selectedProvider]);

  const totalPages = Math.ceil(filteredGames.length / ITEMS_PER_PAGE);
  const paginatedGames = filteredGames.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-[#0f1923] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-10 bg-[#00e701] rounded-full" />
          <div>
            <h1 className="text-3xl font-bold text-white">Slots</h1>
            <p className="text-gray-400 text-sm">
              {filteredGames.length} games from top providers
            </p>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search slots by name..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full bg-[#1a2c38] border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white
                       focus:outline-none focus:border-[#00e701]/50 placeholder:text-gray-600"
          />
        </div>

        {/* Provider filter chips */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700">
          {PROVIDERS.map((provider) => (
            <button
              key={provider}
              onClick={() => { setSelectedProvider(provider); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200
                ${selectedProvider === provider
                  ? 'bg-[#00e701] text-black'
                  : 'bg-[#1a2c38] text-gray-400 hover:text-white border border-white/5 hover:border-white/20'
                }`}
            >
              {provider}
            </button>
          ))}
        </div>

        {/* Game grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedProvider}-${currentPage}-${searchQuery}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
          >
            {paginatedGames.map((game, index) => (
              <SlotCard key={game.id} game={game} index={index} />
            ))}
          </motion.div>
        </AnimatePresence>

        {paginatedGames.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No slots found</p>
            <p className="text-gray-600 text-sm mt-2">Try changing your search or filter</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-[#1a2c38] text-gray-400 hover:text-white disabled:opacity-30
                         disabled:cursor-not-allowed transition-colors border border-white/5"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-all
                  ${page === currentPage
                    ? 'bg-[#00e701] text-black'
                    : 'bg-[#1a2c38] text-gray-400 hover:text-white border border-white/5'
                  }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-[#1a2c38] text-gray-400 hover:text-white disabled:opacity-30
                         disabled:cursor-not-allowed transition-colors border border-white/5"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
