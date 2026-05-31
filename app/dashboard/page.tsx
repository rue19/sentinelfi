import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { getGuardianState } from '@/lib/guardian-loop';
import db from '@/lib/db';
import { Position, Alert, GuardRail } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const state = getGuardianState();
  
  // Try to load historical data if wallet is known (though in this demo it usually starts empty)
  let initialAlerts: Alert[] = state.alerts;
  let initialRules: GuardRail[] = state.rules;

  if (state.walletAddress) {
    const alerts = db.prepare('SELECT * FROM alerts WHERE wallet_address = ? ORDER BY created_at DESC LIMIT 50').all(state.walletAddress) as any[];
    initialAlerts = alerts.map(a => ({
      ...a,
      positionSnapshot: JSON.parse(a.position_snapshot)
    }));

    const rules = db.prepare('SELECT * FROM rules WHERE wallet_address = ?').all(state.walletAddress) as any[];
    initialRules = rules.map(r => ({
      ...r,
      isActive: !!r.is_active,
      actionParams: JSON.parse(r.action_params)
    }));
  }

  return (
    <DashboardShell 
      initialData={{
        positions: state.positions,
        alerts: initialAlerts,
        rules: initialRules,
        isGuardianRunning: state.isRunning,
        walletAddress: state.walletAddress
      }} 
    />
  );
}
