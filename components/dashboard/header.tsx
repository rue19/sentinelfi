'use client';

import React from 'react';
import { useSentinelStore } from '@/store/sentinel';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertTriangle, Power } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function Header() {
  const { isGuardianRunning, isConnected, setGuardianRunning } = useSentinelStore();
  const [showKillDialog, setShowKillDialog] = React.useState(false);

  const handleKill = async () => {
    try {
      await fetch('/api/guardian/stop', { method: 'POST' });
      setGuardianRunning(false);
      setShowKillDialog(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="h-14 border-b border-[var(--border-subtle)] bg-[var(--bg-base)] flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <span className="font-mono text-[15px] tracking-[0.15em] font-bold">
          SENTINEL<span className="text-[var(--accent)]">FI</span>
        </span>
      </div>

      <div className="hidden md:block">
        <span className="font-mono text-[11px] text-[var(--text-tertiary)] uppercase tracking-wider">
          Injective Testnet
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isGuardianRunning ? "bg-[var(--health-safe)] animate-pulse-dot" : "bg-[var(--text-tertiary)]"
          )} />
          <span className={cn(
            "text-[10px] font-bold tracking-tight uppercase",
            isGuardianRunning ? "text-[var(--health-safe)]" : "text-[var(--text-tertiary)]"
          )}>
            {isGuardianRunning ? "Guardian Active" : "Guardian Offline"}
          </span>
        </div>

        {isGuardianRunning && (
          <Dialog open={showKillDialog} onOpenChange={setShowKillDialog}>
            <DialogTrigger>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-[var(--health-danger)] text-[var(--health-danger)] hover:bg-[var(--health-danger-bg)] hover:text-[var(--health-danger)] h-8 text-[11px] font-bold uppercase tracking-wider"
              >
                Kill Switch
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[var(--bg-surface)] border-[var(--border-strong)] text-[var(--text-primary)]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="text-[var(--health-danger)]" />
                  Confirm Emergency Stop
                </DialogTitle>
                <DialogDescription className="text-[var(--text-secondary)]">
                  This will immediately stop all automated guardrail executions. Your positions will no longer be monitored by SentinelFi.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setShowKillDialog(false)}>Cancel</Button>
                <Button 
                  className="bg-[var(--health-danger)] hover:bg-[var(--health-critical)]"
                  onClick={handleKill}
                >
                  Confirm Kill Switch
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </header>
  );
}
