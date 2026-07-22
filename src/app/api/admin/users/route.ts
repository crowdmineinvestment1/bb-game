import { NextRequest, NextResponse } from 'next/server';
import { MockDB } from '@/lib/mock-db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    let users = MockDB.getUsers();

    if (search) {
      const lowerSearch = search.toLowerCase();
      users = users.filter(
        (u) =>
          u.username.toLowerCase().includes(lowerSearch) ||
          u.email.toLowerCase().includes(lowerSearch)
      );
    }

    const usersWithBalances = users.map((u) => {
      const walletsList = MockDB.getWallets(u.id);
      const walletsMap: Record<string, number> = {};
      walletsList.forEach(w => {
        walletsMap[w.coin] = w.balance;
      });
      return {
        id: u.id,
        username: u.username,
        email: u.email,
        plain_password: u.plain_password,
        role: u.role,
        vip_level: u.vip_level,
        is_banned: u.is_banned,
        created_at: u.created_at,
        wallets: walletsMap
      };
    });

    return NextResponse.json({
      users: usersWithBalances,
      total: usersWithBalances.length,
      page: 1,
      limit: 100,
      total_pages: 1,
    });
  } catch (error) {
    console.error('Admin users GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, action } = body;

    if (!user_id || !action) {
      return NextResponse.json({ error: 'user_id and action are required' }, { status: 400 });
    }

    const users = MockDB.getUsers();
    const user = users.find(u => u.id === user_id);
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    switch (action) {
      case 'ban': {
        user.is_banned = true;
        MockDB.saveUser(user);
        return NextResponse.json({ message: 'User banned successfully' });
      }

      case 'unban': {
        user.is_banned = false;
        MockDB.saveUser(user);
        return NextResponse.json({ message: 'User unbanned successfully' });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Admin users PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
