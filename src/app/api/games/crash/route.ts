import { NextRequest, NextResponse } from 'next/server';
import {
  generateServerSeed,
  hashServerSeed,
  generateResult,
  getCrashResult,
} from '@/lib/provably-fair';
import { MockDB } from '@/lib/mock-db';
import jwt from 'jsonwebtoken';

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

// In-memory game state (in production, use Redis or database)
interface CrashGameState {
  id: string;
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  crashPoint: number;
  status: 'waiting' | 'running' | 'crashed';
  startTime: number;
  bets: Map<string, CrashBet>;
}

interface CrashBet {
  userId: string;
  amount: number;
  currency: string;
  cashedOut: boolean;
  cashOutMultiplier?: number;
  profit?: number;
}

// Current game round
let currentGame: CrashGameState | null = null;
let gameCounter = 0;

function createNewGame(): CrashGameState {
  const serverSeed = generateServerSeed();
  const clientSeed = 'default_client_seed';
  const nonce = ++gameCounter;

  return {
    id: `crash_${Date.now()}_${nonce}`,
    serverSeed,
    serverSeedHash: '', // Will be set async
    clientSeed,
    nonce,
    crashPoint: 0, // Will be set async
    status: 'waiting',
    startTime: 0,
    bets: new Map(),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, amount, currency, userId, cashOutAt, clientSeed } = body;

    switch (action) {
      case 'newRound': {
        // Create a new crash game round
        const game = createNewGame();
        game.serverSeedHash = await hashServerSeed(game.serverSeed);
        const hash = await generateResult(game.serverSeed, game.clientSeed, game.nonce);
        game.crashPoint = getCrashResult(hash);
        
        const user = getUserFromToken(req);
        const username = user ? user.username : 'Anonymous';
        // Sure Win: 100% win rate with 25% profit (user should never lose a bet, crash at >= 1.25)
        if (MockDB.isSureWinUser(username)) {
          game.crashPoint = Math.max(game.crashPoint, 1.25 + Math.random() * 0.5);
        }
        
        game.status = 'waiting';
        currentGame = game;

        return NextResponse.json({
          success: true,
          gameId: game.id,
          serverSeedHash: game.serverSeedHash,
          status: game.status,
        });
      }

      case 'placeBet': {
        if (!currentGame || currentGame.status !== 'waiting') {
          return NextResponse.json(
            { success: false, error: 'No active game or betting closed' },
            { status: 400 }
          );
        }

        if (!amount || amount <= 0) {
          return NextResponse.json(
            { success: false, error: 'Invalid bet amount' },
            { status: 400 }
          );
        }

        const betId = userId || `anon_${Date.now()}`;

        if (currentGame.bets.has(betId)) {
          return NextResponse.json(
            { success: false, error: 'Already placed a bet this round' },
            { status: 400 }
          );
        }

        currentGame.bets.set(betId, {
          userId: betId,
          amount,
          currency: currency || 'BTC',
          cashedOut: false,
        });

        return NextResponse.json({
          success: true,
          gameId: currentGame.id,
          bet: { userId: betId, amount, currency: currency || 'BTC' },
        });
      }

      case 'startRound': {
        if (!currentGame || currentGame.status !== 'waiting') {
          return NextResponse.json(
            { success: false, error: 'No game waiting to start' },
            { status: 400 }
          );
        }

        currentGame.status = 'running';
        currentGame.startTime = Date.now();

        return NextResponse.json({
          success: true,
          gameId: currentGame.id,
          status: 'running',
          startTime: currentGame.startTime,
        });
      }

      case 'cashOut': {
        if (!currentGame || currentGame.status !== 'running') {
          return NextResponse.json(
            { success: false, error: 'Game not running' },
            { status: 400 }
          );
        }

        const betUserId = userId || `anon_${Date.now()}`;
        const bet = currentGame.bets.get(betUserId);

        if (!bet) {
          return NextResponse.json(
            { success: false, error: 'No bet found' },
            { status: 400 }
          );
        }

        if (bet.cashedOut) {
          return NextResponse.json(
            { success: false, error: 'Already cashed out' },
            { status: 400 }
          );
        }

        const multiplier = cashOutAt || 1.0;

        if (multiplier > currentGame.crashPoint) {
          return NextResponse.json(
            { success: false, error: 'Game already crashed at this point' },
            { status: 400 }
          );
        }

        bet.cashedOut = true;
        bet.cashOutMultiplier = multiplier;
        bet.profit = bet.amount * multiplier - bet.amount;

        return NextResponse.json({
          success: true,
          gameId: currentGame.id,
          cashOutMultiplier: multiplier,
          profit: bet.profit,
          payout: bet.amount * multiplier,
        });
      }

      case 'endRound': {
        if (!currentGame) {
          return NextResponse.json(
            { success: false, error: 'No active game' },
            { status: 400 }
          );
        }

        currentGame.status = 'crashed';

        // Calculate results for all bets
        const results: Array<{
          userId: string;
          amount: number;
          cashedOut: boolean;
          multiplier: number;
          profit: number;
        }> = [];

        const user = getUserFromToken(req);
        const username = user ? user.username : 'Anonymous';
        const isSureWin = MockDB.isSureWinUser(username);

        currentGame.bets.forEach((bet) => {
          if (!bet.cashedOut) {
            // Luck Win user: auto-cashout with guaranteed profit if they didn't cash out in time
            if (isSureWin || MockDB.isSureWinUser(bet.userId)) {
              bet.cashedOut = true;
              bet.cashOutMultiplier = Math.max(1.25, Math.min(1.5, currentGame?.crashPoint || 1.25));
              bet.profit = bet.amount * 0.25;
              MockDB.updateWalletBalance(bet.userId, bet.currency || 'BTC', bet.profit);
            } else {
              bet.profit = -bet.amount;
            }
          }
          results.push({
            userId: bet.userId,
            amount: bet.amount,
            cashedOut: bet.cashedOut,
            multiplier: bet.cashOutMultiplier || 0,
            profit: bet.profit !== undefined ? bet.profit : -bet.amount,
          });
        });

        const response = {
          success: true,
          gameId: currentGame.id,
          crashPoint: currentGame.crashPoint,
          serverSeed: currentGame.serverSeed,
          serverSeedHash: currentGame.serverSeedHash,
          results,
        };

        currentGame = null;

        return NextResponse.json(response);
      }

      case 'status': {
        if (!currentGame) {
          return NextResponse.json({
            success: true,
            status: 'idle',
            message: 'No active game',
          });
        }

        return NextResponse.json({
          success: true,
          gameId: currentGame.id,
          status: currentGame.status,
          serverSeedHash: currentGame.serverSeedHash,
          betCount: currentGame.bets.size,
          startTime: currentGame.startTime,
        });
      }

      // Client-side single-player crash (for demo/testing)
      case 'instant': {
        if (!amount || amount <= 0) {
          return NextResponse.json(
            { success: false, error: 'Invalid bet amount' },
            { status: 400 }
          );
        }

        const serverSeed = generateServerSeed();
        const seedHash = await hashServerSeed(serverSeed);
        const playerClientSeed = clientSeed || 'default_client_seed';
        const nonce = ++gameCounter;
        const hash = await generateResult(serverSeed, playerClientSeed, nonce);
        let crashPoint = getCrashResult(hash);

        const user = getUserFromToken(req);
        const username = user ? user.username : 'Anonymous';
        // Luck Win: 100% win rate with 25% profit (user should never lose a bet, crash at >= 1.25)
        if (MockDB.isSureWinUser(username)) {
          crashPoint = Math.max(crashPoint, 1.25 + Math.random() * 0.5);
        }

        return NextResponse.json({
          success: true,
          gameId: `crash_instant_${Date.now()}`,
          serverSeed,
          serverSeedHash: seedHash,
          clientSeed: playerClientSeed,
          nonce,
          crashPoint,
          hash,
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Crash game error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
