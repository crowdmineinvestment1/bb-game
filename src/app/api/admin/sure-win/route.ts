export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { MockDB } from '@/lib/mock-db';

export async function GET(request: NextRequest) {
  try {
    const users = MockDB.getSureWinUsers();
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('Sure win API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username, action } = await request.json();

    if (!username || !action) {
      return NextResponse.json({ error: 'Missing username or action' }, { status: 400 });
    }

    if (action === 'add') {
      MockDB.addSureWinUser(username);
    } else if (action === 'remove') {
      MockDB.removeSureWinUser(username);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sure win API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
