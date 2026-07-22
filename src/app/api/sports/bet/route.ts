export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { MockDB } from '@/lib/mock-db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-bb-game-2024';

function getUserFromReq(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value ||
      req.cookies.get('bb-token')?.value ||
      req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromReq(req);
    const body = await req.json();
    const { matchId, matchName, sport, selection, odd, wager, coin, matchEndTime } = body;

    const amount = parseFloat(wager || '0');
    const multiplier = parseFloat(odd || '1.0');

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid wager amount' }, { status: 400 });
    }

    const username = user ? (user.username || user.email) : 'Anonymous';
    const userId = user ? (user.userId || user.id) : 'anonymous-id';

    // Get user wallet balance
    const wallets = MockDB.getWallets(userId);
    const selectedWallet = wallets.find(w => w.coin === (coin || 'BTC'));
    const balance = selectedWallet ? parseFloat(selectedWallet.balance) : 1000;

    if (amount > balance) {
      return NextResponse.json({ success: false, error: 'Insufficient balance' }, { status: 400 });
    }

    // Deduct wager from balance immediately upon placing bet
    MockDB.updateWalletBalance(userId, coin || 'BTC', -amount);

    const betId = `sports_bet_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Set match finish timestamp based on real-world match conclusion time
    const endTimestamp = matchEndTime || new Date(Date.now() + 120 * 1000).toISOString();

    // Save sports bet as PENDING initially (Real-time in play match)
    const betData = {
      id: betId,
      user_id: userId,
      username,
      game_type: `Sports: ${matchName || sport || 'Match'} (${selection.toUpperCase()})`,
      bet_amount: amount,
      multiplier,
      payout: 0,
      coin: coin || 'BTC',
      status: 'PENDING',
      match_id: matchId,
      match_name: matchName,
      selection,
      match_end_time: endTimestamp,
      created_at: new Date().toISOString()
    };

    MockDB.saveBet(betData);

    return NextResponse.json({
      success: true,
      bet: betData,
      message: `Sports bet placed! Match is IN PLAY and will conclude at ${new Date(endTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}.`
    });
  } catch (error) {
    console.error('Sports bet POST error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
