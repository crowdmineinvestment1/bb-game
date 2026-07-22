'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ShieldAlert, Lock, LogOut } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Read from sessionStorage to persist session while tab is open
    const authStatus = sessionStorage.getItem('admin_gate_authenticated');
    setIsAuthenticated(authStatus === 'true');
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '2005') {
      sessionStorage.setItem('admin_gate_authenticated', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid Admin Security Password!');
      setPassword('');
    }
  };

  // Wait for client-side load to prevent flicker
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0f1923] flex items-center justify-center">
        <div className="text-gray-500 font-bold animate-pulse uppercase tracking-wider text-xs">
          Loading Security Console...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-secondary/80 border-2 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)] rounded-3xl relative overflow-hidden space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-14 h-14 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center text-red-500 animate-pulse">
              <Lock size={24} />
            </div>
            <h2 className="text-lg font-black text-white uppercase tracking-widest pt-2">
              Security Authorization
            </h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              Protected Back-Office Area
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                Enter Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••"
                className="w-full bg-primary border border-gray-800 text-white rounded-xl p-3 text-center text-sm font-black focus:outline-none focus:border-red-500 tracking-[0.3em] placeholder:tracking-normal transition-colors"
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-bold uppercase">
                <ShieldAlert size={14} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" variant="danger" className="w-full font-bold uppercase py-3 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
              AUTHENTICATE CONSOLE
            </Button>
          </form>

          {/* Decorative bar */}
          <div className="absolute bottom-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-600 via-orange-500 to-red-600" />
        </Card>
      </div>
    );
  }

  // Render subpages if authenticated
  return (
    <div className="fixed inset-0 z-50 bg-[#0a0e14] flex flex-col overflow-hidden">
      <div className="h-14 bg-secondary border-b border-gray-800 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-2">
          <ShieldAlert size={20} className="text-red-500" />
          <h1 className="text-sm font-black text-white uppercase tracking-widest">🛡️ Bb.GAME ADMIN CONSOLE</h1>
        </div>
        <Button 
          variant="danger" 
          size="sm" 
          onClick={() => {
            sessionStorage.removeItem('admin_gate_authenticated');
            setIsAuthenticated(false);
          }}
          className="text-xs font-bold uppercase flex items-center gap-2"
        >
          <LogOut size={14} /> Logout
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {children}
      </div>
    </div>
  );
}
