export type HealthStatus = 'safe' | 'warning' | 'danger' | 'critical';

export interface Position {
  marketId: string;
  marketName: string;          // e.g. "BTC/USDT PERP"
  direction: 'long' | 'short';
  size: number;                // in base currency
  entryPrice: number;
  markPrice: number;
  liquidationPrice: number;
  margin: number;              // USD
  unrealizedPnl: number;       // USD
  unrealizedPnlPercent: number;
  marginRatio: number;         // 0-1, where 0 = liquidated, 1 = fully collateralized
  healthScore: number;         // 0-100 derived from marginRatio
  healthStatus: HealthStatus;
  fundingRate: number;         // hourly rate as decimal
  fundingCostPerHour: number;  // USD per hour
  leverage: number;
  updatedAt: string;           // ISO timestamp
}

export interface GuardRail {
  id: string;
  walletAddress: string;
  marketId: string;
  condition: 'health_below' | 'funding_rate_above' | 'unrealized_pnl_below';
  threshold: number;
  action: 'close_position' | 'add_margin' | 'alert_only';
  actionParams: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
}

export interface Alert {
  id: string;
  walletAddress: string;
  marketId: string;
  alertType: 'rule_triggered' | 'health_warning' | 'action_executed' | 'error';
  message: string;
  positionSnapshot: Position;
  ruleId?: string;
  createdAt: string;
}

export interface GuardianState {
  isRunning: boolean;
  walletAddress: string | null;
  positions: Position[];
  alerts: Alert[];
  rules: GuardRail[];
  lastPollAt: string | null;
  narrations: Record<string, string>;  // marketId -> narration text
}

export interface SSEMessage {
  type: 'positions_update' | 'alert' | 'guardian_status' | 'narration_update';
  data: unknown;
  timestamp: string;
}
