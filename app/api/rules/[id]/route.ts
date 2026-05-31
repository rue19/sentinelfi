import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getGuardianState } from '@/lib/guardian-loop';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    db.prepare('DELETE FROM rules WHERE id = ?').run(id);

    // Refresh rules in active loop
    const state = getGuardianState();
    state.rules = state.rules.filter(r => r.id !== id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete rule' }, { status: 500 });
  }
}
