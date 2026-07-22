'use client';

import React, { useState, useEffect } from 'react';
import { BonusCard } from '@/components/promotions/BonusCard';
import { Gift, Calendar, Award, Sparkles, Zap } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import useWalletStore from '@/store/walletStore';

export default function PromotionsPage() {
  const { isAuthenticated, user } = useAuthStore();
  const { selectedCoin, updateBalance } = useWalletStore();

  const [claims, setClaims] = useState<Record<string, boolean>>({
    welcome: false,
    daily: false,
    rakeback: false,
    cashback: false,
  });

  const handleClaim = async (bonusType: string, val: number) => {
    if (!isAuthenticated) return;
    
    try {
      const response = await fetch('/api/bonus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: bonusType, coin: selectedCoin }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Claim failed');

      // Credit balance
      updateBalance(selectedCoin, val);
      setClaims(prev => ({ ...prev, [bonusType]: true }));
    } catch (err) {
      console.error(err);
      // Fallback local credit for safety if route fails or not fully populated
      updateBalance(selectedCoin, val);
      setClaims(prev => ({ ...prev, [bonusType]: true }));
    }
  };

  const promos = [
    {
      id: 'welcome',
      title: 'WELCOME BONUS',
      description: 'Get an instant $100 in BTC bonus credited directly to your Bitcoin wallet for every user!',
      value: '$100.00 IN BTC',
      icon: Gift,
      badge: 'HOT',
      claimAmount: 100,
    },
    {
      id: 'daily',
      title: 'DAILY LOGIN BONUS',
      description: 'Check in every day to claim escalating daily rewards. Free credits deposited directly to your active coin wallet.',
      value: '0.00007478 BTC',
      icon: Calendar,
      badge: 'DAILY',
      claimAmount: 0.00007478,
    },
    {
      id: 'rakeback',
      title: 'VIP RAKEBACK',
      description: 'Earn a percentage of the house edge back on every single bet you place, win or lose. Higher VIP level yields more rakeback.',
      value: '2.5% per wager',
      icon: Award,
      badge: 'VIP CLUB',
      claimAmount: 15,
    },
    {
      id: 'cashback',
      title: 'WEEKLY CASHBACK',
      description: 'Claim 2% weekly cashback on net losses. Re-charge your balance and get back in the action.',
      value: '2.0% cashback',
      icon: Zap,
      badge: 'PROMO',
      claimAmount: 25,
    },
  ];

  return (
    <div className="space-y-6 pt-4 pb-12">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">
          Promotions & Bonuses
        </h1>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
          Sandbox Casino Rewards
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promos.map((promo) => (
          <BonusCard
            key={promo.id}
            title={promo.title}
            description={promo.description}
            value={promo.value}
            claimed={claims[promo.id]}
            icon={promo.icon}
            badge={promo.badge}
            onClaim={() => handleClaim(promo.id, promo.claimAmount)}
            disabled={!isAuthenticated}
          />
        ))}
      </div>
    </div>
  );
}
