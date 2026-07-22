'use client';

import { create } from 'zustand';
import { CoinType, Transaction } from '@/types';
import { DEFAULT_COIN } from '@/lib/constants';

interface WalletBalance {
  coin: CoinType;
  balance: number;
  locked: number;
  usdValue: number;
}

interface WalletState {
  balances: WalletBalance[];
  selectedCoin: CoinType;
  isWalletOpen: boolean;
  isLoading: boolean;
  transactions: Transaction[];
  depositAddress: string;
  totalUsdBalance: number;

  setSelectedCoin: (coin: CoinType) => void;
  setWalletOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  setBalances: (balances: WalletBalance[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setDepositAddress: (address: string) => void;
  updateBalance: (coin: CoinType, amount: number) => void;

  fetchBalances: () => Promise<void>;
  deposit: (coin: CoinType, amount: number) => Promise<void>;
  withdraw: (coin: CoinType, amount: number, address: string) => Promise<void>;

  getBalance: (coin: CoinType) => number;
}

export const useWalletStore = create<WalletState>()((set, get) => ({
  balances: [
    { coin: 'BTC', balance: 0.05432, locked: 0, usdValue: 3259.2 },
    { coin: 'ETH', balance: 1.2345, locked: 0, usdValue: 4321.75 },
    { coin: 'USDT', balance: 1500.0, locked: 0, usdValue: 1500.0 },
    { coin: 'USDC', balance: 750.5, locked: 0, usdValue: 750.5 },
    { coin: 'BNB', balance: 3.45, locked: 0, usdValue: 1035.0 },
    { coin: 'SOL', balance: 25.8, locked: 0, usdValue: 4128.0 },
    { coin: 'DOGE', balance: 15000, locked: 0, usdValue: 1950.0 },
    { coin: 'TRX', balance: 50000, locked: 0, usdValue: 5500.0 },
    { coin: 'LTC', balance: 5.5, locked: 0, usdValue: 467.5 },
    { coin: 'XRP', balance: 2500, locked: 0, usdValue: 1500.0 },
    { coin: 'ADA', balance: 5000, locked: 0, usdValue: 2250.0 },
    { coin: 'MATIC', balance: 3000, locked: 0, usdValue: 2100.0 },
  ],
  selectedCoin: DEFAULT_COIN,
  isWalletOpen: false,
  isLoading: false,
  transactions: [],
  depositAddress: '',
  totalUsdBalance: 28762.0,

  setSelectedCoin: (coin) => set({ selectedCoin: coin }),
  setWalletOpen: (open) => set({ isWalletOpen: open }),
  setLoading: (loading) => set({ isLoading: loading }),
  setBalances: (balances) => {
    const totalUsd = balances.reduce((sum, b) => sum + b.usdValue, 0);
    set({ balances, totalUsdBalance: totalUsd });
  },
  setTransactions: (transactions) => set({ transactions }),
  setDepositAddress: (address) => set({ depositAddress: address }),

  updateBalance: (coin, amount) => {
    const balances = get().balances.map((b) =>
      b.coin === coin ? { ...b, balance: b.balance + amount } : b
    );
    const totalUsd = balances.reduce((sum, b) => sum + b.usdValue, 0);
    set({ balances, totalUsdBalance: totalUsd });
  },

  fetchBalances: async () => {
    set({ isLoading: true });
    try {
      // In production, this would fetch from the API
      await new Promise((resolve) => setTimeout(resolve, 500));
      set({ isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  deposit: async (coin, amount) => {
    set({ isLoading: true });
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      get().updateBalance(coin, amount);
      set({ isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  withdraw: async (coin, amount, _address) => {
    set({ isLoading: true });
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      get().updateBalance(coin, -amount);
      set({ isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  getBalance: (coin) => {
    const balance = get().balances.find((b) => b.coin === coin);
    return balance?.balance ?? 0;
  },
}));

export default useWalletStore;
