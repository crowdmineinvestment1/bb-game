'use client';

import React from 'react';
import { Gamepad2, Disc, Tv, Layers, Flame } from 'lucide-react';

interface CategoryTabsProps {
  activeCategory: 'all' | 'originals' | 'slots' | 'live' | 'table';
  setActiveCategory: (cat: 'all' | 'originals' | 'slots' | 'live' | 'table') => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  activeCategory,
  setActiveCategory,
}) => {
  const tabs = [
    { id: 'all', label: 'LOBBY', icon: <Flame size={16} /> },
    { id: 'originals', label: 'ORIGINALS', icon: <Gamepad2 size={16} /> },
    { id: 'slots', label: 'SLOTS', icon: <Disc size={16} /> },
    { id: 'live', label: 'LIVE CASINO', icon: <Tv size={16} /> },
    { id: 'table', label: 'TABLE GAMES', icon: <Layers size={16} /> },
  ] as const;

  return (
    <div className="flex gap-2 border-b border-gray-800/80 pb-4 mb-6 overflow-x-auto custom-scrollbar whitespace-nowrap">
      {tabs.map((tab) => {
        const isActive = tab.id === activeCategory;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase rounded-lg border tracking-wider transition-all duration-200 focus:outline-none
              ${isActive 
                ? 'border-accent bg-accent/5 text-accent shadow-md shadow-accent/5' 
                : 'border-gray-800 bg-secondary/30 text-gray-400 hover:text-white hover:border-gray-700'}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
