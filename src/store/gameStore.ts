'use client';

import { create } from 'zustand';
import { GameType, CoinType, Bet, BetStatus } from '@/types';
import { DEFAULT_BET_AMOUNT, DEFAULT_COIN } from '@/lib/constants';
import { generateClientSeed } from '@/lib/utils';

interface AutoBetConfig {
  enabled: boolean;
  numberOfBets: number;
  betsPlaced: number;
  onWin: 'reset' | 'increase';
  onLoss: 'reset' | 'increase';
  winIncreasePercent: number;
  lossIncreasePercent: number;
  stopOnProfit: number;
  stopOnLoss: number;
  currentProfit: number;
}

interface GameState {
  currentGame: GameType | null;
  betAmount: number;
  selectedCoin: CoinType;
  clientSeed: string;
  serverSeedHash: string;
  nonce: number;
  isPlaying: boolean;
  lastBet: Bet | null;
  betHistory: Bet[];
  autoBet: AutoBetConfig;

  setCurrentGame: (game: GameType | null) => void;
  setBetAmount: (amount: number) => void;
  setSelectedCoin: (coin: CoinType) => void;
  setClientSeed: (seed: string) => void;
  setServerSeedHash: (hash: string) => void;
  incrementNonce: () => void;
  setIsPlaying: (playing: boolean) => void;
  setLastBet: (bet: Bet | null) => void;
  addBetToHistory: (bet: Bet) => void;
  clearHistory: () => void;
  halfBet: () => void;
  doubleBet: () => void;
  setAutoBet: (config: Partial<AutoBetConfig>) => void;
  resetAutoBet: () => void;
  newClientSeed: () => void;
}

const defaultAutoBet: AutoBetConfig = {
  enabled: false,
  numberOfBets: 0,
  betsPlaced: 0,
  onWin: 'reset',
  onLoss: 'reset',
  winIncreasePercent: 100,
  lossIncreasePercent: 100,
  stopOnProfit: 0,
  stopOnLoss: 0,
  currentProfit: 0,
};

export const useGameStore = create<GameState>()((set, get) => ({
  currentGame: null,
  betAmount: DEFAULT_BET_AMOUNT,
  selectedCoin: DEFAULT_COIN,
  clientSeed: generateClientSeed(),
  serverSeedHash: '',
  nonce: 0,
  isPlaying: false,
  lastBet: null,
  betHistory: [],
  autoBet: { ...defaultAutoBet },

  setCurrentGame: (game) => set({ currentGame: game }),
  setBetAmount: (amount) => set({ betAmount: Math.max(0, amount) }),
  setSelectedCoin: (coin) => set({ selectedCoin: coin }),
  setClientSeed: (seed) => set({ clientSeed: seed }),
  setServerSeedHash: (hash) => set({ serverSeedHash: hash }),
  incrementNonce: () => set((state) => ({ nonce: state.nonce + 1 })),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setLastBet: (bet) => set({ lastBet: bet }),

  addBetToHistory: (bet) => {
    const history = [bet, ...get().betHistory].slice(0, 50);
    set({ betHistory: history });
  },

  clearHistory: () => set({ betHistory: [] }),

  halfBet: () => {
    const current = get().betAmount;
    set({ betAmount: Math.max(DEFAULT_BET_AMOUNT, current / 2) });
  },

  doubleBet: () => {
    const current = get().betAmount;
    set({ betAmount: current * 2 });
  },

  setAutoBet: (config) => {
    set((state) => ({
      autoBet: { ...state.autoBet, ...config },
    }));
  },

  resetAutoBet: () => set({ autoBet: { ...defaultAutoBet } }),

  newClientSeed: () => set({ clientSeed: generateClientSeed(), nonce: 0 }),
}));
