'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Mail, Lock } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onOpenRegister,
}) => {
  const { login, walletConnect, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!email.trim() || !password.trim()) {
      setValidationError('All fields are required');
      return;
    }

    const result = await login({ email, password });
    if (result.success) {
      onClose();
    }
  };

  const handleWalletConnect = async () => {
    setValidationError(null);
    // Simple wallet connection mock
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        const result = await walletConnect(address);
        if (result.success) {
          onClose();
        }
      } catch (err: any) {
        setValidationError(err.message || 'MetaMask signature rejected');
      }
    } else {
      // Mock wallet connect for browsers without MetaMask
      const mockAddress = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
      const result = await walletConnect(mockAddress);
      if (result.success) {
        onClose();
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log In" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {(error || validationError) && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold p-3 rounded-lg text-center animate-shake">
            {error || validationError}
          </div>
        )}

        <Input
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail size={16} />}
          disabled={isLoading}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock size={16} />}
          disabled={isLoading}
        />

        <Button 
          type="submit" 
          variant="primary" 
          className="w-full font-bold py-2.5" 
          isLoading={isLoading}
        >
          LOG IN
        </Button>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-gray-800 w-full" />
          <span className="absolute bg-secondary px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            OR
          </span>
        </div>

        <Button
          type="button"
          onClick={handleWalletConnect}
          variant="secondary"
          className="w-full font-bold py-2.5 flex items-center justify-center gap-2 border border-gray-800"
          disabled={isLoading}
        >
          <svg className="w-4 h-4" viewBox="0 0 32 32" fill="none">
            <path d="M25.6 16c0-1-.8-1.8-1.8-1.8H12c-1 0-1.8.8-1.8 1.8s.8 1.8 1.8 1.8h11.8c1 0 1.8-.8 1.8-1.8z" fill="#E2761B"/>
            <path d="M29 8l-3.3-5.5C25.2 1.6 24.2 1 23.1 1H8.9C7.8 1 6.8 1.6 6.3 2.5L3 8c-.6 1-.6 2.2 0 3.2l3.3 5.5c.5.9 1.5 1.5 2.6 1.5h14.2c1.1 0 2.1-.6 2.6-1.5L29 11.2c.6-1 .6-2.2 0-3.2z" fill="#E4761B"/>
          </svg>
          CONNECT METAMASK
        </Button>

        <p className="text-center text-xs font-semibold text-gray-500 mt-6">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onOpenRegister}
            className="text-accent hover:underline focus:outline-none"
          >
            Sign up now
          </button>
        </p>
      </form>
    </Modal>
  );
};
