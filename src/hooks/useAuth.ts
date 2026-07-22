'use client';

import { useAuthStore } from '@/store/authStore';
import { RegisterCredentials, LoginCredentials } from '@/types';
import { useState } from 'react';

export const useAuth = () => {
  const { login: storeLogin, logout: storeLogout, user, isAuthenticated, isLoading, error, setError, setLoading } = useAuthStore();
  const [localLoading, setLocalLoading] = useState(false);

  const register = async (credentials: RegisterCredentials) => {
    setLoading(true);
    setLocalLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      storeLogin(data.user, data.token);
      return { success: true };
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
      setLocalLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setLocalLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      storeLogin(data.user, data.token);
      return { success: true };
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
      setLocalLoading(false);
    }
  };

  const walletConnect = async (walletAddress: string) => {
    setLoading(true);
    setLocalLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/wallet-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Wallet connect failed');
      }

      storeLogin(data.user, data.token);
      return { success: true };
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
      setLocalLoading(false);
    }
  };

  const checkAuth = async () => {
    // Session persistent via Zustand middleware 'persist'
    // This is a stub if needed
  };

  return {
    register,
    login,
    walletConnect,
    logout: storeLogout,
    user,
    isAuthenticated,
    isLoading: isLoading || localLoading,
    error,
    checkAuth,
  };
};
