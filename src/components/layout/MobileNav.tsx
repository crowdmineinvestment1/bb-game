'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Gamepad2, Shield, MessageSquare, Wallet, User } from 'lucide-react';
import useAuthStore from '@/store/authStore';

interface MobileNavProps {
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  onOpenWallet: () => void;
  onOpenLogin: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  chatOpen,
  setChatOpen,
  onOpenWallet,
  onOpenLogin,
}) => {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Originals', path: '/casino/originals', icon: Gamepad2 },
    { name: 'Sports', path: '/sports', icon: Shield },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-primary/95 backdrop-blur-md border-t border-gray-800 flex items-center justify-around h-16 px-2 md:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path;
        return (
          <Link
            key={item.name}
            href={item.path}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold tracking-wider transition-colors duration-150
              ${isActive ? 'text-accent' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Icon size={20} className={isActive ? 'text-accent' : 'text-gray-500'} />
            <span className="mt-1">{item.name}</span>
          </Link>
        );
      })}

      {/* Wallet / Login */}
      <button
        onClick={isAuthenticated ? onOpenWallet : onOpenLogin}
        className="flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold tracking-wider text-gray-500 hover:text-gray-300"
      >
        <Wallet size={20} className={isAuthenticated ? 'text-accent' : 'text-gray-500'} />
        <span className="mt-1">{isAuthenticated ? 'Wallet' : 'Log In'}</span>
      </button>

      {/* Chat */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold tracking-wider transition-colors duration-150
          ${chatOpen ? 'text-accent' : 'text-gray-500 hover:text-gray-300'}`}
      >
        <MessageSquare size={20} className={chatOpen ? 'text-accent' : 'text-gray-500'} />
        <span className="mt-1">Chat</span>
      </button>
    </div>
  );
};
