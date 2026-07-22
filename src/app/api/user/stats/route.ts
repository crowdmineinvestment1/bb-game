import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { MockDB } from '@/lib/mock-db';

const rawKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseKey = (rawKey && rawKey !== 'your_service_key_here' && rawKey.trim() !== '') 
  ? rawKey 
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey
);

const JWT_SECRET = process.env.JWT_SECRET || 'bb-game-secret-key-change-in-production';

function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('bb-token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      username: string;
      role: string;
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all bets for the user
    let allBets: any[] = [];
    let isMock = false;

    try {
      const { data: bets, error: betsError } = await supabase
        .from('bets')
        .select('*')
        .eq('user_id', user.userId)
        .order('created_at', { ascending: false });

      if (betsError) {
        isMock = true;
      } else {
        allBets = bets || [];
      }
    } catch (e) {
      isMock = true;
    }

    if (isMock) {
      allBets = MockDB.getBets(user.userId) || [];
    }

    // Calculate stats
    const totalBets = allBets.length;
    const totalWagered = allBets.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
    const totalPayout = allBets.reduce((sum, b) => sum + (parseFloat(b.payout) || 0), 0);
    const totalProfit = totalPayout - totalWagered;
    const wins = allBets.filter(b => (parseFloat(b.payout) || 0) > (parseFloat(b.amount) || 0)).length;
    const losses = allBets.filter(b => (parseFloat(b.payout) || 0) < (parseFloat(b.amount) || 0)).length;
    const winRate = totalBets > 0 ? (wins / totalBets) * 100 : 0;

    // Favorite game
    const gameCounts: Record<string, number> = {};
    allBets.forEach(b => {
      gameCounts[b.game] = (gameCounts[b.game] || 0) + 1;
    });
    const favoriteGame = Object.entries(gameCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'None';

    // Best win
    const bestWin = allBets.reduce((best, b) => {
      const profit = (parseFloat(b.payout) || 0) - (parseFloat(b.amount) || 0);
      return profit > best ? profit : best;
    }, 0);

    // Biggest multiplier
    const bestMultiplier = allBets.reduce((best, b) => {
      const amount = parseFloat(b.amount) || 0;
      const payout = parseFloat(b.payout) || 0;
      const mult = amount > 0 ? payout / amount : 0;
      return mult > best ? mult : best;
    }, 0);

    // Wagering history (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyStats: Record<string, { date: string; wagered: number; profit: number }> = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      dailyStats[key] = { date: key, wagered: 0, profit: 0 };
    }

    allBets.forEach((b) => {
      const date = new Date(b.created_at).toISOString().split('T')[0];
      if (dailyStats[date]) {
        dailyStats[date].wagered += parseFloat(b.amount) || 0;
        dailyStats[date].profit += (parseFloat(b.payout) || 0) - (parseFloat(b.amount) || 0);
      }
    });

    const wagerHistory = Object.values(dailyStats)
      .sort((a, b) => a.date.localeCompare(b.date));

    // Game breakdown
    const gameBreakdown = Object.entries(gameCounts).map(([game, count]) => ({
      game,
      count,
      percentage: totalBets > 0 ? (count / totalBets) * 100 : 0,
    })).sort((a, b) => b.count - a.count);

    return NextResponse.json({
      stats: {
        total_bets: totalBets,
        total_wagered: totalWagered,
        total_payout: totalPayout,
        total_profit: totalProfit,
        wins,
        losses,
        win_rate: winRate,
        favorite_game: favoriteGame,
        best_win: bestWin,
        best_multiplier: bestMultiplier,
      },
      wager_history: wagerHistory,
      game_breakdown: gameBreakdown,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
