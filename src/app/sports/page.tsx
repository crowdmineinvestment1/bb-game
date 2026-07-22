'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import useWalletStore from '@/store/walletStore';
import useAuthStore from '@/store/authStore';
import { Check, Flame, Trophy, ShieldCheck, Clock } from 'lucide-react';
import { BetHistory } from '@/components/games/BetHistory';

interface Match {
  id: string;
  sport: string;
  league?: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo?: string;
  awayLogo?: string;
  time: string;
  isLive?: boolean;
  score?: string;
  odds: {
    home: number;
    draw: number;
    away: number;
  };
  status?: string;
}

export default function SportsbookPage() {
  const { selectedCoin, getBalance, updateBalance } = useWalletStore();
  const { user } = useAuthStore();
  const [selectedSport, setSelectedSport] = useState('All');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Bet slip state
  const [activeBet, setActiveBet] = useState<{
    match: Match;
    selection: 'home' | 'draw' | 'away';
    odd: number;
  } | null>(null);
  
  const [wager, setWager] = useState('10');
  const [betSuccess, setBetSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const balance = getBalance(selectedCoin);

  // Fetch real-time sports fixtures daily
  const fetchFixtures = async () => {
    try {
      const res = await fetch(`/api/sports/fixtures?sport=${selectedSport}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.matches)) {
        setMatches(data.matches);
      }
    } catch (err) {
      console.error('Error fetching real sports fixtures:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFixtures();
    // Poll real sports fixtures every 5 seconds for live scores & odds updates
    const interval = setInterval(fetchFixtures, 5000);
    return () => clearInterval(interval);
  }, [selectedSport]);

  const handleSelectOdd = (match: Match, selection: 'home' | 'draw' | 'away', odd: number) => {
    setActiveBet({ match, selection, odd });
    setBetSuccess(false);
  };

  const handlePlaceBet = async () => {
    if (!activeBet || !wager || submitting) return;
    const betAmount = parseFloat(wager);
    if (isNaN(betAmount) || betAmount <= 0 || betAmount > balance) return;

    setSubmitting(true);

    const matchName = `${activeBet.match.homeTeam} vs ${activeBet.match.awayTeam}`;
    const selectionName = activeBet.selection === 'home' ? activeBet.match.homeTeam :
      activeBet.selection === 'away' ? activeBet.match.awayTeam : 'Draw';

    // Deduct wager immediately from local balance
    updateBalance(selectedCoin, -betAmount);

    try {
      const res = await fetch('/api/sports/bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: activeBet.match.id,
          matchName,
          sport: activeBet.match.sport,
          selection: selectionName,
          odd: activeBet.odd,
          wager: betAmount,
          coin: selectedCoin,
          matchEndTime: (activeBet.match as any).matchEndTime
        })
      });

      const data = await res.json();
      if (data.success) {
        setBetSuccess(true);
        setRefreshKey(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error placing real-time sports bet:', err);
    } finally {
      setSubmitting(false);
    }
    
    // Auto-clear bet slip after a few seconds
    setTimeout(() => {
      setActiveBet(null);
      setBetSuccess(false);
    }, 4000);
  };

  const potentialWin = activeBet ? (parseFloat(wager) || 0) * activeBet.odd : 0;

  return (
    <div className="space-y-6 pt-4 pb-12 select-none">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
          Sportsbook
          <span className="flex items-center gap-1 bg-[#00e701]/10 border border-[#00e701]/30 text-[#00e701] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e701] animate-pulse" />
            REAL-TIME MATCH ENGINE
          </span>
        </h1>
        <p className="text-xs text-gray-400 font-medium">
          Official Real-World Sports Fixtures • Live Scores & Real Match Settlement
        </p>
      </div>

      {/* Sport Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {['All', 'Football', 'Basketball', 'Tennis', 'Esports'].map((sport) => (
          <button
            key={sport}
            onClick={() => setSelectedSport(sport)}
            className={`px-4 py-2 text-xs font-black rounded-xl border uppercase tracking-wider whitespace-nowrap transition-all
              ${selectedSport === sport 
                ? 'border-accent bg-accent/10 text-accent shadow-md' 
                : 'border-gray-800 bg-[#1a2c38]/40 text-gray-400 hover:text-white hover:border-gray-700'}`}
          >
            {sport}
          </button>
        ))}
      </div>

      {/* Split layout: Match Listings (Left/Center) vs Bet Slip (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Match Listings */}
        <div className="lg:col-span-3 space-y-3.5">
          {loading ? (
            <div className="py-16 text-center text-xs text-gray-500 font-bold">
              Fetching real-time sports matches...
            </div>
          ) : matches.length === 0 ? (
            <div className="py-16 text-center text-xs text-gray-500 font-bold">
              No live matches found for {selectedSport}.
            </div>
          ) : (
            matches.map((match) => (
              <Card key={match.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1a2c38]/60 border border-gray-800/80 hover:border-gray-700 transition-colors">
                {/* Match info */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-block text-[9px] font-black uppercase text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full">
                      {match.sport}
                    </span>
                    {match.league && (
                      <span className="text-[10px] text-gray-400 font-bold">
                        • {match.league}
                      </span>
                    )}
                    {match.isLive && (
                      <span className="flex items-center gap-1 bg-red-600/90 text-white text-[9px] font-black px-2 py-0.5 rounded animate-pulse">
                        LIVE
                      </span>
                    )}
                  </div>

                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    {match.homeLogo ? (
                      <img src={match.homeLogo} alt="" className="w-5 h-5 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <span className="w-5 h-5 flex items-center justify-center text-xs bg-gray-800 rounded-full text-gray-400">{match.homeTeam.charAt(0)}</span>
                    )}
                    <span>{match.homeTeam}</span>
                    {match.score ? (
                      <span className="bg-primary px-2 py-0.5 rounded text-accent font-black text-xs font-mono">
                        {match.score}
                      </span>
                    ) : (
                      <span className="text-gray-500 text-xs">vs</span>
                    )}
                    {match.awayLogo ? (
                      <img src={match.awayLogo} alt="" className="w-5 h-5 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <span className="w-5 h-5 flex items-center justify-center text-xs bg-gray-800 rounded-full text-gray-400">{match.awayTeam.charAt(0)}</span>
                    )}
                    <span>{match.awayTeam}</span>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-gray-400 font-semibold">
                    <Clock size={11} className="text-gray-500" />
                    <span>{match.time}</span>
                  </div>
                </div>

                {/* Odds buttons */}
                <div className="flex gap-2 w-full md:w-auto">
                  <button
                    onClick={() => handleSelectOdd(match, 'home', match.odds.home)}
                    className={`flex-1 md:w-24 bg-primary border p-2.5 rounded-xl text-center transition-all duration-200 ${
                      activeBet?.match.id === match.id && activeBet.selection === 'home'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-gray-800 hover:border-accent hover:bg-accent/5'
                    }`}
                  >
                    <span className="text-[9px] text-gray-500 font-bold block uppercase mb-0.5">1 ({match.homeTeam.substring(0, 3)})</span>
                    <span className="text-xs font-black text-white">{match.odds.home.toFixed(2)}</span>
                  </button>
                  
                  {match.odds.draw > 0 && (
                    <button
                      onClick={() => handleSelectOdd(match, 'draw', match.odds.draw)}
                      className={`flex-1 md:w-20 bg-primary border p-2.5 rounded-xl text-center transition-all duration-200 ${
                        activeBet?.match.id === match.id && activeBet.selection === 'draw'
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-gray-800 hover:border-accent hover:bg-accent/5'
                      }`}
                    >
                      <span className="text-[9px] text-gray-500 font-bold block uppercase mb-0.5">X (Draw)</span>
                      <span className="text-xs font-black text-white">{match.odds.draw.toFixed(2)}</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleSelectOdd(match, 'away', match.odds.away)}
                    className={`flex-1 md:w-24 bg-primary border p-2.5 rounded-xl text-center transition-all duration-200 ${
                      activeBet?.match.id === match.id && activeBet.selection === 'away'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-gray-800 hover:border-accent hover:bg-accent/5'
                    }`}
                  >
                    <span className="text-[9px] text-gray-500 font-bold block uppercase mb-0.5">2 ({match.awayTeam.substring(0, 3)})</span>
                    <span className="text-xs font-black text-white">{match.odds.away.toFixed(2)}</span>
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Bet Slip side panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4 bg-[#1a2c38]/80 border border-gray-800/80 shadow-xl flex flex-col justify-between min-h-[340px]">
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-gray-800 pb-3 mb-4 flex items-center justify-between">
                <span>Sports Bet Slip</span>
                <span className="text-[9px] text-[#00e701]">Real Odds</span>
              </h3>

              {betSuccess ? (
                <div className="flex flex-col items-center justify-center text-center py-8 space-y-2.5 animate-fadeIn">
                  <div className="bg-[#00e701]/10 border border-[#00e701]/30 text-[#00e701] p-3 rounded-full">
                    <Check size={24} />
                  </div>
                  <span className="text-xs font-black text-[#00e701] uppercase tracking-wider">Bet Placed & In Play!</span>
                  <span className="text-[10px] text-gray-400 font-semibold px-2">
                    Wager debited. Match result will settle upon full-time completion.
                  </span>
                </div>
              ) : activeBet ? (
                <div className="space-y-4">
                  {/* Selection summary */}
                  <div className="bg-primary/40 border border-gray-800 p-3 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-accent">
                      <span className="uppercase">
                        {activeBet.selection === 'home' ? activeBet.match.homeTeam : 
                         activeBet.selection === 'away' ? activeBet.match.awayTeam : 'Draw'}
                      </span>
                      <span>{activeBet.odd.toFixed(2)}x</span>
                    </div>
                    <div className="text-[10px] text-gray-300 font-semibold truncate">
                      {activeBet.match.homeTeam} vs {activeBet.match.awayTeam}
                    </div>
                    <div className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">
                      Match Winner (1X2) • {activeBet.match.sport}
                    </div>
                  </div>

                  {/* Wager Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Wager Amount
                    </label>
                    <div className="relative flex items-center bg-primary border border-gray-800 focus-within:border-accent/40 rounded-xl overflow-hidden pr-3">
                      <input
                        type="number"
                        value={wager}
                        onChange={(e) => setWager(e.target.value)}
                        className="w-full bg-transparent text-white font-bold py-2.5 px-3 focus:outline-none text-xs"
                      />
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        {selectedCoin}
                      </span>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-primary/20 border border-gray-800 p-3 rounded-xl text-xs font-semibold space-y-1.5">
                    <div className="flex justify-between text-gray-400">
                      <span>Total Odd</span>
                      <span className="text-white font-mono">{activeBet.odd.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Est. Payout</span>
                      <span className="text-accent font-bold font-mono">
                        {potentialWin.toFixed(4)} {selectedCoin}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-gray-500 font-bold">
                  Click on any match odds to add selection to your bet slip.
                </div>
              )}
            </div>

            {activeBet && !betSuccess && (
              <Button
                onClick={handlePlaceBet}
                variant="primary"
                className="w-full font-black py-3 text-xs uppercase tracking-widest mt-6 bg-[#00e701] hover:bg-[#00c701] text-black"
                disabled={!wager || parseFloat(wager) <= 0 || parseFloat(wager) > balance || submitting}
              >
                {submitting ? 'PLACING BET...' : 'CONFIRM & PLACE BET'}
              </Button>
            )}
          </Card>
        </div>
      </div>

      {/* Live Sports Bet Activity Feed & History Table */}
      <div className="mt-8">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
          Sports Bet History & Real Match Outcomes
        </h3>
        <BetHistory refreshKey={refreshKey} />
      </div>
    </div>
  );
}
