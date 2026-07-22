import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET || 'bb-game-secret-key-change-in-production';
const DEFAULT_COINS = ['BTC', 'ETH', 'USDT', 'BNB', 'DOGE'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, signature, message, nonce } = body;

    if (!address || !signature || !message) {
      return NextResponse.json(
        { error: 'Address, signature, and message are required' },
        { status: 400 }
      );
    }

    // Verify the signature
    let recoveredAddress: string;
    try {
      recoveredAddress = ethers.verifyMessage(message, signature);
    } catch {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Ensure the recovered address matches the claimed address
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json(
        { error: 'Signature does not match address' },
        { status: 401 }
      );
    }

    // Verify nonce/timestamp in message to prevent replay attacks
    const messageTimestamp = parseInt(message.match(/Nonce: (\d+)/)?.[1] || '0');
    const fiveMinutes = 5 * 60 * 1000;
    if (Date.now() - messageTimestamp > fiveMinutes) {
      return NextResponse.json(
        { error: 'Signature expired. Please try again.' },
        { status: 401 }
      );
    }

    // Find or create user by wallet address
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', address.toLowerCase())
      .single();

    let user;

    if (existingUser) {
      // Check if banned
      if (existingUser.is_banned) {
        return NextResponse.json(
          { error: 'Account has been suspended. Contact support.' },
          { status: 403 }
        );
      }

      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', existingUser.id);

      user = existingUser;
    } else {
      // Create new user with wallet
      const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
      const username = `user_${address.slice(2, 10).toLowerCase()}`;

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          username,
          wallet_address: address.toLowerCase(),
          role: 'user',
          vip_level: 0,
          vip_xp: 0,
          is_banned: false,
          avatar_url: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${address}`,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error('Wallet user creation error:', createError);
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }

      // Create default wallets
      const walletInserts = DEFAULT_COINS.map((coin) => ({
        user_id: newUser.id,
        coin,
        balance: 0,
        locked_balance: 0,
      }));

      await supabase.from('wallets').insert(walletInserts);

      // Create welcome bonus
      await supabase.from('bonuses').insert({
        user_id: newUser.id,
        type: 'welcome',
        status: 'available',
        amount: 0,
        max_amount: 1.0,
        multiplier: 1.0,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      user = newUser;
    }

    // Issue JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email || null,
        username: user.username,
        role: user.role,
        walletAddress: address.toLowerCase(),
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        vip_level: user.vip_level,
        wallet_address: address.toLowerCase(),
        avatar_url: user.avatar_url,
        created_at: user.created_at,
      },
      token,
    });

    response.cookies.set('bb-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Wallet connect error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
