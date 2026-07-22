'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Gamepad2, 
  Tv, 
  Trophy, 
  Percent, 
  Crown, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Disc
} from 'lucide-react';
import { BbGameLogo } from '../BbGameLogo';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Lobby', path: '/', icon: Home },
    { name: 'Originals', path: '/casino/originals', icon: Gamepad2 },
    { name: 'Slots', path: '/casino/slots', icon: Disc },
    { name: 'Live Casino', path: '/casino/live', icon: Tv },
    { name: 'Sportsbook', path: '/sports', icon: Shield },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Promotions', path: '/promotions', icon: Percent },
  ];

  return (
    <aside 
      className={`fixed top-0 left-0 z-40 h-screen bg-primary border-r border-gray-800 transition-all duration-300 flex flex-col
        ${collapsed ? 'w-16' : 'w-60'}`}
    >
      {/* Header / Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800 bg-secondary/20">
        {!collapsed && (
          <Link href="/" className="flex items-center">
            <BbGameLogo size="md" glow />
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-tertiary transition-colors duration-200 ${collapsed ? 'mx-auto' : ''}`}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1.5 custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 group relative
                ${isActive 
                  ? 'bg-secondary text-accent border-l-2 border-accent pl-2.5' 
                  : 'text-gray-400 hover:text-white hover:bg-secondary/40'}`}
            >
              <Icon size={20} className={isActive ? 'text-accent' : 'text-gray-400 group-hover:text-white'} />
              {!collapsed && <span>{item.name}</span>}
              
              {/* Tooltip for collapsed mode */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2 py-1 bg-secondary text-white text-xs font-bold rounded-md border border-gray-800 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 shadow-xl">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800 bg-secondary/10 text-center">
        {!collapsed && (
          <div className="text-xs text-gray-500 font-semibold">
            <span>© 2026 Bb.GAME</span>
          </div>
        )}
      </div>
    </aside>
  );
};
