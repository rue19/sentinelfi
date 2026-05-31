'use client';

import React from 'react';
import { useSentinelStore } from '@/store/sentinel';
import { X, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function RuleList() {
  const { rules, removeRule } = useSentinelStore();

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/rules/${id}`, { method: 'DELETE' });
      removeRule(id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-[11px] font-mono text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Active Rules</h3>
      <div className="space-y-2">
        {rules.map(rule => (
          <div 
            key={rule.id} 
            className="group flex items-center justify-between p-2 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-all"
          >
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[10px] font-mono text-[var(--text-primary)] truncate">
                  {rule.marketId === '*' ? 'All markets' : rule.marketId.replace('-PERP', '')}
                </span>
                <span className="text-[9px] text-[var(--text-tertiary)]">→</span>
                <span className={cn(
                  "text-[9px] font-bold uppercase truncate",
                  rule.action === 'close_position' ? "text-[var(--health-danger)]" : 
                  rule.action === 'add_margin' ? "text-[var(--health-warning)]" : "text-[var(--accent)]"
                )}>
                  {rule.action.replace('_', ' ')}
                </span>
              </div>
              <div className="text-[9px] text-[var(--text-tertiary)] font-mono">
                WHEN {rule.condition.replace(/_/g, ' ')} {rule.threshold}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleDelete(rule.id)}
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-[var(--bg-elevated)] text-[var(--text-tertiary)]"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
        {rules.length === 0 && (
          <p className="text-[10px] text-[var(--text-tertiary)] font-mono p-4 text-center border border-dashed border-[var(--border-subtle)] rounded">
            No active guardrails
          </p>
        )}
      </div>
    </div>
  );
}
