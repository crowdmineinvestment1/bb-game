'use client';

import React, { useState, useEffect } from 'react';
import { useWalletStore } from '@/store/walletStore';
import { Button } from '../ui/Button';
import { Copy, Check, Info } from 'lucide-react';
import { COINS } from '@/lib/constants';

interface DepositFormProps {
  onClose: () => void;
}

export const DepositForm: React.FC<DepositFormProps> = ({ onClose }) => {
  const { selectedCoin, setSelectedCoin, deposit, depositAddress, setDepositAddress } = useWalletStore();
  const [copied, setCopied] = useState(false);
  const [network, setNetwork] = useState('');
  const [mockCreditAmount, setMockCreditAmount] = useState('100');
  const [isCrediting, setIsCrediting] = useState(false);

  const selectedCoinInfo = COINS.find(c => c.symbol === selectedCoin) || COINS[0];

  // Load admin-configured addresses or generate new mock address when coin changes
  useEffect(() => {
    const fetchAdminWallet = async () => {
      try {
        const res = await fetch('/api/admin/deposit-wallets');
        const data = await res.json();
        if (data.success && data.wallets && data.wallets[selectedCoin]) {
          const cfg = data.wallets[selectedCoin];
          setDepositAddress(cfg.address);
          setNetwork(cfg.network);
          return;
        }
      } catch (err) {
        console.error('Error fetching admin wallets:', err);
      }

      // Fallback
      const prefixes: Record<string, string> = {
        BTC: '1',
        ETH: '0x',
        USDT: 'T',
        USDC: '0x',
        BNB: '0x',
        SOL: 'So1',
        DOGE: 'D',
        TRX: 'T',
      };
      const prefix = prefixes[selectedCoin] || '0x';
      const randHex = Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('');
      setDepositAddress(prefix + randHex);

      // Set default network
      if (selectedCoinInfo.networks && selectedCoinInfo.networks.length > 0) {
        setNetwork(selectedCoinInfo.networks[0]);
      } else {
        setNetwork('Mainnet');
      }
    };

    fetchAdminWallet();
  }, [selectedCoin, setDepositAddress, selectedCoinInfo]);

  const handleCopy = () => {
    navigator.clipboard.writeText(depositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMockCredit = async () => {
    setIsCrediting(true);
    const amount = parseFloat(mockCreditAmount);
    if (!isNaN(amount) && amount > 0) {
      await deposit(selectedCoin, amount);
    }
    setIsCrediting(false);
    onClose();
  };

  // Generate QR Code URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=0f1923&bgcolor=ffffff&data=${encodeURIComponent(depositAddress)}`;

  return (
    <div className="space-y-5">
      {/* Coin Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Select Coin
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {COINS.slice(0, 8).map((coin) => (
            <button
              key={coin.symbol}
              onClick={() => setSelectedCoin(coin.symbol as any)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-bold transition-all duration-200
                ${selectedCoin === coin.symbol 
                  ? 'border-accent bg-accent/5 text-accent shadow-md' 
                  : 'border-gray-800 bg-primary/40 text-gray-400 hover:text-white hover:border-gray-700'}`}
            >
              <span className="uppercase text-sm mb-0.5">{coin.symbol}</span>
              <span className="text-[10px] text-gray-500 font-semibold truncate max-w-full">
                {coin.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Network Selector */}
      {selectedCoinInfo.networks && selectedCoinInfo.networks.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Deposit Network
          </label>
          <div className="flex gap-2">
            {selectedCoinInfo.networks.map((net) => (
              <button
                key={net}
                onClick={() => setNetwork(net)}
                className={`px-3 py-1.5 rounded-md border text-xs font-bold transition-all duration-150
                  ${network === net 
                    ? 'border-accent bg-accent/5 text-accent' 
                    : 'border-gray-800 bg-primary/40 text-gray-400 hover:text-white hover:border-gray-700'}`}
              >
                {net}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* QR Code and Address Details */}
      <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-primary/30 border border-gray-800/60 rounded-xl">
        {/* QR Block */}
        <div className="w-32 h-32 bg-white rounded-lg p-2 flex items-center justify-center shadow-lg border border-gray-200">
          <img src={qrCodeUrl} alt="Deposit QR Code" className="w-full h-full object-contain" />
        </div>

        {/* Address and Copy */}
        <div className="flex-1 w-full space-y-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Your {selectedCoin} Deposit Address
            </span>
            <div className="flex items-center gap-2 bg-primary border border-gray-800 rounded-lg p-2.5 overflow-hidden">
              <span className="text-xs text-white font-mono truncate select-all flex-1">
                {depositAddress}
              </span>
              <button 
                onClick={handleCopy}
                className="text-gray-400 hover:text-white p-1 hover:bg-secondary rounded transition-colors duration-150"
              >
                {copied ? <Check size={16} className="text-accent" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
          
          <div className="flex items-start gap-1.5 text-[10px] text-gray-400 leading-normal font-semibold">
            <Info size={12} className="text-accent flex-shrink-0 mt-0.5" />
            <span>
              Send only {selectedCoin} to this address. Sending other coins may result in permanent loss.
            </span>
          </div>
        </div>
      </div>

      {/* Mock Credit Box for Demo */}
      <div className="border-t border-gray-800/80 pt-4 space-y-3">
        <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-left">
            <div className="text-xs font-bold text-accent uppercase tracking-wider">
              Demo Sandbox Mode
            </div>
            <div className="text-[10px] text-gray-400 font-semibold mt-0.5">
              Add mock funds to your balance instantly to test games.
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="number"
              value={mockCreditAmount}
              onChange={(e) => setMockCreditAmount(e.target.value)}
              className="w-20 bg-primary border border-gray-800 text-white font-bold text-center py-1.5 px-2 rounded-md text-xs focus:outline-none"
              min="1"
            />
            <Button
              onClick={handleMockCredit}
              variant="primary"
              size="sm"
              className="font-bold py-1.5 flex-1 sm:flex-none whitespace-nowrap"
              isLoading={isCrediting}
            >
              Credit {selectedCoin}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
