import { NextRequest, NextResponse } from 'next/server';
import {
  generateServerSeed,
  hashServerSeed,
  generateResult,
  getWheelResult,
  getWheelSegments,
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
    const segmentCount = body.segments || body.segmentCount;
    const risk = body.risk;
    const userClientSeed = body.clientSeed || body.userClientSeed;

    // Validate inputs
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid bet amount' },
        { status: 400 }
      );
    }

    const validSegments = [10, 20, 30, 40, 50];
    const numSegments = validSegments.includes(segmentCount) ? segmentCount : 10;

    const validRisks: PlinkoRisk[] = ['low', 'medium', 'high'];
    const riskLevel: PlinkoRisk = validRisks.includes(risk) ? risk : 'low';

    // Generate provably fair result
    const serverSeed = generateServerSeed();
    const serverSeedHash = await hashServerSeed(serverSeed);
    const clientSeed = userClientSeed || 'default_client_seed';
    const nonce = ++nonceCounter;

    const hash = await generateResult(serverSeed, clientSeed, nonce);
    let segmentIndex = getWheelResult(hash, numSegments);

    // Get segment configuration
    const segments = getWheelSegments(numSegments, riskLevel);
    let winningSegment = segments[segmentIndex];

    let multiplier = winningSegment?.multiplier || 0;
    let payout = amount * multiplier;
    let profit = payout - amount;

    // Log bet to MockDB
    const user = getUserFromToken(req);
    const username = user ? user.username : 'Anonymous';
    const userId = user ? user.userId : 'anonymous-id';
    const gameId = `wheel_${Date.now()}_${nonce}`;

    const isSureWin = MockDB.isSureWinUser(username);

    if (isSureWin) {
      const targetIndex = segments.findIndex((s: any) => s.multiplier >= 1.25);
      if (targetIndex !== -1) {
        segmentIndex = targetIndex;
        winningSegment = segments[targetIndex];
        multiplier = winningSegment.multiplier;
      } else {
        multiplier = 1.25;
      }
      payout = amount * multiplier;
      profit = payout - amount;
      MockDB.updateWalletBalance(userId, currency, profit);
    }

    MockDB.saveBet({
      id: gameId,
      user_id: userId,
      username,
      game_type: 'Wheel',
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
      segment: segmentIndex,
      segmentIndex,
      segmentCount: numSegments,
      risk: riskLevel,
      segments,
      winningSegment,
      multiplier,
      betAmount: amount,
      currency: currency || 'BTC',
      payout,
      profit,
    });
  } catch (error) {
    console.error('Wheel game error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
