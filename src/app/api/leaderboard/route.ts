import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const rawKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseKey = (rawKey && rawKey !== 'your_service_key_here' && rawKey.trim() !== '') 
  ? rawKey 
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'daily';
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    // Calculate date range based on period
    const now = new Date();
    let startDate: string;

    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        break;
      case 'weekly':
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
        startDate = weekStart.toISOString();
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        break;
      case 'all':
      default:
        startDate = new Date(0).toISOString();
        break;
    }

    // Aggregate bets by user for the period
    let query = supabase
      .from('bets')
      .select(`
        user_id,
        amount,
        payout,
        created_at
      `)
      .gte('created_at', startDate);

    const { data: bets, error: betsError } = await query;

    if (betsError) {
      console.error('Leaderboard bets error:', betsError);
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }

    // Aggregate by user
    const userStats: Record<string, {
      user_id: string;
      total_wagered: number;
      total_payout: number;
      total_bets: number;
      profit: number;
    }> = {};

    (bets || []).forEach((bet) => {
      if (!userStats[bet.user_id]) {
        userStats[bet.user_id] = {
          user_id: bet.user_id,
          total_wagered: 0,
          total_payout: 0,
          total_bets: 0,
          profit: 0,
        };
      }
      const amount = parseFloat(bet.amount) || 0;
      const payout = parseFloat(bet.payout) || 0;
      userStats[bet.user_id].total_wagered += amount;
      userStats[bet.user_id].total_payout += payout;
      userStats[bet.user_id].total_bets += 1;
      userStats[bet.user_id].profit += payout - amount;
    });

    // Sort by total wagered and apply pagination
    const sorted = Object.values(userStats)
      .sort((a, b) => b.total_wagered - a.total_wagered);

    const totalEntries = sorted.length;
    const paginatedEntries = sorted.slice(offset, offset + limit);

    // Get user details for the leaderboard entries
    const userIds = paginatedEntries.map((e) => e.user_id);
    const { data: users } = await supabase
      .from('users')
      .select('id, username, avatar_url, vip_level')
      .in('id', userIds.length > 0 ? userIds : ['none']);

    const userMap: Record<string, { username: string; avatar_url: string; vip_level: number }> = {};
    (users || []).forEach((u) => {
      userMap[u.id] = { username: u.username, avatar_url: u.avatar_url, vip_level: u.vip_level };
    });

    // Prize pool based on period
    const prizePools: Record<string, number[]> = {
      daily: [0.01, 0.005, 0.003, 0.002, 0.001],
      weekly: [0.1, 0.05, 0.03, 0.02, 0.01],
      monthly: [1.0, 0.5, 0.3, 0.2, 0.1],
      all: [5.0, 2.5, 1.0, 0.5, 0.25],
    };

    const prizes = prizePools[period] || prizePools.daily;

    const leaderboard = paginatedEntries.map((entry, index) => ({
      rank: offset + index + 1,
      user_id: entry.user_id,
      username: userMap[entry.user_id]?.username || 'Anonymous',
      avatar_url: userMap[entry.user_id]?.avatar_url || '',
      vip_level: userMap[entry.user_id]?.vip_level || 0,
      total_wagered: entry.total_wagered,
      total_bets: entry.total_bets,
      profit: entry.profit,
      prize: prizes[offset + index] || 0,
    }));

    return NextResponse.json({
      period,
      leaderboard,
      total_entries: totalEntries,
      page,
      limit,
      total_pages: Math.ceil(totalEntries / limit),
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
