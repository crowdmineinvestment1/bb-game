export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { MockDB } from '@/lib/mock-db';

export async function GET(req: NextRequest) {
  try {
    const wallets = MockDB.getDepositWallets();
    return NextResponse.json({ success: true, wallets });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { coin, address, network } = body;

    if (!coin || !address || !network) {
      return NextResponse.json({ success: false, error: 'Missing coin, address, or network' }, { status: 400 });
    }

    const updated = MockDB.saveDepositWallet(coin, address, network);
    return NextResponse.json({ success: true, wallet: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
