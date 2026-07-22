'use client';

import React from 'react';
import { GameCard } from './GameCard';
import { GAMES_CATALOG } from '@/lib/constants';

interface GameGridProps {
  category?: 'all' | 'originals' | 'slots' | 'live' | 'table';
  searchQuery?: string;
}

export const GameGrid: React.FC<GameGridProps> = ({
  category = 'all',
  searchQuery = '',
}) => {
  // Filter the catalog
  const filteredGames = GAMES_CATALOG.filter((game) => {
    // Filter by category
    if (category !== 'all' && game.category !== category) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !game.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-4">
      {filteredGames.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-500 font-bold bg-secondary/10 border border-gray-800 rounded-xl">
          No games found.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              id={game.id}
              name={game.name}
              type={game.type}
              category={game.category}
              thumbnail={game.thumbnail}
              provider={game.provider}
              isLive={game.category === 'live'}
            />
          ))}
        </div>
      )}
    </div>
  );
};
