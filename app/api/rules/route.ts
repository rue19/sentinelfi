import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getGuardianState } from '@/lib/guardian-loop';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');

  if (!wallet) {
    return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
  }

  const rules = db.prepare('SELECT * FROM rules WHERE wallet_address = ?').all(wallet) as any[];
  const formattedRules = rules.map(r => ({
    ...r,
    isActive: !!r.is_active,
    actionParams: JSON.parse(r.action_params)
  }));

  return NextResponse.json(formattedRules);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { walletAddress, marketId, condition, threshold, action, actionParams } = body;

    if (!walletAddress || !marketId || !condition || threshold === undefined || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const id = uuidv4();
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO rules (id, wallet_address, market_id, condition, threshold, action, action_params, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, walletAddress, marketId, condition, threshold, action, JSON.stringify(actionParams || {}), createdAt);

    // Refresh rules in active loop
    const state = getGuardianState();
    if (state.walletAddress === walletAddress) {
      state.rules.push({
        id,
        walletAddress,
        marketId,
        condition,
        threshold,
        action,
        actionParams: actionParams || {},
        isActive: true,
        createdAt
      });
    }

    return NextResponse.json({ id, success: true });
  } catch (error) {
    console.error('Create Rule Error:', error);
    return NextResponse.json({ error: 'Failed to create rule' }, { status: 500 });
  }
}
