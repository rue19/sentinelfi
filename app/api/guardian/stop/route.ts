import { NextResponse } from 'next/server';
import { stopGuardian } from '@/lib/guardian-loop';

export async function POST() {
  stopGuardian();
  return NextResponse.json({ success: true, message: 'Guardian stopped' });
}
