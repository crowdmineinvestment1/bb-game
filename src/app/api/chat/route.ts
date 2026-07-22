export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { MockDB } from '@/lib/mock-db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-bb-game-2024';

function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('bb-token')?.value ||
    request.cookies.get('auth_token')?.value ||
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

// Default lively chat bot messages list for English Room
const BOT_MESSAGES = [
  { username: 'SatoshiGhost', vip_level: 8, message: 'Just cashed out 5.2x on Crash! LFG 🔥' },
  { username: 'CryptoKing', vip_level: 12, message: 'anyone tried the new 3D Dice? physics look sick' },
  { username: 'PlinkoPro', vip_level: 4, message: 'Plinko pink row is hot today hit 100x twice' },
  { username: 'MinesWeeper', vip_level: 6, message: 'gg to whoever just hit 25x on Mines!' },
  { username: 'LimboMaster', vip_level: 9, message: 'Setting target to 50x target multiplier wished me luck' },
  { username: 'SpinWin', vip_level: 3, message: 'Wheel of fortune landed on 14x nice payout!' },
  { username: 'CryptoNinja', vip_level: 5, message: 'BTC pump + Casino wins = best combo ever' },
  { username: 'LuckyRoller', vip_level: 7, message: 'Rakeback bonus just claimed thanks Bb.GAME!' },
  { username: 'VipDealer', vip_level: 10, message: 'Good luck everyone in the English Room today 🍀' },
  { username: 'AlphaTrader', vip_level: 11, message: 'Withdrawals super instant today loved it' }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let messages = MockDB.getChatMessages(limit);

    if (!messages || messages.length < 5) {
      // Seed default messages if empty
      const initialMsgs = [
        { id: 'msg_init_1', user_id: 'sys', username: 'Bb.GAME System', vip_level: 12, message: 'Welcome to the Official English Room! 🚀 Have fun and chat responsibly.', created_at: new Date(Date.now() - 3600000).toISOString() },
        { id: 'msg_init_2', user_id: 'bot1', username: 'SatoshiGhost', vip_level: 8, message: 'Just cashed out 5.2x on Crash! LFG 🔥', created_at: new Date(Date.now() - 1800000).toISOString() },
        { id: 'msg_init_3', user_id: 'bot2', username: 'CryptoKing', vip_level: 12, message: 'Anyone playing the 3D Dice game today?', created_at: new Date(Date.now() - 900000).toISOString() }
      ];
      initialMsgs.forEach(m => MockDB.saveChatMessage(m));
      messages = MockDB.getChatMessages(limit);
    }

    return NextResponse.json({
      success: true,
      messages: messages || []
    });
  } catch (error) {
    console.error('Chat GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, username: reqUsername, isBot } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    const user = getUserFromToken(request);
    const senderUsername = isBot ? reqUsername : (user?.username || reqUsername || 'Anonymous');
    const senderId = isBot ? `bot_${Date.now()}` : (user?.userId || 'user_' + Date.now());
    const vipLevel = isBot ? Math.floor(Math.random() * 8) + 2 : (user?.role === 'admin' ? 12 : 3);

    const savedMsg = MockDB.saveChatMessage({
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      user_id: senderId,
      username: senderUsername,
      message: message.trim(),
      room: 'english',
      vip_level: vipLevel,
      created_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true, message: savedMsg });
  } catch (error) {
    console.error('Chat POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
