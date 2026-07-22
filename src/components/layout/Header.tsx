'use client';

import React, { useState } from 'react';
import { Menu, MessageSquare, Wallet, LogIn, UserPlus, LogOut, User, Coins } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import useWalletStore from '@/store/walletStore';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatNumber } from '@/lib/utils';
import { COINS } from '@/lib/constants';

interface HeaderProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenWallet: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sidebarCollapsed,
  setSidebarCollapsed,
  chatOpen,
  setChatOpen,
  onOpenLogin,
  onOpenRegister,
  onOpenWallet,
}) => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { balances, selectedCoin, setSelectedCoin } = useWalletStore();
  const [coinDropdownOpen, setCoinDropdownOpen] = useState(false);

  const activeWallet = balances.find(w => w.coin === selectedCoin);
  const currentCoinInfo = COINS.find(c => c.symbol === selectedCoin);

  const handleCoinSelect = (coin: string) => {
    setSelectedCoin(coin as any);
    setCoinDropdownOpen(false);
  };

  return (
    <header className="fixed top-0 right-0 z-30 h-16 bg-[#0f1923]/95 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-4 transition-all duration-300 left-0 md:left-auto"
      style={{ left: sidebarCollapsed ? '64px' : '240px' }}
    >
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-tertiary md:hidden"
        >
          <Menu size={20} />
        </button>
        <span className="hidden md:inline-block text-xs font-bold text-gray-400 bg-secondary/80 px-3 py-1.5 rounded-md border border-gray-800">
          PROVABLY FAIR RNG
        </span>
      </div>

      {/* Right side / Action controls */}
      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            {/* Balance Selector */}
            <div className="relative">
              <div 
                onClick={() => setCoinDropdownOpen(!coinDropdownOpen)}
                className="flex items-center gap-2 bg-secondary border border-gray-800 hover:border-gray-700 px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200 select-none shadow-md shadow-black/10"
              >
                <div className="text-[13px] font-bold text-white flex items-center gap-1">
                  <Coins size={14} className="text-yellow-500" />
                  <span>{formatNumber(activeWallet?.balance || 0, 8)}</span>
                  <span className="text-gray-400 text-xs font-bold uppercase ml-1">
                    {selectedCoin}
                  </span>
                </div>
              </div>

              {/* Coin Dropdown */}
              {coinDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-secondary border border-gray-800 rounded-lg shadow-xl py-1 z-50 animate-fadeIn">
                  {balances.map((w) => (
                    <button
                      key={w.coin}
                      onClick={() => handleCoinSelect(w.coin)}
                      className={`w-full flex items-center justify-between px-4 py-2 hover:bg-tertiary text-left text-xs font-bold transition-all duration-150
                        ${selectedCoin === w.coin ? 'text-accent bg-tertiary/40' : 'text-gray-300'}`}
                    >
                      <span className="uppercase">{w.coin}</span>
                      <span>{formatNumber(w.balance, 6)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Wallet Button */}
            <Button 
              onClick={onOpenWallet} 
              variant="primary" 
              size="sm"
              className="flex items-center gap-1.5 px-3 py-1.5 font-bold"
            >
              <Wallet size={15} />
              <span className="hidden sm:inline">WALLET</span>
            </Button>

            {/* Profile Avatar / VIP Level */}
            <div className="flex items-center gap-2 border-l border-gray-800 pl-3">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-white max-w-[80px] truncate">
                  {user?.username}
                </span>
                <Badge level={user?.vip_level || 0} />
              </div>
              <div className="w-8 h-8 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center font-black text-accent text-sm uppercase">
                {user?.username?.[0] || 'U'}
              </div>
              
              {/* Logout Button */}
              <button
                onClick={logout}
                className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-tertiary/40 transition-colors duration-200"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onOpenLogin}
              className="text-gray-300 hover:text-white font-bold text-xs"
            >
              LOG IN
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={onOpenRegister}
              className="font-bold text-xs px-4"
            >
              SIGN UP
            </Button>
          </div>
        )}

        {/* Global Chat Toggle */}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className={`p-2 rounded-lg border transition-all duration-200
            ${chatOpen 
              ? 'bg-accent/10 border-accent/30 text-accent' 
              : 'bg-secondary border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'}`}
        >
          <MessageSquare size={18} />
        </button>
      </div>
    </header>
  );
};
