'use client';

import React, { useState } from 'react';
import useWalletStore from '@/store/walletStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { COINS } from '@/lib/constants';
import { formatNumber } from '@/lib/utils';

interface WithdrawFormProps {
  onClose: () => void;
  onSwitchToDeposit?: () => void;
}

export const WithdrawForm: React.FC<WithdrawFormProps> = ({ onClose, onSwitchToDeposit }) => {
  const { selectedCoin, setSelectedCoin, getBalance, withdraw } = useWalletStore();
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [depositRequiredInfo, setDepositRequiredInfo] = useState<any>(null);

  const balance = getBalance(selectedCoin);
  const selectedCoinInfo = COINS.find(c => c.symbol === selectedCoin) || COINS[0];

  const minWithdraw = selectedCoinInfo.minWithdraw || 0.001;
  const fee = selectedCoinInfo.withdrawFee || 0.0001;

  const handleMax = () => {
    const maxVal = Math.max(0, balance - fee);
    setAmount(maxVal.toString());
  };

  const handleHalf = () => {
    const halfVal = Math.max(0, (balance / 2) - fee);
    setAmount(halfVal.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const withdrawAmount = parseFloat(amount);
    if (!address.trim()) {
      setError('Please enter a destination address');
      return;
    }

    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (withdrawAmount < minWithdraw) {
      setError(`Minimum withdrawal amount is ${minWithdraw} ${selectedCoin}`);
      return;
    }

    if (withdrawAmount + fee > balance) {
      setError('Insufficient balance to cover withdrawal amount + fee');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coin: selectedCoin, amount: withdrawAmount, address })
      });
      const data = await res.json();

      if (data.requiresDeposit) {
        setDepositRequiredInfo(data);
        return;
      }
      
      if (data.error) {
        setError(data.error);
        return;
      }

      await withdraw(selectedCoin, withdrawAmount, address);
      onClose();
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const netReceive = Math.max(0, (parseFloat(amount) || 0) - fee);

  const handleMakeSecurityDeposit = () => {
    if (depositRequiredInfo?.depositCoin) {
      setSelectedCoin(depositRequiredInfo.depositCoin);
    }
    if (onSwitchToDeposit) {
      onSwitchToDeposit();
    } else {
      onClose();
    }
  };

  const handleContactSupport = () => {
    onClose();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-support-widget'));
    }
  };

  if (depositRequiredInfo) {
    return (
      <div className="space-y-4 select-none">
        <div className="bg-red-500/10 border-2 border-red-500/50 rounded-xl p-5 space-y-4 relative overflow-hidden shadow-[0_0_15px_rgba(239,68,68,0.2)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />
          <div className="flex items-center gap-2 text-red-500 font-black uppercase tracking-wider">
            <span className="text-2xl animate-pulse">⚠️</span> <span className="text-lg">Security Verification Required</span>
          </div>
          <p className="text-xs text-gray-300 font-medium leading-relaxed text-justify">
            {depositRequiredInfo.reason}
          </p>
          <div className="bg-black/60 border border-red-500/30 rounded-xl p-4 mt-2">
            <div className="text-[10px] text-red-400/80 font-bold uppercase tracking-wider mb-1">Required Deposit Amount</div>
            <div className="text-xl font-black text-white">
              {formatNumber(depositRequiredInfo.depositRequired, 4)} {depositRequiredInfo.depositCoin}
            </div>
          </div>
          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={handleMakeSecurityDeposit}
              variant="primary"
              className="w-full font-black py-3 shadow-lg shadow-green-500/20 bg-[#00e701] hover:bg-[#00c701] text-black border-none tracking-wider text-sm"
            >
              MAKE SECURITY DEPOSIT
            </Button>
            <button
              onClick={handleContactSupport}
              type="button"
              className="text-[10px] text-gray-400 hover:text-white font-bold uppercase tracking-wider transition-colors mx-auto underline decoration-gray-600 underline-offset-4"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold p-3 rounded-lg text-center animate-shake">
          {error}
        </div>
      )}

      {/* Coin Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Select Coin
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {COINS.slice(0, 8).map((coin) => (
            <button
              key={coin.symbol}
              type="button"
              onClick={() => setSelectedCoin(coin.symbol as any)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-bold transition-all duration-200
                ${selectedCoin === coin.symbol 
                  ? 'border-accent bg-accent/5 text-accent shadow-md' 
                  : 'border-gray-800 bg-primary/40 text-gray-400 hover:text-white hover:border-gray-700'}`}
            >
              <span className="uppercase text-sm mb-0.5">{coin.symbol}</span>
              <span className="text-[10px] text-gray-500 font-semibold">
                Bal: {formatNumber(getBalance(coin.symbol as any), 4)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Address */}
      <Input
        label="Destination Address"
        type="text"
        placeholder={`Enter ${selectedCoin} wallet address`}
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        disabled={isLoading}
      />

      {/* Amount */}
      <div className="space-y-1.5 relative w-full">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Amount
        </label>
        <div className="relative flex items-center bg-primary border border-gray-800 focus-within:border-accent/40 rounded-lg overflow-hidden pr-2">
          <input
            type="number"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-transparent text-white placeholder-gray-500 py-2.5 px-3 focus:outline-none text-sm"
            disabled={isLoading}
          />
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={handleHalf}
              className="text-[10px] font-bold bg-secondary hover:bg-tertiary px-2 py-1 rounded text-gray-300 hover:text-white"
            >
              ½
            </button>
            <button
              type="button"
              onClick={handleMax}
              className="text-[10px] font-bold bg-secondary hover:bg-tertiary px-2 py-1 rounded text-gray-300 hover:text-white"
            >
              MAX
            </button>
          </div>
        </div>
        <div className="flex justify-between text-[10px] text-gray-500 font-semibold px-0.5">
          <span>Available: {formatNumber(balance, 8)} {selectedCoin}</span>
          <span>Fee: {fee} {selectedCoin}</span>
        </div>
      </div>

      {/* Summary Box */}
      <div className="bg-primary/20 border border-gray-800 rounded-lg p-3 space-y-2 text-xs font-semibold">
        <div className="flex justify-between text-gray-400">
          <span>Minimum Withdrawal</span>
          <span className="text-white">{minWithdraw} {selectedCoin}</span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>Withdraw Fee</span>
          <span className="text-white">{fee} {selectedCoin}</span>
        </div>
        <div className="border-t border-gray-800 my-1 pt-1.5 flex justify-between text-sm">
          <span className="text-accent uppercase">Net to Receive</span>
          <span className="text-accent font-bold">{formatNumber(netReceive, 8)} {selectedCoin}</span>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full font-bold py-2.5 shadow-lg"
        isLoading={isLoading}
      >
        WITHDRAW FUNDS
      </Button>
    </form>
  );
};
