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

const DEFAULT_SETTINGS = {
  house_edge: 0.01,
  min_bet: 0.00000001,
  max_bet: 100,
  maintenance_mode: false,
  registration_enabled: true,
  chat_enabled: true,
  withdrawal_enabled: true,
  max_withdrawal_per_day: 10,
  min_withdrawal: { BTC: 0.0005, ETH: 0.01, USDT: 10 },
  supported_coins: ['BTC', 'ETH', 'USDT', 'BNB', 'DOGE'],
  rakeback_rate: 0.05,
  welcome_bonus_max: 1.0,
};

function requireAdmin(request: NextRequest) {
  const token = request.cookies.get('bb-token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const user = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      role: string;
    };
    if (user.role !== 'admin') return null;
    return user;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const admin = requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { data: settings, error } = await supabase
      .from('settings')
      .select('*')
      .single();

    if (error || !settings) {
      return NextResponse.json({ settings: DEFAULT_SETTINGS });
    }

    return NextResponse.json({
      settings: {
        ...DEFAULT_SETTINGS,
        ...(settings.data || {}),
      },
    });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const allowedKeys = Object.keys(DEFAULT_SETTINGS);
    const updates: Record<string, unknown> = {};

    for (const key of allowedKeys) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid settings to update' }, { status: 400 });
    }

    // Upsert settings
    const { data: existing } = await supabase
      .from('settings')
      .select('*')
      .single();

    if (existing) {
      await supabase
        .from('settings')
        .update({
          data: { ...(existing.data || {}), ...updates },
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('settings')
        .insert({
          data: { ...DEFAULT_SETTINGS, ...updates },
          updated_at: new Date().toISOString(),
        });
    }

    return NextResponse.json({
      message: 'Settings updated successfully',
      settings: updates,
    });
  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
