'use client';

import React from 'react';
import { useSentinelStore } from '@/store/sentinel';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ConnectWallet() {
  const { setWalletAddress, setGuardianRunning, connectSSE } = useSentinelStore();
  const [address, setAddress] = React.useState('inj19vn773xatw9p062v280l30882eun72r4a2z9f9');
  const [loading, setLoading] = React.useState(false);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.startsWith('inj1') || address.length < 42) return;

    setLoading(true);
    try {
      const res = await fetch('/api/guardian/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });
      const data = await res.json();
      if (data.success) {
        setWalletAddress(address);
        setGuardianRunning(true);
        connectSSE();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-[var(--bg-surface)] border-[var(--border-strong)] p-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--health-safe-bg)] border border-[var(--health-safe)]/20 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-[var(--health-safe)]" />
            </div>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)] font-mono uppercase">
            SENTINEL<span className="text-[var(--accent)]">FI</span>
          </h1>
          <p className="text-[11px] text-[var(--text-tertiary)] font-mono uppercase tracking-[0.2em]">Guardian Initialization</p>
        </div>

        <form onSubmit={handleStart} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-mono text-[var(--text-secondary)] tracking-wider">Injective Wallet Address</Label>
            <Input 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="inj1..."
              className="bg-[var(--bg-input)] border-[var(--border-subtle)] font-mono text-sm h-11 focus:border-[var(--accent)]"
              required
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold h-11 uppercase tracking-widest"
          >
            {loading ? 'Initializing...' : 'Start Guardian'}
          </Button>
        </form>

        <div className="flex gap-3 p-4 bg-[var(--bg-elevated)] rounded border border-[var(--border-subtle)]">
          <Info className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
          <p className="text-[10px] text-[var(--text-secondary)] leading-normal font-mono">
            USING DEMO MODE — MOCK POSITIONS WILL BE GENERATED FOR THE PROVIDED ADDRESS. NO REAL ASSETS ARE MONITORED.
          </p>
        </div>
      </Card>
    </div>
  );
}
