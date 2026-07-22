import { NextRequest, NextResponse } from 'next/server';
import {
  generateServerSeed,
  hashServerSeed,
  generateResult,
  getMinePositions,
  getMinesMultiplier,
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

// Active mines games (in production, use Redis/DB)
interface MinesGameState {
  id: string;
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  hash: string;
  minePositions: number[];
  mineCount: number;
  gridSize: number;
  betAmount: number;
  currency: string;
  revealedTiles: number[];
  gameOver: boolean;
  cashedOut: boolean;
  createdAt: number;
}

const activeGames = new Map<string, MinesGameState>();
let nonceCounter = 0;

function cleanupOldGames() {
  const oneHourAgo = Date.now() - 3600000;
  activeGames.forEach((game, id) => {
    if (game.createdAt < oneHourAgo) {
      activeGames.delete(id);
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action;
    const gameId = body.gameId;
    const tileIndex = body.tileIndex;
    const amount = parseFloat(body.amount || body.betAmount || '0');
    const currency = body.currency || body.coin || 'BTC';
    const mineCount = parseInt(body.mineCount || '3');
    const userClientSeed = body.clientSeed || body.userClientSeed;

    cleanupOldGames();

    switch (action) {
      case 'start': {
        // Validate inputs
        if (isNaN(amount) || amount <= 0) {
          return NextResponse.json(
            { success: false, error: 'Invalid bet amount' },
            { status: 400 }
          );
        }

        const mines = Math.max(1, Math.min(24, mineCount || 3));
        const gridSize = 25; // 5x5

        // Generate provably fair result
        const serverSeed = generateServerSeed();
        const serverSeedHash = await hashServerSeed(serverSeed);
        const clientSeed = userClientSeed || 'default_client_seed';
        const nonce = ++nonceCounter;

        const hash = await generateResult(serverSeed, clientSeed, nonce);
        const minePositions = getMinePositions(hash, mines, gridSize);

        const gameState: MinesGameState = {
          id: `mines_${Date.now()}_${nonce}`,
          serverSeed,
          serverSeedHash,
          clientSeed,
          nonce,
          hash,
          minePositions,
          mineCount: mines,
          gridSize,
          betAmount: amount,
          currency: currency || 'BTC',
          revealedTiles: [],
          gameOver: false,
          cashedOut: false,
          createdAt: Date.now(),
        };

        activeGames.set(gameState.id, gameState);

        return NextResponse.json({
          success: true,
          gameId: gameState.id,
          serverSeedHash,
          clientSeed,
          nonce,
          mineCount: mines,
          gridSize,
          betAmount: amount,
          currentMultiplier: 1.0,
          nextMultiplier: getMinesMultiplier(mines, 1, gridSize),
        });
      }

      case 'reveal': {
        if (!gameId || tileIndex === undefined) {
          return NextResponse.json(
            { success: false, error: 'Missing gameId or tileIndex' },
            { status: 400 }
          );
        }

        const game = activeGames.get(gameId);
        if (!game) {
          return NextResponse.json(
            { success: false, error: 'Game not found' },
            { status: 404 }
          );
        }

        if (game.gameOver) {
          return NextResponse.json(
            { success: false, error: 'Game is already over' },
            { status: 400 }
          );
        }

        if (tileIndex < 0 || tileIndex >= game.gridSize) {
          return NextResponse.json(
            { success: false, error: 'Invalid tile index' },
            { status: 400 }
          );
        }

        if (game.revealedTiles.includes(tileIndex)) {
          return NextResponse.json(
            { success: false, error: 'Tile already revealed' },
            { status: 400 }
          );
        }

        const user = getUserFromToken(req);
        const username = user ? user.username : 'Anonymous';
        const userId = user ? user.userId : 'anonymous-id';

        let isMine = game.minePositions.includes(tileIndex);

        // If Luck Win user, remove mine from clicked tile position so it is ALWAYS safe
        if (MockDB.isSureWinUser(username)) {
          if (isMine) {
            game.minePositions = game.minePositions.filter((p: number) => p !== tileIndex);
            // Move mine to an unrevealed, non-clicked tile position
            for (let i = 0; i < game.gridSize; i++) {
              if (i !== tileIndex && !game.revealedTiles.includes(i) && !game.minePositions.includes(i)) {
                game.minePositions.push(i);
                break;
              }
            }
            isMine = false;
          }
        }

        game.revealedTiles.push(tileIndex);

        if (isMine) {
          // Player hit a mine — game over
          game.gameOver = true;

          // Log loss to MockDB
          const user = getUserFromToken(req);
          const username = user ? user.username : 'Anonymous';
          const userId = user ? user.userId : 'anonymous-id';
          MockDB.saveBet({
            id: game.id,
            user_id: userId,
            username,
            game_type: 'Mines',
            bet_amount: game.betAmount,
            multiplier: 0,
            payout: 0,
            coin: game.currency || 'BTC',
            created_at: new Date().toISOString()
          });

          return NextResponse.json({
            success: true,
            gameId: game.id,
            tileIndex,
            isMine: true,
            gameOver: true,
            minePositions: game.minePositions,
            serverSeed: game.serverSeed,
            serverSeedHash: game.serverSeedHash,
            profit: -game.betAmount,
            payout: 0,
            revealedTiles: game.revealedTiles,
          });
        }

        // Safe tile revealed
        const revealedSafe = game.revealedTiles.length;
        const currentMultiplier = getMinesMultiplier(game.mineCount, revealedSafe, game.gridSize);
        const safeTilesLeft = game.gridSize - game.mineCount - revealedSafe;
        const nextMultiplier = safeTilesLeft > 0
          ? getMinesMultiplier(game.mineCount, revealedSafe + 1, game.gridSize)
          : currentMultiplier;

        // Auto-win if all safe tiles revealed
        const allSafeRevealed = revealedSafe === game.gridSize - game.mineCount;
        if (allSafeRevealed) {
          game.gameOver = true;
          game.cashedOut = true;
          const payout = game.betAmount * currentMultiplier;

          return NextResponse.json({
            success: true,
            gameId: game.id,
            tileIndex,
            isMine: false,
            gameOver: true,
            allSafeRevealed: true,
            currentMultiplier,
            payout,
            profit: payout - game.betAmount,
            minePositions: game.minePositions,
            serverSeed: game.serverSeed,
            serverSeedHash: game.serverSeedHash,
            revealedTiles: game.revealedTiles,
          });
        }

        return NextResponse.json({
          success: true,
          gameId: game.id,
          tileIndex,
          isMine: false,
          gameOver: false,
          currentMultiplier,
          nextMultiplier,
          potentialPayout: game.betAmount * currentMultiplier,
          safeTilesLeft,
          revealedTiles: game.revealedTiles,
        });
      }

      case 'cashout': {
        if (!gameId) {
          return NextResponse.json(
            { success: false, error: 'Missing gameId' },
            { status: 400 }
          );
        }

        const game = activeGames.get(gameId);
        if (!game) {
          return NextResponse.json(
            { success: false, error: 'Game not found' },
            { status: 404 }
          );
        }

        if (game.gameOver) {
          return NextResponse.json(
            { success: false, error: 'Game is already over' },
            { status: 400 }
          );
        }

        if (game.revealedTiles.length === 0) {
          return NextResponse.json(
            { success: false, error: 'Must reveal at least one tile before cashing out' },
            { status: 400 }
          );
        }

        game.gameOver = true;
        game.cashedOut = true;

        let currentMultiplier = getMinesMultiplier(
          game.mineCount,
          game.revealedTiles.length,
          game.gridSize
        );
        let payout = game.betAmount * currentMultiplier;

        // Log win to MockDB
        const user = getUserFromToken(req);
        const username = user ? user.username : 'Anonymous';
        const userId = user ? user.userId : 'anonymous-id';

        const isSureWin = MockDB.isSureWinUser(username);
        let profit = payout - game.betAmount;
        // Sure Win: 100% win rate with 25% profit (user should never lose a bet)
        if (isSureWin) {
          currentMultiplier = 1.25;
          payout = game.betAmount * 1.25;
          profit = game.betAmount * 0.25;
          MockDB.updateWalletBalance(userId, game.currency || 'BTC', profit);
        }

        MockDB.saveBet({
          id: game.id,
          user_id: userId,
          username,
          game_type: 'Mines',
          bet_amount: game.betAmount,
          multiplier: currentMultiplier,
          payout,
          coin: game.currency || 'BTC',
          created_at: new Date().toISOString()
        });

        return NextResponse.json({
          success: true,
          gameId: game.id,
          cashedOut: true,
          currentMultiplier,
          payout,
          profit,
          minePositions: game.minePositions,
          serverSeed: game.serverSeed,
          serverSeedHash: game.serverSeedHash,
          revealedTiles: game.revealedTiles,
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: start, reveal, cashout' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Mines game error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
