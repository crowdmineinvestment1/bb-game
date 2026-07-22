'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Search, UserMinus, UserCheck, Edit2, X, Trash, Save } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  plain_password?: string;
  vip_level: number;
  role: string;
  is_banned: boolean;
  created_at: string;
  wallets: Record<string, number>;
}

const COINS = ['BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'SOL', 'DOGE', 'TRX', 'LTC', 'XRP'];

function UserControllerModal({ user, onClose, onRefresh }: { user: AdminUser, onClose: () => void, onRefresh: () => void }) {
  const [coin, setCoin] = useState('BTC');
  const [amount, setAmount] = useState('');

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);

  // New tx state
  const [newTxType, setNewTxType] = useState('deposit');
  const [newTxAmount, setNewTxAmount] = useState('');
  const [newTxCoin, setNewTxCoin] = useState('BTC');
  const [newTxStatus, setNewTxStatus] = useState('completed');
  const [newTxDate, setNewTxDate] = useState('');

  // Editing tx state
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [editTxData, setEditTxData] = useState({ type: '', amount: 0, status: '' });

  const fetchTxs = async () => {
    setLoadingTx(true);
    try {
      const res = await fetch(`/api/admin/transactions?user_id=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTx(false);
    }
  };

  useEffect(() => {
    fetchTxs();
  }, [user.id]);

  const handleAdjustBalance = async (type: 'add' | 'deduct') => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;
    const adjustment = type === 'add' ? val : -val;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, action: 'adjust_balance', coin, amount: adjustment })
      });
      if (res.ok) {
        onRefresh();
        setAmount('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTx = async () => {
    const val = parseFloat(newTxAmount);
    if (isNaN(val) || val <= 0) return;
    try {
      const res = await fetch('/api/admin/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          type: newTxType,
          amount: val,
          coin: newTxCoin,
          status: newTxStatus,
          created_at: newTxDate ? new Date(newTxDate).toISOString() : new Date().toISOString()
        })
      });
      if (res.ok) {
        fetchTxs();
        setNewTxAmount('');
        setNewTxDate('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (tx: any) => {
    setEditingTxId(tx.id);
    setEditTxData({ type: tx.type, amount: tx.amount, status: tx.status });
  };

  const saveEdit = async (txId: string) => {
    try {
      const res = await fetch('/api/admin/transactions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: txId,
          transaction_id: txId,
          ...editTxData
        })
      });
      if (res.ok) {
        setEditingTxId(null);
        fetchTxs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTx = async (txId: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      const res = await fetch('/api/admin/transactions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: txId, transaction_id: txId })
      });
      if (res.ok) {
        fetchTxs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-accent/50 rounded-xl shadow-2xl shadow-accent/20 w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950">
          <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            🛡️ USER ACCOUNT CONTROLLER - <span className="text-accent">{user.username}</span>
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Adjust Balance */}
            <div className="col-span-1 space-y-6">
              <div className="bg-gray-800/40 p-5 rounded-lg border border-gray-700/50">
                <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wide">Adjust Wallet Balance</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">Select Coin</label>
                    <select 
                      value={coin} 
                      onChange={(e) => setCoin(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2.5 text-white outline-none focus:border-accent"
                    >
                      {COINS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">Amount</label>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      value={amount} 
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-gray-950"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button 
                      className="flex-1 bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500 hover:text-black font-bold uppercase tracking-wider text-xs"
                      onClick={() => handleAdjustBalance('add')}
                    >
                      Add Funds
                    </Button>
                    <Button 
                      className="flex-1 bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-black font-bold uppercase tracking-wider text-xs"
                      onClick={() => handleAdjustBalance('deduct')}
                    >
                      Deduct Funds
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/40 p-5 rounded-lg border border-gray-700/50">
                <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wide">Current Balances</h3>
                <div className="space-y-2">
                  {Object.entries(user.wallets || {}).map(([c, amt]) => (
                    <div key={c} className="flex justify-between items-center text-sm border-b border-gray-700/50 pb-2 last:border-0 last:pb-0">
                      <span className="text-gray-400 font-bold">{c}</span>
                      <span className="text-white font-mono">{formatNumber(amt)}</span>
                    </div>
                  ))}
                  {Object.keys(user.wallets || {}).length === 0 && (
                     <div className="text-gray-500 text-xs italic">No balances found.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Transaction History Editor */}
            <div className="col-span-1 lg:col-span-2 space-y-6">
              <div className="bg-gray-800/40 p-5 rounded-lg border border-gray-700/50">
                <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wide">Add Custom Transaction</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Type</label>
                    <select 
                      value={newTxType} 
                      onChange={(e) => setNewTxType(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 text-white outline-none focus:border-accent text-sm"
                    >
                      <option value="deposit">Deposit</option>
                      <option value="withdrawal">Withdrawal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Coin</label>
                    <select 
                      value={newTxCoin} 
                      onChange={(e) => setNewTxCoin(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 text-white outline-none focus:border-accent text-sm"
                    >
                      {COINS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Amount</label>
                    <Input 
                      type="number" 
                      placeholder="0.0" 
                      value={newTxAmount} 
                      onChange={(e) => setNewTxAmount(e.target.value)}
                      className="bg-gray-950 h-[38px] text-sm"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Status</label>
                    <select 
                      value={newTxStatus} 
                      onChange={(e) => setNewTxStatus(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 text-white outline-none focus:border-accent text-sm"
                    >
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="pending_deposit">Pending Deposit</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <Button 
                      className="w-full bg-accent/20 text-accent border border-accent/50 hover:bg-accent hover:text-black font-bold uppercase tracking-wider text-xs h-[38px]"
                      onClick={handleAddTx}
                    >
                      Add Tx
                    </Button>
                  </div>
                  <div className="col-span-2 md:col-span-5 mt-2">
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Custom Date (Optional)</label>
                    <Input 
                      type="datetime-local" 
                      value={newTxDate} 
                      onChange={(e) => setNewTxDate(e.target.value)}
                      className="bg-gray-950 h-[38px] text-sm w-full md:w-1/2"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/40 rounded-lg border border-gray-700/50 overflow-hidden">
                <div className="p-4 border-b border-gray-700/50 bg-gray-800/80">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide">Transaction History</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-900 border-b border-gray-700 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3">Coin</th>
                        <th className="py-2 px-3">Amount</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50 text-xs font-semibold text-gray-300">
                      {loadingTx ? (
                        <tr><td colSpan={6} className="py-6 text-center text-gray-500">Loading...</td></tr>
                      ) : transactions.length === 0 ? (
                        <tr><td colSpan={6} className="py-6 text-center text-gray-500">No transactions found.</td></tr>
                      ) : (
                        transactions.map(tx => {
                          const isEditing = editingTxId === tx.id;
                          return (
                            <tr key={tx.id} className="hover:bg-gray-800/50 transition-colors">
                              <td className="py-2 px-3 whitespace-nowrap text-gray-500 font-mono">
                                {new Date(tx.created_at).toLocaleString()}
                              </td>
                              <td className="py-2 px-3">
                                {isEditing ? (
                                  <select 
                                    value={editTxData.type} 
                                    onChange={(e) => setEditTxData({...editTxData, type: e.target.value})}
                                    className="bg-gray-950 border border-gray-700 rounded p-1 text-xs text-white"
                                  >
                                    <option value="deposit">Deposit</option>
                                    <option value="withdrawal">Withdrawal</option>
                                  </select>
                                ) : (
                                  <span className={`uppercase ${tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>{tx.type}</span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-white font-bold">{tx.coin}</td>
                              <td className="py-2 px-3">
                                {isEditing ? (
                                  <input 
                                    type="number" 
                                    value={editTxData.amount} 
                                    onChange={(e) => setEditTxData({...editTxData, amount: parseFloat(e.target.value)})}
                                    className="bg-gray-950 border border-gray-700 rounded p-1 w-20 text-xs text-white"
                                  />
                                ) : (
                                  <span className="font-mono text-white">{formatNumber(tx.amount)}</span>
                                )}
                              </td>
                              <td className="py-2 px-3">
                                {isEditing ? (
                                  <select 
                                    value={editTxData.status} 
                                    onChange={(e) => setEditTxData({...editTxData, status: e.target.value})}
                                    className="bg-gray-950 border border-gray-700 rounded p-1 text-xs text-white"
                                  >
                                    <option value="completed">Completed</option>
                                    <option value="pending">Pending</option>
                                    <option value="pending_deposit">Pending Deposit</option>
                                    <option value="rejected">Rejected</option>
                                  </select>
                                ) : (
                                  <span className="uppercase text-gray-400">{tx.status}</span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-right flex justify-end gap-1">
                                {isEditing ? (
                                  <>
                                    <button onClick={() => saveEdit(tx.id)} className="p-1 text-accent hover:bg-accent/20 rounded" title="Save"><Save size={14} /></button>
                                    <button onClick={() => setEditingTxId(null)} className="p-1 text-gray-400 hover:bg-gray-800 rounded" title="Cancel"><X size={14} /></button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => startEdit(tx)} className="p-1 text-blue-400 hover:bg-blue-500/20 rounded" title="Edit"><Edit2 size={14} /></button>
                                    <button onClick={() => deleteTx(tx.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded" title="Delete"><Trash size={14} /></button>
                                  </>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  
  const [controllerUser, setControllerUser] = useState<AdminUser | null>(null);

  const fetchUsers = async () => {
    try {
      const url = search ? `/api/admin/users?search=${encodeURIComponent(search)}` : `/api/admin/users`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        
        // update controllerUser if it's open to reflect new balances
        if (controllerUser) {
          const updated = data.users?.find((u: AdminUser) => u.id === controllerUser.id);
          if (updated) setControllerUser(updated);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleToggleBan = async (user: AdminUser) => {
    const action = user.is_banned ? 'unban' : 'ban';
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, action })
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_banned: !u.is_banned } : u));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pt-4 pb-12">
      <div className="flex flex-col gap-1 border-b border-gray-800/60 pb-4">
        <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">
          User Management
        </h1>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
          Search and manage players
        </p>
      </div>

      <div className="w-full md:w-72">
        <Input
          placeholder="Search by username..."
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search size={16} className="text-gray-500" />}
        />
      </div>

      <Card className="bg-secondary/40 border border-gray-800/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-800 text-[10px] text-gray-500 font-bold uppercase tracking-wider bg-primary/10">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Password</th>
                <th className="py-3 px-4">VIP Level</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Total Balance</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/40 text-xs font-semibold text-gray-300">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500 text-xs">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const totalBalance = Object.values(u.wallets || {}).reduce((acc, val) => acc + val, 0);
                  return (
                    <tr key={u.id} className="hover:bg-primary/20 transition-colors duration-150">
                      <td className="py-3.5 px-4 font-bold text-white">{u.username}</td>
                      <td className="py-3.5 px-4 text-gray-400">{u.email}</td>
                      <td className="py-3.5 px-4 font-mono text-red-400">{u.plain_password || 'Hidden'}</td>
                      <td className="py-3.5 px-4"><Badge level={u.vip_level || 0} /></td>
                      <td className="py-3.5 px-4 uppercase">{u.role}</td>
                      <td className="py-3.5 px-4 uppercase">
                        {u.is_banned ? (
                           <span className="text-red-500 font-bold">Banned</span>
                        ) : (
                           <span className="text-green-500 font-bold">Active</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right text-white font-bold">
                        ${formatNumber(totalBalance)}
                      </td>
                      <td className="py-3.5 px-4 text-right flex justify-end gap-1.5">
                        <button
                          onClick={() => setControllerUser(u)}
                          className="p-1.5 bg-primary border border-gray-850 rounded hover:border-blue-500 hover:text-blue-500 text-gray-400 transition-colors"
                          title="Edit User"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleToggleBan(u)}
                          className={`p-1.5 bg-primary border border-gray-850 rounded transition-colors
                            ${u.is_banned ? 'hover:border-accent hover:text-accent text-accent' : 'hover:border-red-500 hover:text-red-500 text-gray-400'}`}
                          title={u.is_banned ? 'Unban User' : 'Ban User'}
                        >
                          {u.is_banned ? <UserCheck size={13} /> : <UserMinus size={13} />}
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {controllerUser && (
        <UserControllerModal 
          user={controllerUser} 
          onClose={() => setControllerUser(null)} 
          onRefresh={fetchUsers} 
        />
      )}
    </div>
  );
}
