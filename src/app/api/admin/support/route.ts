export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { MockDB } from '@/lib/mock-db';

export async function GET() {
  try {
    const chats = MockDB.getAllSupportChats();
    return NextResponse.json({ success: true, chats });
  } catch (error) {
    console.error('Error fetching admin support chats:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { user_id, username, message, text } = body;
    const content = message || text;

    if (!content || !content.trim()) {
      return NextResponse.json({ success: false, error: 'Message content is required' }, { status: 400 });
    }

    // Find user_id if missing
    if (!user_id && username) {
      const allChats = MockDB.getAllSupportChats();
      const match = allChats.find((c: any) => c.username?.toLowerCase() === username.toLowerCase() || c.user_id?.toLowerCase() === username.toLowerCase());
      if (match) {
        user_id = match.user_id;
      } else {
        user_id = username;
      }
    }

    if (!user_id) {
      user_id = 'guest_user';
    }

    const savedMessage = MockDB.saveSupportMessage({
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      user_id,
      sender: 'admin',
      username: 'Customer Service Agent',
      message: content.trim(),
      text: content.trim(),
      created_at: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      isAdmin: true
    });

    return NextResponse.json({ success: true, message: savedMessage });
  } catch (error) {
    console.error('Error saving admin support reply:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
