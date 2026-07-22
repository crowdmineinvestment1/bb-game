'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Sparkles, LucideIcon } from 'lucide-react';

interface BonusCardProps {
  title: string;
  description: string;
  value: string;
  claimed: boolean;
  onClaim: () => void;
  icon: LucideIcon;
  badge?: string;
  disabled?: boolean;
}

export const BonusCard: React.FC<BonusCardProps> = ({
  title,
  description,
  value,
  claimed,
  onClaim,
  icon: Icon,
  badge,
  disabled = false,
}) => {
  return (
    <Card className="flex flex-col bg-secondary border border-gray-800 rounded-2xl overflow-hidden shadow-xl p-5 justify-between min-h-[220px] relative">
      {badge && (
        <span className="absolute top-3 right-3 bg-accent/15 border border-accent/30 text-accent font-black text-[9px] uppercase px-2 py-0.5 rounded-full tracking-wider">
          {badge}
        </span>
      )}
      
      <div className="space-y-3">
        {/* Header Icon */}
        <div className="bg-accent/10 border border-accent/20 text-accent p-2.5 rounded-lg inline-flex items-center justify-center">
          <Icon size={20} />
        </div>

        {/* Title & Desc */}
        <div className="space-y-1">
          <h3 className="text-sm font-black text-white uppercase tracking-wider">
            {title}
          </h3>
          <p className="text-xs text-gray-400 font-semibold leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Value display and Claim button */}
      <div className="flex items-center justify-between border-t border-gray-800/60 pt-4 mt-4 gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            Bonus Value
          </span>
          <span className="text-sm font-black text-white">
            {value}
          </span>
        </div>

        <Button
          onClick={onClaim}
          variant={claimed ? 'secondary' : 'primary'}
          size="sm"
          className="font-bold py-1.5 px-4 text-xs"
          disabled={claimed || disabled}
        >
          {claimed ? 'CLAIMED' : 'CLAIM'}
        </Button>
      </div>
    </Card>
  );
};
