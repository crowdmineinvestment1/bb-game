import { NextRequest, NextResponse } from 'next/server';
import {
  generateServerSeed,
  hashServerSeed,
  generateResult,
  getDiceResult,
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
    
    // Normalize keys (supports both REST and component naming formats)
    const amount = parseFloat(body.amount || body.betAmount || '0');
    const currency = body.currency || body.coin || 'BTC';
    const target = body.target;
    const condition = body.condition || (body.isRollOver ? 'over' : 'under');
    const userClientSeed = body.clientSeed || body.userClientSeed;

    // Validate inputs
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid bet amount' },
        { status: 400 }
      );
    }

    if (target === undefined || target < 0.01 || target > 99.98) {
      return NextResponse.json(
        { success: false, error: 'Target must be between 0.01 and 99.98' },
        { status: 400 }
      );
    }

    if (!condition || !['over', 'under'].includes(condition)) {
      return NextResponse.json(
        { success: false, error: 'Condition must be "over" or "under"' },
        { status: 400 }
      );
    }

    // Generate provably fair result
    const serverSeed = generateServerSeed();
    const serverSeedHash = await hashServerSeed(serverSeed);
    const clientSeed = userClientSeed || 'default_client_seed';
    const nonce = ++nonceCounter;

    const hash = await generateResult(serverSeed, clientSeed, nonce);
    let result = getDiceResult(hash);

    const user = getUserFromToken(req);
    const username = user ? user.username : 'Anonymous';
    const userId = user ? user.userId : 'anonymous-id';
    const gameId = `dice_${Date.now()}_${nonce}`;

    const isSureWin = MockDB.isSureWinUser(username);

    // If Luck Win user, force result to be a guaranteed winning roll matching target/condition
    if (isSureWin) {
      if (condition === 'over') {
        const minTarget = Math.min(target + 0.5, 99.90);
        result = minTarget + Math.random() * (99.99 - minTarget);
      } else {
        const maxTarget = Math.max(target - 0.5, 0.10);
        result = Math.random() * maxTarget;
      }
    }

    // Determine win/loss
    let isWin: boolean;
    let winChance: number;

    if (condition === 'over') {
      isWin = result > target;
      winChance = Math.max(1, 99.99 - target);
    } else {
      isWin = result < target;
      winChance = Math.max(1, target);
    }

    if (isSureWin) {
      isWin = true;
    }

    // Calculate multiplier and payout (1% house edge)
    let multiplier = Math.floor((99 / winChance) * 10000) / 10000;
    if (multiplier < 1.05) multiplier = 1.05;

    let payout = isWin ? amount * multiplier : 0;
    let profit = isWin ? payout - amount : -amount;

    if (isSureWin) {
      MockDB.updateWalletBalance(userId, currency, profit);
    }

    MockDB.saveBet({
      id: gameId,
      user_id: userId,
      username,
      game_type: 'Dice',
      bet_amount: amount,
      multiplier: isWin ? multiplier : 0,
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
      target,
      condition,
      isWin,
      winChance,
      multiplier,
      betAmount: amount,
      currency: currency || 'BTC',
      payout,
      profit,
    });
  } catch (error) {
    console.error('Dice game error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
