'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Tabs } from '../ui/Tabs';
import { DepositForm } from './DepositForm';
import { WithdrawForm } from './WithdrawForm';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('deposit');

  const tabs = [
    { id: 'deposit', label: 'DEPOSIT', icon: <ArrowDownLeft size={16} /> },
    { id: 'withdraw', label: 'WITHDRAW', icon: <ArrowUpRight size={16} /> },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="My Wallet" size="md">
      <div className="space-y-6">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        
        {activeTab === 'deposit' ? (
          <DepositForm onClose={onClose} />
        ) : (
          <WithdrawForm onClose={onClose} onSwitchToDeposit={() => setActiveTab('deposit')} />
        )}
      </div>
    </Modal>
  );
};
