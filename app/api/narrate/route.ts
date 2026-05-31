import { NextResponse } from 'next/server';
import { narratePosition } from '@/lib/anthropic';
import db from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { position } = await request.json();
    
    if (!position || !position.marketId) {
      return NextResponse.json({ error: 'Position required' }, { status: 400 });
    }

    const narration = await narratePosition(position);

    // Cache it
    db.prepare('UPDATE positions_cache SET narration = ?, narration_updated_at = ? WHERE market_id = ? AND wallet_address = ?')
      .run(narration, new Date().toISOString(), position.marketId, position.walletAddress || 'demo');

    return NextResponse.json({ narration });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate narration' }, { status: 500 });
  }
}
