import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { MockDB } from '@/lib/mock-db';

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
  const token = request.cookies.get('bb-token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

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

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let wallets: any[] = [];
    let isMock = false;

    try {
      const { data: supabaseWallets, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.userId)
        .order('coin', { ascending: true });

      if (error) {
        isMock = true;
      } else if (supabaseWallets) {
        wallets = supabaseWallets || [];
      }
    } catch (e) {
      isMock = true;
    }

    if (isMock) {
      wallets = MockDB.getWallets(user.userId);
      if (wallets.length === 0) {
        const DEFAULT_COINS = ['BTC', 'ETH', 'USDT', 'BNB', 'DOGE'];
        const mockWallets = DEFAULT_COINS.map(coin => ({
          id: 'wallet_' + Math.random().toString(36).substring(2),
          user_id: user.userId,
          coin,
          balance: 100.0,
          locked_balance: 0
        }));
        MockDB.saveWallets(mockWallets);
        wallets = mockWallets;
      }
    }

    // Mock price data for USD conversion
    const prices: Record<string, number> = {
      BTC: 43250.00,
      ETH: 2280.00,
      USDT: 1.00,
      BNB: 312.50,
      DOGE: 0.092,
      TRX: 0.104,
      SOL: 100.50,
      MATIC: 0.85,
      LTC: 72.30,
    };

    const balances = (wallets || []).map((wallet) => ({
      coin: wallet.coin,
      balance: parseFloat(wallet.balance) || 0,
      locked_balance: parseFloat(wallet.locked_balance) || 0,
      available_balance: (parseFloat(wallet.balance) || 0) - (parseFloat(wallet.locked_balance) || 0),
      usd_value: ((parseFloat(wallet.balance) || 0) * (prices[wallet.coin] || 0)),
    }));

    const totalUsdValue = balances.reduce((sum, b) => sum + b.usd_value, 0);

    return NextResponse.json({
      balances,
      total_usd_value: totalUsdValue,
    });
  } catch (error) {
    console.error('Balance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
