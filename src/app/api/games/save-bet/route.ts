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
  try {
    const token = request.cookies.get('auth_token')?.value ||
      request.cookies.get('bb-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return null;
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

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    const body = await request.json();
    const { gameType, betAmount, multiplier, payout, coin } = body;

    if (!gameType || betAmount === undefined || multiplier === undefined || payout === undefined || !coin) {
      return NextResponse.json({ error: 'Missing bet fields' }, { status: 400 });
    }

    const username = user ? user.username : 'Anonymous';
    const userId = user ? user.userId : 'anonymous-id';

    const betData = {
      id: 'bet_' + Math.random().toString(36).substring(2) + Date.now().toString(36),
      user_id: userId,
      username,
      game_type: gameType,
      bet_amount: parseFloat(betAmount),
      multiplier: parseFloat(multiplier),
      payout: parseFloat(payout),
      coin,
      created_at: new Date().toISOString()
    };

    // Save to MockDB
    MockDB.saveBet(betData);

    // Save to Supabase (try/catch if offline/invalid key)
    try {
      await supabase.from('bets').insert({
        id: betData.id,
        user_id: userId,
        username,
        game_type: gameType,
        bet_amount: parseFloat(betAmount),
        multiplier: parseFloat(multiplier),
        payout: parseFloat(payout),
        coin,
        created_at: betData.created_at
      });
    } catch (e) {
      // Fallback mode - key is invalid
    }

    return NextResponse.json({ success: true, bet: betData });
  } catch (error) {
    console.error('Save bet API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 550 });
  }
}
