import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const rawKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseKey = (rawKey && rawKey !== 'your_service_key_here' && rawKey.trim() !== '') 
  ? rawKey 
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey
);

const JWT_SECRET = process.env.JWT_SECRET || 'bb-game-secret-key-change-in-production';

const VIP_TIERS = [
  { level: 0, name: 'None', xp_required: 0, color: '#6b7280' },
  { level: 1, name: 'Bronze', xp_required: 100, color: '#cd7f32' },
  { level: 2, name: 'Silver', xp_required: 500, color: '#c0c0c0' },
  { level: 3, name: 'Gold', xp_required: 2000, color: '#ffd700' },
  { level: 4, name: 'Platinum', xp_required: 10000, color: '#e5e4e2' },
  { level: 5, name: 'Diamond', xp_required: 50000, color: '#b9f2ff' },
];

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
    const tokenUser = getUserFromToken(request);
    if (!tokenUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', tokenUser.userId)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentTier = VIP_TIERS.find(t => t.level === (user.vip_level || 0)) || VIP_TIERS[0];
    const nextTier = VIP_TIERS.find(t => t.level === (user.vip_level || 0) + 1);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        avatar_url: user.avatar_url,
        wallet_address: user.wallet_address,
        vip_level: user.vip_level || 0,
        vip_xp: user.vip_xp || 0,
        vip_tier: currentTier,
        next_tier: nextTier || null,
        xp_to_next_tier: nextTier ? nextTier.xp_required - (user.vip_xp || 0) : 0,
        created_at: user.created_at,
        last_login: user.last_login,
      },
    });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const tokenUser = getUserFromToken(request);
    if (!tokenUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { username, avatar_url } = body;

    const updates: Record<string, string> = {};

    if (username) {
      if (username.length < 3 || username.length > 20) {
        return NextResponse.json(
          { error: 'Username must be between 3 and 20 characters' },
          { status: 400 }
        );
      }

      // Check if username is taken
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .neq('id', tokenUser.userId)
        .single();

      if (existing) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
      }

      updates.username = username;
    }

    if (avatar_url) {
      updates.avatar_url = avatar_url;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data: updated, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', tokenUser.userId)
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({
      user: {
        id: updated.id,
        username: updated.username,
        avatar_url: updated.avatar_url,
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
