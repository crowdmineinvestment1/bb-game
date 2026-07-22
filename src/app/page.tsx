'use client';

import React, { useState } from 'react';
import { HeroBanner } from '@/components/home/HeroBanner';
import { TopWinners } from '@/components/home/TopWinners';
import { CategoryTabs } from '@/components/home/CategoryTabs';
import { GameGrid } from '@/components/games/GameGrid';
import { LiveBetFeed } from '@/components/home/LiveBetFeed';
import { Input } from '@/components/ui/Input';
import { Search } from 'lucide-react';

export default function Home() {
  const [category, setCategory] = useState<'all' | 'originals' | 'slots' | 'live' | 'table'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6 pt-4 pb-12">
      {/* Hero promo banner */}
      <HeroBanner />

      {/* Top Winners scrolling ticker */}
      <TopWinners />

      {/* Lobby Navigation and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800/60 pb-1 mb-6">
        <CategoryTabs activeCategory={category} setActiveCategory={setCategory} />
        
        <div className="w-full md:w-72 mb-4 md:mb-0">
          <Input
            placeholder="Search game..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={16} className="text-gray-500" />}
          />
        </div>
      </div>

      {/* Split layout: Games on left/center, Live Bets on right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <GameGrid category={category} searchQuery={searchQuery} />
        </div>
        <div className="space-y-6">
          <LiveBetFeed />
        </div>
      </div>
    </div>
  );
}
