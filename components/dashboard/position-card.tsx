'use client';

import React from 'react';
import { Position } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn, formatUSD, formatPercent, getHealthColor, getHealthStatusLabel } from '@/lib/utils';
import { useSentinelStore } from '@/store/sentinel';

export function PositionCard({ position }: { position: Position }) {
  const { selectedMarketId, setSelectedMarket } = useSentinelStore();
  const isSelected = selectedMarketId === position.marketId;
  const healthColor = getHealthColor(position.healthScore);
  
  return (
    <Card 
      className={cn(
        "bg-[var(--bg-surface)] border-[var(--border-subtle)] p-4 cursor-pointer transition-all hover:bg-[var(--bg-elevated)] relative overflow-hidden",
        isSelected && "border-[var(--border-strong)] ring-1 ring-[var(--border-strong)]",
        position.healthScore < 40 && `border-l-4 border-l-[${healthColor}]`
      )}
      onClick={() => setSelectedMarket(position.marketId)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-[var(--text-primary)]">{position.marketName}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={cn(
              "text-[9px] px-1.5 py-0 font-bold uppercase tracking-wider",
              position.direction === 'long' ? "bg-[var(--health-safe-bg)] text-[var(--health-safe)] border-[var(--health-safe)]/20" : "bg-[var(--health-danger-bg)] text-[var(--health-danger)] border-[var(--health-danger)]/20"
            )}>
              {position.direction}
            </Badge>
            <span className="text-[10px] text-[var(--text-tertiary)] font-mono">{position.leverage}x</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-[var(--text-tertiary)] block uppercase tracking-tighter">Health</span>
          <span className="text-sm font-mono font-bold" style={{ color: healthColor }}>{position.healthScore}%</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="relative h-1.5 w-full bg-[var(--border-subtle)] rounded-full overflow-hidden">
          <div 
            className={cn(
              "absolute h-full transition-all duration-700 ease-out",
              position.healthStatus === 'critical' && "animate-pulse"
            )}
            style={{ 
              width: `${position.healthScore}%`,
              backgroundColor: healthColor
            }}
          />
        </div>
        
        <div className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: healthColor }}>
          {getHealthStatusLabel(position.healthScore)}
        </div>

        <div className="grid grid-cols-2 gap-y-2 mt-4 pt-4 border-t border-[var(--border-subtle)]">
          <div>
            <span className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-wider block">Mark</span>
            <span className="text-xs font-mono">{formatUSD(position.markPrice)}</span>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-wider block">Entry</span>
            <span className="text-xs font-mono text-[var(--text-secondary)]">{formatUSD(position.entryPrice)}</span>
          </div>
          <div>
            <span className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-wider block">Liq Price</span>
            <span className="text-xs font-mono text-[var(--health-warning)]">{formatUSD(position.liquidationPrice)}</span>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-wider block">Unrealized PnL</span>
            <span className={cn(
              "text-xs font-mono font-bold",
              position.unrealizedPnl >= 0 ? "text-[var(--pnl-positive)]" : "text-[var(--pnl-negative)]"
            )}>
              {position.unrealizedPnl >= 0 ? '+' : ''}{formatUSD(position.unrealizedPnl)}
            </span>
          </div>
          <div>
            <span className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-wider block">Funding</span>
            <span className="text-xs font-mono text-[var(--text-secondary)]">{formatUSD(position.fundingCostPerHour)}/hr</span>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-wider block">Margin</span>
            <span className="text-xs font-mono">{formatUSD(position.margin)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
