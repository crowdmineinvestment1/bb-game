import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
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

function generateDepositAddress(coin: string): string {
  const hash = crypto.randomBytes(20).toString('hex');
  const prefixes: Record<string, string> = {
    BTC: '1',
    ETH: '0x',
    USDT: 'T',
    BNB: 'bnb1',
    DOGE: 'D',
    TRX: 'T',
    SOL: '',
    LTC: 'L',
  };
  return `${prefixes[coin] || ''}${hash}`;
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { coin, amount } = body;

    if (!coin || !amount) {
      return NextResponse.json(
        { error: 'Coin and amount are required' },
        { status: 400 }
      );
    }

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid deposit amount' },
        { status: 400 }
      );
    }

    const validCoins = ['BTC', 'ETH', 'USDT', 'BNB', 'DOGE', 'TRX', 'SOL', 'LTC'];
    if (!validCoins.includes(coin.toUpperCase())) {
      return NextResponse.json(
        { error: 'Unsupported coin' },
        { status: 400 }
      );
    }

    // Generate mock deposit address
    const depositAddress = generateDepositAddress(coin.toUpperCase());

    // Get current wallet balance
    let isMock = false;
    let wallet: any = null;

    try {
      const { data: supabaseWallet, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.userId)
        .eq('coin', coin.toUpperCase())
        .maybeSingle();

      if (walletError && (walletError.message.includes('Invalid API key') || walletError.message.includes('API key'))) {
        isMock = true;
      } else {
        wallet = supabaseWallet;
      }
    } catch (e) {
      isMock = true;
    }

    const txId = crypto.randomUUID ? crypto.randomUUID() : 'tx_' + Math.random().toString(36).substring(2);
    const txHash = `0x${crypto.randomBytes ? crypto.randomBytes(32).toString('hex') : Math.random().toString(36)}`;

    if (isMock) {
      // Mock DB balance update
      MockDB.updateWalletBalance(user.userId, coin.toUpperCase(), depositAmount);
      
      // Log transaction in Mock DB
      MockDB.saveTransaction({
        id: txId,
        user_id: user.userId,
        type: 'deposit',
        coin: coin.toUpperCase(),
        amount: depositAmount,
        status: 'completed',
        address: depositAddress,
        tx_hash: txHash,
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      });
    } else {
      // Standard Supabase balance update
      if (!wallet) {
        await supabase.from('wallets').insert({
          user_id: user.userId,
          coin: coin.toUpperCase(),
          balance: depositAmount,
          locked_balance: 0,
        });
      } else {
        const newBalance = (parseFloat(wallet.balance) || 0) + depositAmount;
        await supabase
          .from('wallets')
          .update({ balance: newBalance })
          .eq('user_id', user.userId)
          .eq('coin', coin.toUpperCase());
      }

      // Log transaction in Supabase
      await supabase.from('transactions').insert({
        id: txId,
        user_id: user.userId,
        type: 'deposit',
        coin: coin.toUpperCase(),
        amount: depositAmount,
        status: 'completed',
        address: depositAddress,
        tx_hash: txHash,
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      transaction: {
        id: txId,
        type: 'deposit',
        coin: coin.toUpperCase(),
        amount: depositAmount,
        status: 'completed',
        deposit_address: depositAddress,
      },
      message: `Successfully deposited ${depositAmount} ${coin.toUpperCase()}`,
    });
  } catch (error) {
    console.error('Deposit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
