import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');

  if (!wallet) {
    return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
  }

  const alerts = db.prepare('SELECT * FROM alerts WHERE wallet_address = ? ORDER BY created_at DESC LIMIT 50').all(wallet) as any[];
  const formattedAlerts = alerts.map(a => ({
    ...a,
    positionSnapshot: JSON.parse(a.position_snapshot)
  }));

  return NextResponse.json(formattedAlerts);
}
