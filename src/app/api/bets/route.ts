export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { MockDB } from '@/lib/mock-db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-bb-game-2024';

function getUserFromToken(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      token = req.cookies.get('auth_token')?.value || req.cookies.get('bb-token')?.value || '';
    }
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    let userId = searchParams.get('userId');
    const gameType = searchParams.get('gameType');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const currentUser = getUserFromToken(request);

    if (type === 'my') {
      if (currentUser) {
        userId = currentUser.userId || currentUser.id || currentUser.username;
      }
    }

    let allBets = MockDB.getBets();

    // Check and settle any pending sports bets whose real-life match conclusion time has elapsed
    const nowMs = Date.now();
    allBets.forEach((b: any) => {
      if (b.status === 'PENDING' && b.match_end_time) {
        const endMs = new Date(b.match_end_time).getTime();
        if (nowMs >= endMs) {
          // Real-life match has reached full-time!
          // 100% Luck Win platform policy applies on match conclusion
          const amount = parseFloat(b.bet_amount || b.amount || 0);
          const multiplier = parseFloat(b.multiplier || 1.25);
          const payout = amount * multiplier;

          b.status = 'WON';
          b.payout = payout;

          // Credit winning payout to user wallet on match conclusion
          if (b.user_id) {
            MockDB.updateWalletBalance(b.user_id, b.coin || 'BTC', payout);
          }
          MockDB.updateBet(b.id, { status: 'WON', payout });
        }
      }
    });

    // Filter by user if specified
    if (userId) {
      const lowerUserId = userId.toLowerCase();
      allBets = allBets.filter(b => 
        (b.user_id && b.user_id.toLowerCase() === lowerUserId) ||
        (b.username && b.username.toLowerCase() === lowerUserId)
      );
    }

    // Filter by gameType if specified
    if (gameType && gameType !== 'all') {
      const lowerGameType = gameType.toLowerCase();
      allBets = allBets.filter(b => 
        b.game_type && b.game_type.toLowerCase().includes(lowerGameType)
      );
    }

    // Sort by created_at descending (newest first)
    allBets.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

    // Slice to limit
    const slicedBets = allBets.slice(0, limit);

    // Format bets to match frontend schema
    const formattedBets = slicedBets.map(b => ({
      id: b.id,
      user_id: b.user_id || 'user',
      game_type: b.game_type || 'Game',
      amount: parseFloat(b.bet_amount || b.amount || 0),
      multiplier: parseFloat(b.multiplier || 0),
      payout: parseFloat(b.payout || 0),
      coin: b.coin || 'BTC',
      status: b.status || ((b.payout || 0) > 0 ? 'WON' : 'LOST'),
      match_end_time: b.match_end_time || null,
      created_at: b.created_at || new Date().toISOString(),
      users: {
        username: b.username || 'Player'
      }
    }));

    return NextResponse.json({
      success: true,
      bets: formattedBets
    });
  } catch (error) {
    console.error('Fetch bets API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
