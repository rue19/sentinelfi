'use client';

import React from 'react';
import { useSentinelStore } from '@/store/sentinel';
import { Bot, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function NarrationPanel() {
  const { positions, selectedMarketId, narrations, setNarration } = useSentinelStore();
  const [loading, setLoading] = React.useState(false);

  const selectedPosition = positions.find(p => p.marketId === selectedMarketId);
  const narration = selectedMarketId ? narrations[selectedMarketId] : null;

  const handleRefresh = async () => {
    if (!selectedPosition) return;
    setLoading(true);
    try {
      const res = await fetch('/api/narrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position: selectedPosition }),
      });
      const data = await res.json();
      if (data.narration) {
        setNarration(selectedPosition.marketId, data.narration);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedMarketId) {
    return (
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-8 flex flex-col items-center justify-center border-dashed">
        <Bot className="w-8 h-8 text-[var(--text-tertiary)] mb-2" />
        <p className="text-[var(--text-tertiary)] text-xs font-mono">Select a position for AI analysis</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-6 relative overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-[var(--accent)]" />
          <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-widest">Sentinel Analysis</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[9px] text-[var(--text-tertiary)] font-mono">Updated recently</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 hover:bg-[var(--bg-elevated)]"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={cn("w-3 h-3 text-[var(--text-secondary)]", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      <div className="min-h-[60px]">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-[var(--bg-elevated)]" />
            <Skeleton className="h-4 w-[80%] bg-[var(--bg-elevated)]" />
          </div>
        ) : (
          <p className="text-[15px] font-sans text-[var(--text-primary)] leading-relaxed animate-in fade-in slide-in-from-left-2 duration-500">
            {narration || "Analysis pending... Click refresh to generate."}
          </p>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex justify-between items-center">
        <div className="flex gap-4">
          <div className="text-[10px] font-mono">
            <span className="text-[var(--text-tertiary)]">MARKET:</span> {selectedPosition?.marketName}
          </div>
          <div className="text-[10px] font-mono">
            <span className="text-[var(--text-tertiary)]">STATUS:</span> <span className="text-[var(--health-warning)] uppercase">{selectedPosition?.healthStatus}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
