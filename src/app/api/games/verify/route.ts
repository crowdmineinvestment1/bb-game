import { NextRequest, NextResponse } from 'next/server';
import { verifyGame, type GameType } from '@/lib/provably-fair';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serverSeed, clientSeed, nonce, gameType, options } = body;

    // Validate inputs
    if (!serverSeed || typeof serverSeed !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Server seed is required' },
        { status: 400 }
      );
    }

    if (!clientSeed || typeof clientSeed !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Client seed is required' },
        { status: 400 }
      );
    }

    if (nonce === undefined || typeof nonce !== 'number' || nonce < 0) {
      return NextResponse.json(
        { success: false, error: 'Valid nonce is required' },
        { status: 400 }
      );
    }

    const validGameTypes: GameType[] = ['crash', 'dice', 'plinko', 'mines', 'limbo', 'wheel'];
    if (!gameType || !validGameTypes.includes(gameType)) {
      return NextResponse.json(
        { success: false, error: `Game type must be one of: ${validGameTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Verify the game
    const verification = await verifyGame(
      serverSeed,
      clientSeed,
      nonce,
      gameType as GameType,
      options
    );

    return NextResponse.json({
      success: true,
      verification,
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
