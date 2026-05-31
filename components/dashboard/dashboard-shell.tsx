'use client';

import React, { useEffect } from 'react';
import { useSentinelStore } from '@/store/sentinel';
import { Header } from './header';
import { PositionCard } from './position-card';
import { NarrationPanel } from './narration-panel';
import { PortfolioSummary } from './portfolio-summary';
import { RuleBuilder } from './rule-builder';
import { RuleList } from './rule-list';
import { AlertFeed } from './alert-feed';
import { ConnectWallet } from './connect-wallet';
import { Position, Alert, GuardRail } from '@/lib/types';

interface DashboardShellProps {
  initialData: {
    positions: Position[];
    alerts: Alert[];
    rules: GuardRail[];
    isGuardianRunning: boolean;
    walletAddress: string | null;
  };
}

export function DashboardShell({ initialData }: DashboardShellProps) {
  const { 
    walletAddress,
    setWalletAddress, 
    setPositions, 
    setAlerts, 
    setRules, 
    setGuardianRunning,
    connectSSE,
    disconnectSSE,
    positions,
    isGuardianRunning
  } = useSentinelStore();

  useEffect(() => {
    // Hydrate store with initial data
    if (initialData.walletAddress) setWalletAddress(initialData.walletAddress);
    setPositions(initialData.positions);
    setAlerts(initialData.alerts);
    setRules(initialData.rules);
    setGuardianRunning(initialData.isGuardianRunning);

    // Only connect SSE if wallet is set and guardian is running (or to get updates)
    connectSSE();

    return () => disconnectSSE();
  }, []);

  if (!walletAddress) {
    return <ConnectWallet />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-sans">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-[320px] border-r border-[var(--border-subtle)] flex flex-col overflow-y-auto hidden lg:flex bg-[var(--bg-base)]">
          <div className="p-6 space-y-8">
            <RuleBuilder />
            <div className="border-t border-[var(--border-subtle)] pt-6">
              <RuleList />
            </div>
            <div className="border-t border-[var(--border-subtle)] pt-6">
              <AlertFeed />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <PortfolioSummary />
            
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[11px] font-mono text-[var(--text-tertiary)] uppercase tracking-widest">Active Positions</h2>
                <div className="text-[9px] font-mono text-[var(--text-tertiary)] flex items-center gap-2">
                  <div className="w-1 h-1 bg-[var(--health-safe)] rounded-full animate-pulse" />
                  Live Updating
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {positions.map(pos => (
                  <PositionCard key={pos.marketId} position={pos} />
                ))}
                {positions.length === 0 && (
                  <div className="col-span-full py-12 text-center border border-[var(--border-subtle)] border-dashed rounded-lg">
                    <p className="text-[var(--text-tertiary)] font-mono text-xs">No open positions found for this wallet.</p>
                  </div>
                )}
              </div>
            </section>

            <section className="pt-4">
              <NarrationPanel />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
