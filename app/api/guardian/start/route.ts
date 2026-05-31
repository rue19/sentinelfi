import { NextResponse } from 'next/server';
import { startGuardian } from '@/lib/guardian-loop';

export async function POST(request: Request) {
  try {
    const { walletAddress } = await request.json();
    
    if (!walletAddress || !walletAddress.startsWith('inj1') || walletAddress.length < 42) {
      return NextResponse.json({ error: 'Invalid Injective address' }, { status: 400 });
    }

    startGuardian(walletAddress);
    
    return NextResponse.json({ success: true, message: 'Guardian started' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to start guardian' }, { status: 500 });
  }
}
