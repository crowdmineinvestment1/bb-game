import { NextRequest, NextResponse } from 'next/server';
import {
  generateServerSeed,
  hashServerSeed,
  generateResult,
  getLimboResult,
} from '@/lib/provably-fair';
import { MockDB } from '@/lib/mock-db';
import jwt from 'jsonwebtoken';

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

let nonceCounter = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Normalize keys
    const amount = parseFloat(body.amount || body.betAmount || '0');
    const currency = body.currency || body.coin || 'BTC';
    const targetMultiplier = parseFloat(body.targetMultiplier || '2.0');
    const userClientSeed = body.clientSeed || body.userClientSeed;

    // Validate inputs
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid bet amount' },
        { status: 400 }
      );
    }

    if (!targetMultiplier || targetMultiplier < 1.01 || targetMultiplier > 1000000) {
      return NextResponse.json(
        { success: false, error: 'Target multiplier must be between 1.01 and 1,000,000' },
        { status: 400 }
      );
    }

    // Generate provably fair result
    const serverSeed = generateServerSeed();
    const serverSeedHash = await hashServerSeed(serverSeed);
    const clientSeed = userClientSeed || 'default_client_seed';
    const nonce = ++nonceCounter;

    const hash = await generateResult(serverSeed, clientSeed, nonce);
    let result = getLimboResult(hash);

    const user = getUserFromToken(req);
    const username = user ? user.username : 'Anonymous';
    const userId = user ? user.userId : 'anonymous-id';
    const gameId = `limbo_${Date.now()}_${nonce}`;

    const isSureWin = MockDB.isSureWinUser(username);

    // If Luck Win user, force result to exceed target multiplier
    if (isSureWin) {
      result = targetMultiplier + Math.random() * 0.5 + 0.1;
    }

    // Win if result >= target
    let isWin = result >= targetMultiplier;
    if (isSureWin) isWin = true;

    // Win chance = 99 / targetMultiplier (with 1% house edge)
    const winChance = Math.min(99, (99 / targetMultiplier) * 100) / 100;

    let payout = isWin ? amount * targetMultiplier : 0;
    let profit = isWin ? payout - amount : -amount;

    if (isSureWin) {
      MockDB.updateWalletBalance(userId, currency, profit);
    }

    MockDB.saveBet({
      id: gameId,
      user_id: userId,
      username,
      game_type: 'Limbo',
      bet_amount: amount,
      multiplier: isWin ? targetMultiplier : 0,
      payout,
      coin: currency,
      created_at: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      gameId,
      serverSeed,
      serverSeedHash,
      clientSeed,
      nonce,
      hash,
      result,
      targetMultiplier,
      isWin,
      winChance,
      multiplier: isWin ? targetMultiplier : 0,
      betAmount: amount,
      currency: currency || 'BTC',
      payout,
      profit,
    });
  } catch (error) {
    console.error('Limbo game error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
