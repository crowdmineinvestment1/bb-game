export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { MockDB } from '@/lib/mock-db';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-bb-game-2024';

function getUserFromReq(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      token = req.cookies.get('auth_token')?.value || req.cookies.get('bb-token')?.value || '';
    }
    
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = MockDB.findUserById(decoded.userId || decoded.id);
      if (user) return { id: user.id, username: user.username };
    }
  } catch (error) {
    // ignore
  }

  // Fallback guest session ID from query or IP or header
  const guestId = req.headers.get('x-guest-id') || 'guest_user';
  return { id: guestId, username: 'Guest User' };
}

export async function GET(req: NextRequest) {
  const user = getUserFromReq(req);
  const rawMessages = MockDB.getSupportMessages(user.id);
  
  const messages = rawMessages.map((m: any) => ({
    id: m.id,
    user_id: m.user_id,
    sender: m.sender || (m.isAdmin ? 'admin' : 'user'),
    username: m.username || 'User',
    text: m.text || m.message || '',
    message: m.text || m.message || '',
    created_at: m.created_at || m.timestamp || new Date().toISOString(),
    timestamp: m.created_at || m.timestamp || new Date().toISOString(),
    isAdmin: m.sender === 'admin' || m.isAdmin === true
  }));

  return NextResponse.json({ success: true, messages });
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromReq(req);
    const body = await req.json();
    const content = body.text || body.message;

    if (!content || !content.trim()) {
      return NextResponse.json({ success: false, error: 'Message content is required' }, { status: 400 });
    }

    const savedMessage = MockDB.saveSupportMessage({
      id: Math.random().toString(36).substring(7),
      user_id: user.id,
      sender: 'user',
      username: user.username,
      message: content.trim(),
      text: content.trim(),
      created_at: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      isAdmin: false
    });

    const formatted = {
      id: savedMessage.id,
      user_id: savedMessage.user_id,
      sender: 'user',
      username: savedMessage.username,
      text: savedMessage.text,
      message: savedMessage.text,
      created_at: savedMessage.created_at,
      timestamp: savedMessage.created_at,
      isAdmin: false
    };

    return NextResponse.json({ success: true, message: formatted });
  } catch (error) {
    console.error('Support API POST error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
