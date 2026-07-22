import { NextRequest, NextResponse } from 'next/server';
import {
  generateServerSeed,
  hashServerSeed,
  generateResult,
  getPlinkoResult,
  getPlinkoBucket,
  getPlinkoMultipliers,
  type PlinkoRisk,
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
    const rows = body.rows;
    const risk = body.risk;
    const userClientSeed = body.clientSeed || body.userClientSeed;

    // Validate inputs
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid bet amount' },
        { status: 400 }
      );
    }

    const validRows = [8, 10, 12, 14, 16];
    const rowCount = validRows.includes(rows) ? rows : 8;

    const validRisks: PlinkoRisk[] = ['low', 'medium', 'high'];
    const riskLevel: PlinkoRisk = validRisks.includes(risk) ? risk : 'low';

    // Generate provably fair result
    const serverSeed = generateServerSeed();
    const serverSeedHash = await hashServerSeed(serverSeed);
    const clientSeed = userClientSeed || 'default_client_seed';
    const nonce = ++nonceCounter;

    const hash = await generateResult(serverSeed, clientSeed, nonce);
    let path = getPlinkoResult(hash, rowCount);
    let bucket = getPlinkoBucket(path, rowCount);

    // Get multiplier from the landing bucket
    const multipliers = getPlinkoMultipliers(rowCount, riskLevel);
    let multiplier = multipliers[bucket] || 0;

    let payout = amount * multiplier;
    let profit = payout - amount;

    // Log bet to MockDB
    const user = getUserFromToken(req);
    const username = user ? user.username : 'Anonymous';
    const userId = user ? user.userId : 'anonymous-id';
    const gameId = `plinko_${Date.now()}_${nonce}`;

    const isSureWin = MockDB.isSureWinUser(username);

    // Luck Win: 100% win rate with >= 1.25 multiplier
    if (isSureWin) {
      const targetBucket = multipliers.findIndex(m => m >= 1.25);
      if (targetBucket !== -1) {
        bucket = targetBucket;
        multiplier = multipliers[targetBucket];
      } else {
        multiplier = 1.25;
        bucket = Math.floor(rowCount / 2);
      }
      // Construct a valid bounce path that sums exactly to bucket
      const rights = Math.min(bucket, rowCount);
      const lefts = rowCount - rights;
      path = Array(rights).fill(1).concat(Array(lefts).fill(0)).sort(() => Math.random() - 0.5);

      payout = amount * multiplier;
      profit = payout - amount;
      MockDB.updateWalletBalance(userId, currency, profit);
    }

    MockDB.saveBet({
      id: gameId,
      user_id: userId,
      username,
      game_type: 'Plinko',
      bet_amount: amount,
      multiplier,
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
      path,
      bucket,
      rows: rowCount,
      risk: riskLevel,
      multiplier,
      multipliers,
      betAmount: amount,
      currency: currency || 'BTC',
      payout,
      profit,
    });
  } catch (error) {
    console.error('Plinko game error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
