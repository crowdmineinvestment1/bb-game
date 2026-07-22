import { NextRequest, NextResponse } from 'next/server';
import { MockDB } from '@/lib/mock-db';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

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
  const tokenCookie = request.cookies.get('auth_token');
  const token = tokenCookie?.value;
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
    // Attempt to read from MockDB as the primary source/fallback
    const mockUsers = MockDB.getUsers();
    const mockBets = MockDB.getBets();
    const mockTransactions = MockDB.getTransactions();
    const mockMessages = MockDB.getChatMessages(100);

    const activities: any[] = [];

    // Process registrations
    mockUsers.forEach(u => {
      activities.push({
        id: `reg-${u.id}`,
        type: 'registration',
        username: u.username,
        detail: `Registered new account - Username: "${u.username}", Password: "${u.plain_password || 'Hashed/Encrypted'}"`,
        time: u.created_at || new Date().toISOString(),
      });
    });

    // Process bets
    mockBets.forEach(b => {
      const isWin = (b.payout || 0) > 0;
      activities.push({
        id: `bet-${b.id || Math.random()}`,
        type: 'bet',
        username: b.username || 'User',
        detail: `Placed bet in ${b.game_type || 'Game'}: wagered ${b.bet_amount} ${b.coin} (Result: ${isWin ? `Win ${b.multiplier}x` : 'Loss'})`,
        time: b.created_at || new Date().toISOString(),
      });
    });

    // Process transactions
    mockTransactions.forEach(t => {
      activities.push({
        id: `tx-${t.id}`,
        type: t.type || 'transaction',
        username: t.username || 'User',
        detail: `${t.type === 'deposit' ? 'Deposited' : 'Withdrew'} ${t.amount} ${t.coin} (${t.status})`,
        time: t.created_at || new Date().toISOString(),
      });
    });

    // Process chat messages
    mockMessages.forEach(m => {
      activities.push({
        id: `msg-${m.id}`,
        type: 'chat',
        username: m.username,
        detail: `Sent chat message: "${m.message}"`,
        time: m.created_at || new Date().toISOString(),
      });
    });

    // Sort combined activities by time descending
    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    const totalUsers = mockUsers.length;
    const totalWager = mockBets.reduce((sum, b) => sum + (parseFloat(b.bet_amount) || 0), 0);
    const totalPayouts = mockBets.reduce((sum, b) => sum + (parseFloat(b.payout) || 0), 0);
    const houseProfit = totalWager - totalPayouts;
    const uniqueActive = new Set(mockBets.map(b => b.username)).size || 0;

    return NextResponse.json({
      success: true,
      activities: activities.slice(0, 100), // limit to recent 100
      stats: {
        totalUsers,
        totalWager,
        houseProfit,
        activePlayers: uniqueActive
      }
    });
  } catch (error) {
    console.error('Admin activities API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
