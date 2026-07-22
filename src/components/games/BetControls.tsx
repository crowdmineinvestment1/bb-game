'use client';

import React from 'react';
import { Button } from '../ui/Button';
import useWalletStore from '@/store/walletStore';
import { COINS } from '@/lib/constants';
import { Coins } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface BetControlsProps {
  betAmount: number;
  setBetAmount: (amount: number) => void;
  onBet: () => void;
  isGameRunning: boolean;
  buttonText?: string;
  disabled?: boolean;
}

export const BetControls: React.FC<BetControlsProps> = ({
  betAmount,
  setBetAmount,
  onBet,
  isGameRunning,
  buttonText = 'BET',
  disabled = false,
}) => {
  const { selectedCoin, getBalance } = useWalletStore();
  const balance = getBalance(selectedCoin);

  const handleHalf = () => {
    setBetAmount(Math.max(0.0001, betAmount / 2));
  };

  const handleDouble = () => {
    setBetAmount(Math.min(balance, betAmount * 2));
  };

  const handleMax = () => {
    setBetAmount(balance);
  };

  return (
    <div className="bg-secondary/40 border border-gray-800/80 rounded-xl p-4 md:p-5 flex flex-col gap-4 shadow-xl">
      {/* Bet Amount Input */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
          <span>Bet Amount</span>
          <span className="flex items-center gap-1">
            <Coins size={12} className="text-yellow-500" />
            {formatNumber(balance, 6)} {selectedCoin}
          </span>
        </div>
        
        <div className="relative flex items-center bg-primary border border-gray-800 focus-within:border-accent/40 rounded-lg overflow-hidden pr-2">
          <input
            type="number"
            step="any"
            value={betAmount || ''}
            onChange={(e) => setBetAmount(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full bg-transparent text-white font-bold placeholder-gray-500 py-3 px-3 focus:outline-none text-sm"
            disabled={isGameRunning || disabled}
          />
          <div className="flex gap-1">
            <button
              onClick={handleHalf}
              disabled={isGameRunning || disabled}
              className="text-xs font-bold bg-secondary hover:bg-tertiary px-2.5 py-1.5 rounded text-gray-300 hover:text-white transition-colors duration-150 disabled:opacity-50"
            >
              ½
            </button>
            <button
              onClick={handleDouble}
              disabled={isGameRunning || disabled}
              className="text-xs font-bold bg-secondary hover:bg-tertiary px-2.5 py-1.5 rounded text-gray-300 hover:text-white transition-colors duration-150 disabled:opacity-50"
            >
              2x
            </button>
            <button
              onClick={handleMax}
              disabled={isGameRunning || disabled}
              className="text-xs font-bold bg-secondary hover:bg-tertiary px-2.5 py-1.5 rounded text-gray-300 hover:text-white transition-colors duration-150 disabled:opacity-50"
            >
              MAX
            </button>
          </div>
        </div>
      </div>

      {/* Place Bet Button */}
      <Button
        onClick={onBet}
        variant={isGameRunning ? 'danger' : 'primary'}
        size="lg"
        className="w-full font-black text-sm uppercase py-4 shadow-lg tracking-widest transition-transform active:scale-[0.98]"
        disabled={disabled || betAmount <= 0 || (!isGameRunning && betAmount > balance)}
      >
        {buttonText}
      </Button>
    </div>
  );
};
