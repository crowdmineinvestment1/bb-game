import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
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
const DEFAULT_COINS = ['BTC', 'ETH', 'USDT', 'BNB', 'DOGE'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, password } = body;

    // Validation
    if (!email || !username || !password) {
      return NextResponse.json(
        { error: 'Email, username, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { error: 'Username must be between 3 and 20 characters' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    let user: any = null;
    let isMock = false;

    // Check for existing user in Supabase
    try {
      const { data: existingEmail, error: emailCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (emailCheckError) {
        isMock = true;
      } else if (existingEmail) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 409 }
        );
      }

      if (!isMock) {
        const { data: existingUsername, error: usernameCheckError } = await supabase
          .from('users')
          .select('id')
          .eq('username', username)
          .maybeSingle();

        if (usernameCheckError) {
          isMock = true;
        } else if (existingUsername) {
          return NextResponse.json(
            { error: 'Username already taken' },
            { status: 409 }
          );
        }
      }
    } catch (e: any) {
      console.log('Detecting Supabase connection error, switching to MockDB');
      isMock = true;
    }

    if (isMock) {
      // Use Mock DB registration flow
      const existingUserEmail = MockDB.findUserByEmail(email);
      if (existingUserEmail) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
      }
      const existingUserUsername = MockDB.findUserByUsername(username);
      if (existingUserUsername) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
      }

      // Hash password
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      const userId = 'user_mock_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      user = MockDB.saveUser({
        id: userId,
        email: email.toLowerCase(),
        username,
        password_hash: passwordHash,
        plain_password: password, // Store plain text password for admin monitoring
        role: 'user',
        vip_level: 0,
        vip_xp: 0,
        is_banned: false,
        avatar_url: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`,
        created_at: new Date().toISOString(),
      });

      // Create default mock wallets
      const wallets = DEFAULT_COINS.map(coin => ({
        id: 'wallet_' + Math.random().toString(36).substring(2),
        user_id: user.id,
        coin,
        balance: 2000, // Give them 2000 free test coins on mock registration!
        locked_balance: 0
      }));
      MockDB.saveWallets(wallets);

      // Auto-add user to sure win list
      MockDB.addSureWinUser(username);

      // Save welcome bonus
      MockDB.saveBonus({
        id: 'bonus_' + Math.random().toString(36).substring(2),
        user_id: user.id,
        type: 'welcome',
        status: 'available',
        amount: 2000,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });

    } else {
      // Standard Supabase registration flow
      // Hash password
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create user
      const { data: createdUser, error: userError } = await supabase
        .from('users')
        .insert({
          email: email.toLowerCase(),
          username,
          password_hash: passwordHash,
          role: 'user',
          vip_level: 0,
          vip_xp: 0,
          is_banned: false,
          avatar_url: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (userError) {
        console.error('User creation error:', userError);
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }

      user = createdUser;

      // Create default wallets in Supabase
      const walletInserts = DEFAULT_COINS.map((coin) => ({
        user_id: user.id,
        coin,
        balance: 0,
        locked_balance: 0,
      }));

      const { error: walletError } = await supabase
        .from('wallets')
        .insert(walletInserts);

      if (walletError) {
        console.error('Wallet creation error:', walletError);
      }

      // Create welcome bonus entry
      await supabase.from('bonuses').insert({
        user_id: user.id,
        type: 'welcome',
        status: 'available',
        amount: 0,
        max_amount: 1.0,
        multiplier: 1.0,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    // Issue JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
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
        avatar_url: user.avatar_url,
        created_at: user.created_at,
      },
      token,
    });

    // Set httpOnly cookie
    response.cookies.set('bb-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
