'use client';

import React from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div className={`flex border-b border-gray-800/80 bg-primary/20 p-1 rounded-lg gap-1 ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center justify-center gap-2 flex-1 px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 focus:outline-none
              ${isActive 
                ? 'bg-secondary text-accent shadow-md shadow-black/20' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-secondary/40'}`}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
