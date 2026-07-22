'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ChatPanel } from './ChatPanel';
import { MobileNav } from './MobileNav';
import { LoginModal } from '../auth/LoginModal';
import { RegisterModal } from '../auth/RegisterModal';
import { WalletModal } from '../wallet/WalletModal';
import { SupportWidget } from './SupportWidget';
import useAuthStore from '@/store/authStore';
import useWalletStore from '@/store/walletStore';

interface LayoutShellProps {
  children: React.ReactNode;
}

export const LayoutShell: React.FC<LayoutShellProps> = ({ children }) => {
  const { checkAuth, isAuthenticated } = useAuthStore();
  const { fetchBalances } = useWalletStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);

  // Check auth and fetch initial wallet balances on load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBalances();
    }
  }, [isAuthenticated, fetchBalances]);

  return (
    <div className="min-h-screen bg-primary text-white flex">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      {/* Main Wrapper */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300
        ${sidebarCollapsed ? 'md:pl-16' : 'md:pl-60'}
        ${chatOpen ? 'lg:pr-80' : 'lg:pr-0'}`}
      >
        {/* Header */}
        <Header 
          sidebarCollapsed={sidebarCollapsed} 
          setSidebarCollapsed={setSidebarCollapsed}
          chatOpen={chatOpen}
          setChatOpen={setChatOpen}
          onOpenLogin={() => setLoginOpen(true)}
          onOpenRegister={() => setRegisterOpen(true)}
          onOpenWallet={() => setWalletOpen(true)}
        />

        {/* Content */}
        <main className="flex-1 pt-16 pb-20 md:pb-6 overflow-y-auto px-4 md:px-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Global Right Chat */}
      <ChatPanel open={chatOpen} />

      {/* Mobile Bottom Navigation */}
      <MobileNav 
        chatOpen={chatOpen} 
        setChatOpen={setChatOpen}
        onOpenWallet={() => setWalletOpen(true)}
        onOpenLogin={() => setLoginOpen(true)}
      />

      {/* Auth Modals */}
      <LoginModal 
        isOpen={loginOpen} 
        onClose={() => setLoginOpen(false)} 
        onOpenRegister={() => {
          setLoginOpen(false);
          setRegisterOpen(true);
        }}
      />
      <RegisterModal 
        isOpen={registerOpen} 
        onClose={() => setRegisterOpen(false)} 
        onOpenLogin={() => {
          setRegisterOpen(false);
          setLoginOpen(true);
        }}
      />

      {/* Wallet Modal */}
      <WalletModal 
        isOpen={walletOpen} 
        onClose={() => setWalletOpen(false)} 
      />

      {/* Floating Support Widget */}
      <SupportWidget />
    </div>
  );
};
