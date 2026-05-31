import { NextResponse } from 'next/server';
import { getGuardianState } from '@/lib/guardian-loop';

export async function GET() {
  const state = getGuardianState();
  return NextResponse.json({ positions: state.positions });
}
