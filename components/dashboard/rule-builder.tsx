'use client';

import React from 'react';
import { useSentinelStore } from '@/store/sentinel';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function RuleBuilder() {
  const { walletAddress, positions, addRule } = useSentinelStore();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!walletAddress) return;
    
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      walletAddress,
      marketId: formData.get('marketId'),
      condition: formData.get('condition'),
      threshold: Number(formData.get('threshold')),
      action: formData.get('action'),
      actionParams: { amount: 50 } // Default for add_margin
    };

    try {
      const res = await fetch('/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        addRule({
          id: result.id,
          ...data,
          isActive: true,
          createdAt: new Date().toISOString()
        } as any);
        (e.target as HTMLFormElement).reset();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-[11px] font-mono text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Add Guardrail</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase font-mono text-[var(--text-secondary)]">Market</Label>
          <Select name="marketId" defaultValue="*">
            <SelectTrigger className="bg-[var(--bg-input)] border-[var(--border-subtle)] text-xs h-9">
              <SelectValue placeholder="Select Market" />
            </SelectTrigger>
            <SelectContent className="bg-[var(--bg-surface)] border-[var(--border-strong)]">
              <SelectItem value="*">All Positions</SelectItem>
              {positions.map(p => (
                <SelectItem key={p.marketId} value={p.marketId}>{p.marketName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase font-mono text-[var(--text-secondary)]">Condition</Label>
          <Select name="condition" defaultValue="health_below">
            <SelectTrigger className="bg-[var(--bg-input)] border-[var(--border-subtle)] text-xs h-9">
              <SelectValue placeholder="Select Condition" />
            </SelectTrigger>
            <SelectContent className="bg-[var(--bg-surface)] border-[var(--border-strong)]">
              <SelectItem value="health_below">Health drops below</SelectItem>
              <SelectItem value="funding_rate_above">Funding rate above (%)</SelectItem>
              <SelectItem value="unrealized_pnl_below">PnL drops below ($)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase font-mono text-[var(--text-secondary)]">Threshold</Label>
          <Input 
            name="threshold" 
            type="number" 
            step="0.01"
            placeholder="0.00" 
            className="bg-[var(--bg-input)] border-[var(--border-subtle)] text-xs h-9 font-mono"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase font-mono text-[var(--text-secondary)]">Action</Label>
          <Select name="action" defaultValue="alert_only">
            <SelectTrigger className="bg-[var(--bg-input)] border-[var(--border-subtle)] text-xs h-9">
              <SelectValue placeholder="Select Action" />
            </SelectTrigger>
            <SelectContent className="bg-[var(--bg-surface)] border-[var(--border-strong)]">
              <SelectItem value="alert_only">Alert Only</SelectItem>
              <SelectItem value="add_margin">Add Margin ($50)</SelectItem>
              <SelectItem value="close_position">Close Position</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[11px] font-bold h-9 uppercase tracking-wider"
        >
          {loading ? 'Creating...' : 'Add Rule'}
        </Button>
      </form>
    </div>
  );
}
