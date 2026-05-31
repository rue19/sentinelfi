'use client';

import React from 'react';
import { useSentinelStore } from '@/store/sentinel';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

export function AlertFeed() {
  const { alerts } = useSentinelStore();

  return (
    <div className="space-y-4">
      <h3 className="text-[11px] font-mono text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Recent Alerts</h3>
      <ScrollArea className="h-[300px]">
        <div className="space-y-3 pr-4">
          {alerts.map(alert => (
            <div 
              key={alert.id} 
              className="flex flex-col gap-1 border-l border-[var(--border-subtle)] pl-3 py-1 animate-in slide-in-from-top-2 duration-300"
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  alert.alertType === 'rule_triggered' ? "bg-[var(--health-warning)]" :
                  alert.alertType === 'action_executed' ? "bg-[var(--health-safe)]" : "bg-[var(--health-danger)]"
                )} />
                <span className="text-[10px] font-mono text-[var(--text-primary)]">
                  {alert.marketId.replace('-PERP', '')}
                </span>
                <span className="text-[8px] text-[var(--text-tertiary)] ml-auto uppercase font-mono">
                  {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-[10px] leading-relaxed text-[var(--text-secondary)]">
                {alert.message}
              </p>
            </div>
          ))}
          {alerts.length === 0 && (
            <p className="text-[10px] text-[var(--text-tertiary)] font-mono p-4 text-center">
              No recent notifications
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
