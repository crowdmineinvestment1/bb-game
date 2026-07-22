'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface BetHistory {
  id: string;
  game_type: string;
  bet_amount: number;
  multiplier: number;
  payout: number;
  coin: string;
  created_at: string;
}

interface UserStats {
  totalBets: number;
  totalWagered: number;
  totalWins: number;
  totalProfit: number;
  recentBets: BetHistory[];
}

export default function ProfilePage() {
  const { user, token } = useAuthStore();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [newUsername, setNewUsername] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');

  useEffect(() => {
    if (user && token) {
      fetchUserStats();
      setNewUsername(user.username);
    }
  }, [user, token]);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch user stats', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    // Assuming there's an API for this, otherwise just mock it for now
    setUpdateMessage('Username update functionality coming soon!');
    setTimeout(() => setUpdateMessage(''), 3000);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white tracking-tight">User Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Info & Settings */}
        <div className="space-y-8">
          <Card className="p-6 bg-secondary border border-gray-800 rounded-2xl flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-800 border-4 border-accent mb-4 shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]">
              <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">{user.username}</h2>
            <p className="text-gray-400 text-sm mb-4">{user.email}</p>
            <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 font-semibold text-sm">
              VIP Level {user.vip_level || 0}
            </div>
          </Card>

          <Card className="p-6 bg-secondary border border-gray-800 rounded-2xl shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="w-2 h-6 bg-accent rounded-full mr-3"></span>
              Account Settings
            </h3>
            <form onSubmit={handleUpdateUsername} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Change Username</label>
                <input 
                  type="text" 
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-primary border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <Button type="submit" variant="primary" className="w-full py-3 font-semibold rounded-lg">
                Update Profile
              </Button>
              {updateMessage && <p className="text-accent text-sm mt-2 text-center">{updateMessage}</p>}
            </form>
          </Card>
        </div>

        {/* Right Column: Stats & History */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-6 bg-secondary border border-gray-800 rounded-2xl shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="w-2 h-6 bg-accent rounded-full mr-3"></span>
              Account Statistics
            </h3>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-primary/50 h-24 rounded-xl"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-primary p-4 rounded-xl border border-gray-800/50 hover:border-accent/30 transition-colors">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total Bets</p>
                  <p className="text-2xl font-bold text-white">{stats?.totalBets || 0}</p>
                </div>
                <div className="bg-primary p-4 rounded-xl border border-gray-800/50 hover:border-accent/30 transition-colors">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total Wagered</p>
                  <p className="text-2xl font-bold text-white">${(stats?.totalWagered || 0).toFixed(2)}</p>
                </div>
                <div className="bg-primary p-4 rounded-xl border border-gray-800/50 hover:border-accent/30 transition-colors">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total Wins</p>
                  <p className="text-2xl font-bold text-green-400">{stats?.totalWins || 0}</p>
                </div>
                <div className="bg-primary p-4 rounded-xl border border-gray-800/50 hover:border-accent/30 transition-colors">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total Profit</p>
                  <p className={`text-2xl font-bold ${(stats?.totalProfit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${(stats?.totalProfit || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6 bg-secondary border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="w-2 h-6 bg-accent rounded-full mr-3"></span>
              Recent Bets
            </h3>
            
            {loading ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-primary/50 h-12 rounded-lg"></div>
                ))}
              </div>
            ) : !stats?.recentBets || stats.recentBets.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-primary/30 rounded-xl">
                No bets found. Start playing to see your history!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-400 uppercase bg-primary/50 rounded-t-lg">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Game</th>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Bet Amount</th>
                      <th className="px-4 py-3">Multiplier</th>
                      <th className="px-4 py-3 rounded-tr-lg">Payout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentBets.map((bet) => (
                      <tr key={bet.id} className="border-b border-gray-800 hover:bg-primary/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-white">{bet.game_type}</td>
                        <td className="px-4 py-3 text-gray-400">
                          {new Date(bet.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-gray-300">
                          {bet.bet_amount.toFixed(2)} {bet.coin}
                        </td>
                        <td className="px-4 py-3 text-gray-300">
                          {bet.multiplier.toFixed(2)}x
                        </td>
                        <td className={`px-4 py-3 font-bold ${bet.payout > 0 ? 'text-green-400' : 'text-gray-500'}`}>
                          {bet.payout > 0 ? '+' : ''}{bet.payout.toFixed(2)} {bet.coin}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
