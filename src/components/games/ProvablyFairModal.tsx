'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useGameStore } from '@/store/gameStore';
import { verifyGame } from '@/lib/provably-fair';
import { Info, HelpCircle } from 'lucide-react';

interface ProvablyFairModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProvablyFairModal: React.FC<ProvablyFairModalProps> = ({ isOpen, onClose }) => {
  const { clientSeed, setClientSeed, serverSeedHash, nonce, newClientSeed } = useGameStore();
  
  // States for live settings
  const [tempClientSeed, setTempClientSeed] = useState(clientSeed);
  
  // States for verification tool
  const [verifyServerSeed, setVerifyServerSeed] = useState('');
  const [verifyClientSeed, setVerifyClientSeed] = useState('');
  const [verifyNonce, setVerifyNonce] = useState('0');
  const [verifyGameType, setVerifyGameType] = useState<'crash' | 'dice' | 'plinko' | 'mines' | 'limbo' | 'wheel'>('dice');
  const [verifyResult, setVerifyResult] = useState<string | null>(null);

  useEffect(() => {
    setTempClientSeed(clientSeed);
  }, [clientSeed]);

  const handleSaveClientSeed = () => {
    if (tempClientSeed.trim()) {
      setClientSeed(tempClientSeed.trim());
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyResult(null);

    if (!verifyServerSeed.trim() || !verifyClientSeed.trim()) {
      setVerifyResult('Please fill in both seeds');
      return;
    }

    try {
      const v = await verifyGame(
        verifyServerSeed.trim(),
        verifyClientSeed.trim(),
        parseInt(verifyNonce) || 0,
        verifyGameType
      );
      setVerifyResult(v.details);
    } catch (err: any) {
      setVerifyResult(`Error: ${err.message}`);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Provably Fair Setup" size="md">
      <div className="space-y-6 text-xs text-gray-300 font-medium">
        
        {/* Concept description */}
        <div className="flex gap-2.5 p-3.5 bg-primary/30 border border-gray-800 rounded-xl leading-relaxed">
          <Info size={16} className="text-accent flex-shrink-0 mt-0.5" />
          <span>
            Provably Fair RNG allows you to verify that every bet outcome is pre-determined and completely untampered. The house cannot manipulate rolls once the server seed is committed.
          </span>
        </div>

        {/* Current Seeds Section */}
        <div className="space-y-4 border-b border-gray-800/80 pb-5">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            Active Seeds
          </h4>
          
          <Input
            label="Active Client Seed"
            type="text"
            value={tempClientSeed}
            onChange={(e) => setTempClientSeed(e.target.value)}
            rightIcon={
              <button
                onClick={handleSaveClientSeed}
                className="text-[10px] font-bold text-accent hover:underline uppercase"
              >
                Change
              </button>
            }
          />

          <Input
            label="Active Server Seed Hash (SHA256)"
            type="text"
            value={serverSeedHash || 'd8a8b8c8d8e8f8... (committed)'}
            disabled
            className="font-mono text-[11px]"
          />

          <div className="flex justify-between items-center text-xs">
            <span>Current Nonce (Bets placed on these seeds): <strong className="text-white">{nonce}</strong></span>
            <button
              onClick={newClientSeed}
              className="text-accent hover:underline font-bold"
            >
              Rotate Seeds
            </button>
          </div>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleVerify} className="space-y-4">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle size={16} className="text-gray-400" />
            Verify Game Outcome
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Reveal Server Seed"
              placeholder="Hex string (previous unhashed seed)"
              value={verifyServerSeed}
              onChange={(e) => setVerifyServerSeed(e.target.value)}
            />
            <Input
              label="Client Seed"
              placeholder="Client seed used for that bet"
              value={verifyClientSeed}
              onChange={(e) => setVerifyClientSeed(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nonce"
              type="number"
              value={verifyNonce}
              onChange={(e) => setVerifyNonce(e.target.value)}
            />
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Game Type
              </label>
              <select
                value={verifyGameType}
                onChange={(e: any) => setVerifyGameType(e.target.value)}
                className="w-full bg-primary border border-gray-800 text-white rounded-md py-2 px-3 text-xs focus:outline-none"
              >
                <option value="crash">Crash</option>
                <option value="dice">Dice</option>
                <option value="plinko">Plinko</option>
                <option value="mines">Mines</option>
                <option value="limbo">Limbo</option>
                <option value="wheel">Wheel</option>
              </select>
            </div>
          </div>

          <Button type="submit" variant="secondary" className="w-full font-bold">
            RUN LOCAL COMPUTATION
          </Button>

          {verifyResult && (
            <div className="p-3 bg-secondary border border-gray-800 rounded-lg text-center font-bold text-accent text-sm">
              {verifyResult}
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
};
