'use client';

import React from 'react';
import { useSentinelStore } from '@/store/sentinel';
import { Card } from '@/components/ui/card';
import { formatUSD, cn } from '@/lib/utils';
import { TrendingUp, Activity, ShieldAlert } from 'lucide-react';

export function PortfolioSummary() {
  const { positions } = useSentinelStore();

  const totalMargin = positions.reduce((sum, p) => sum + p.margin, 0);
  const totalPnL = positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
  
  const worstPosition = positions.length > 0 
    ? [...positions].sort((a, b) => a.healthScore - b.healthScore)[0]
    : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-[var(--bg-surface)] border-[var(--border-subtle)] p-5">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider">Total Margin</span>
          <Activity className="w-3 h-3 text-[var(--text-tertiary)]" />
        </div>
        <div className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          {formatUSD(totalMargin)}
        </div>
        <div className="mt-1 text-[10px] text-[var(--text-tertiary)] font-mono">
          AGGREGATED ACROSS {positions.length} MARKETS
        </div>
      </Card>

      <Card className="bg-[var(--bg-surface)] border-[var(--border-subtle)] p-5">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider">Unrealized PnL</span>
          <TrendingUp className={cn("w-3 h-3", totalPnL >= 0 ? "text-[var(--pnl-positive)]" : "text-[var(--pnl-negative)]")} />
        </div>
        <div className={cn(
          "text-2xl font-bold tracking-tight",
          totalPnL >= 0 ? "text-[var(--pnl-positive)]" : "text-[var(--pnl-negative)]"
        )}>
          {totalPnL >= 0 ? '+' : ''}{formatUSD(totalPnL)}
        </div>
        <div className="mt-1 text-[10px] text-[var(--text-tertiary)] font-mono uppercase">
          Current Session Performance
        </div>
      </Card>

      <Card className="bg-[var(--bg-surface)] border-[var(--border-subtle)] p-5">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider">Worst Health</span>
          <ShieldAlert className={cn("w-3 h-3", worstPosition && worstPosition.healthScore < 50 ? "text-[var(--health-danger)]" : "text-[var(--text-tertiary)]")} />
        </div>
        <div className="text-2xl font-bold tracking-tight">
          {worstPosition ? (
            <span style={{ color: worstPosition.healthScore < 50 ? 'var(--health-danger)' : 'var(--text-primary)' }}>
              {worstPosition.healthScore}%
            </span>
          ) : '--'}
        </div>
        <div className="mt-1 text-[10px] text-[var(--text-tertiary)] font-mono uppercase truncate">
          {worstPosition ? worstPosition.marketName : 'No active positions'}
        </div>
      </Card>
    </div>
  );
}
