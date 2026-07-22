export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { MockDB } from '@/lib/mock-db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id') || undefined;

  const transactions = MockDB.getTransactions(userId);
  return NextResponse.json({ success: true, transactions });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, type, amount, coin, status, created_at } = body;

    const newTx = {
      id: Math.random().toString(36).substring(2, 15),
      user_id,
      type,
      amount,
      coin,
      status,
      created_at: created_at || new Date().toISOString()
    };

    const savedTx = MockDB.saveTransaction(newTx);
    return NextResponse.json({ success: true, transaction: savedTx });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { tx_id, type, amount, coin, status, created_at } = body;

    const updatedTx: any = {};
    if (type !== undefined) updatedTx.type = type;
    if (amount !== undefined) updatedTx.amount = amount;
    if (coin !== undefined) updatedTx.coin = coin;
    if (status !== undefined) updatedTx.status = status;
    if (created_at !== undefined) updatedTx.created_at = created_at;

    const result = MockDB.updateTransaction(tx_id, updatedTx);
    
    if (result) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { tx_id } = body;

    const success = MockDB.deleteTransaction(tx_id);
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
