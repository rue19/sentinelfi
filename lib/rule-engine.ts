import { Position, GuardRail } from './types';

export function evaluateRules(
  positions: Position[],
  rules: GuardRail[]
): Array<{ rule: GuardRail; position: Position }> {
  const triggered: Array<{ rule: GuardRail; position: Position }> = [];
  const now = new Date();

  for (const rule of rules) {
    if (!rule.isActive) continue;

    // Throttle: don't trigger if triggered in the last 5 minutes
    if (rule.lastTriggeredAt) {
      const lastTriggered = new Date(rule.lastTriggeredAt);
      if (now.getTime() - lastTriggered.getTime() < 5 * 60 * 1000) {
        continue;
      }
    }

    const position = positions.find(p => 
      rule.marketId === '*' || p.marketId === rule.marketId
    );

    if (position && conditionMet(rule, position)) {
      triggered.push({ rule, position });
    }
  }

  return triggered;
}

function conditionMet(rule: GuardRail, position: Position): boolean {
  switch (rule.condition) {
    case 'health_below':
      return position.healthScore < rule.threshold;
    case 'funding_rate_above':
      // annualized funding rate: hourly * 24 * 365
      return Math.abs(position.fundingRate) * 24 * 365 * 100 > rule.threshold;
    case 'unrealized_pnl_below':
      return position.unrealizedPnl < rule.threshold;
    default:
      return false;
  }
}
