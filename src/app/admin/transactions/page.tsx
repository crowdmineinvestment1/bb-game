'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatNumber } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { Check, X, ShieldAlert } from 'lucide-react';

interface AdminTransaction {
  id: string;
  user_id: string;
  coin: string;
  amount: number;
  type: string;
  status: string;
  tx_hash: string;
  created_at: string;
  users: {
    username: string;
  };
}

export default function AdminTransactionsPage() {
  const [txs, setTxs] = useState<AdminTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    const fetchTransactions = async () => {
      let query = supabase
        .from('transactions')
        .select('*, users(username)')
        .order('created_at', { ascending: false });

      if (activeTab === 'pending') {
        query = query.eq('status', 'pending');
      }

      const { data, error } = await query;
      if (!error && data) {
        setTxs(data as any[]);
      }
    };

    fetchTransactions();
  }, [activeTab]);

  const handleAction = async (txId: string, action: 'approve' | 'reject') => {
    const status = action === 'approve' ? 'completed' : 'rejected';
    try {
      const { error } = await (supabase as any)
        .from('transactions')
        .update({ status })
        .eq('id', txId);

      if (!error) {
        setTxs(prev => prev.filter(t => t.id !== txId));
        alert(`Transaction ${action}d successfully!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pt-4 pb-12">
      {/* Title */}
      <div className="flex flex-col gap-1 border-b border-gray-800/60 pb-4">
        <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">
          Transaction Queue
        </h1>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
          Review and approve pending crypto withdrawals
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 text-xs font-black rounded-lg border uppercase tracking-wider transition-all
            ${activeTab === 'pending' ? 'border-accent bg-accent/5 text-accent shadow-md' : 'border-gray-800 bg-secondary/30 text-gray-400 hover:text-white'}`}
        >
          PENDING REVIEW
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-xs font-black rounded-lg border uppercase tracking-wider transition-all
            ${activeTab === 'all' ? 'border-accent bg-accent/5 text-accent shadow-md' : 'border-gray-800 bg-secondary/30 text-gray-400 hover:text-white'}`}
        >
          ALL TRANSACTIONS
        </button>
      </div>

      {/* Table grid */}
      <Card className="bg-secondary/40 border border-gray-800/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-800 text-[10px] text-gray-500 font-bold uppercase tracking-wider bg-primary/10">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/40 text-xs font-semibold text-gray-300">
              {txs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 text-xs">
                    No transactions in queue.
                  </td>
                </tr>
              ) : (
                txs.map((tx) => {
                  const username = tx.users?.username || 'Anonymous';
                  return (
                    <tr key={tx.id} className="hover:bg-primary/20 transition-colors duration-150">
                      <td className="py-3.5 px-4 font-mono text-[10px] text-gray-400">{tx.id}</td>
                      <td className="py-3.5 px-4 text-white font-bold">{username}</td>
                      <td className="py-3.5 px-4 capitalize font-bold text-white">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border
                          ${tx.type === 'deposit' ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-white">
                        {formatNumber(tx.amount, 6)} <span className="text-[10px] text-gray-500 uppercase">{tx.coin}</span>
                      </td>
                      <td className="py-3.5 px-4 capitalize font-bold">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border
                          ${tx.status === 'completed' ? 'bg-accent/15 border-accent/30 text-accent' : ''}
                          ${tx.status === 'pending' ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-500' : ''}
                          ${tx.status === 'rejected' ? 'bg-red-500/15 border-red-500/30 text-red-500' : ''}`}
                        >
                          {tx.status || 'completed'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right flex justify-end gap-1.5">
                        {tx.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleAction(tx.id, 'approve')}
                              className="p-1.5 bg-accent/10 border border-accent/20 hover:border-accent text-accent rounded"
                              title="Approve Withdrawal"
                            >
                              <Check size={13} />
                            </button>
                            <button
                              onClick={() => handleAction(tx.id, 'reject')}
                              className="p-1.5 bg-red-600/10 border border-red-600/20 hover:border-red-600 text-red-500 rounded"
                              title="Reject Withdrawal"
                            >
                              <X size={13} />
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-500 text-[10px] uppercase font-bold mr-2">Setted</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
