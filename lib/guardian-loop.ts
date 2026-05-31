import { Position, GuardianState, SSEMessage, GuardRail, Alert } from './types';
import * as mcpClient from './mcp-client';
import { narratePosition } from './anthropic';
import { evaluateRules } from './rule-engine';
import db from './db';
import { v4 as uuidv4 } from 'uuid';

let interval: NodeJS.Timeout | null = null;
let walletAddress: string | null = null;
let currentState: GuardianState = {
  isRunning: false,
  walletAddress: null,
  positions: [],
  alerts: [],
  rules: [],
  lastPollAt: null,
  narrations: {},
};

const sseClients = new Set<ReadableStreamDefaultController>();

export function addSSEClient(controller: ReadableStreamDefaultController) {
  sseClients.add(controller);
}

export function removeSSEClient(controller: ReadableStreamDefaultController) {
  sseClients.delete(controller);
}

function broadcast(message: SSEMessage) {
  const encoder = new TextEncoder();
  const data = `data: ${JSON.stringify(message)}\n\n`;
  const encoded = encoder.encode(data);
  
  sseClients.forEach(controller => {
    try {
      controller.enqueue(encoded);
    } catch (e) {
      sseClients.delete(controller);
    }
  });
}

export function startGuardian(address: string) {
  if (interval) return;
  
  walletAddress = address;
  currentState.isRunning = true;
  currentState.walletAddress = address;
  
  // Load rules from DB
  const rules = db.prepare('SELECT * FROM rules WHERE wallet_address = ?').all(address) as any[];
  currentState.rules = rules.map(r => ({
    ...r,
    isActive: !!r.is_active,
    actionParams: JSON.parse(r.action_params)
  }));

  const pollInterval = Number(process.env.GUARDIAN_POLL_INTERVAL_MS) || 15000;
  
  interval = setInterval(tick, pollInterval);
  tick(); // Initial tick
}

export function stopGuardian() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
  currentState.isRunning = false;
  broadcast({
    type: 'guardian_status',
    data: { isRunning: false },
    timestamp: new Date().toISOString()
  });
}

export function isGuardianRunning() {
  return currentState.isRunning;
}

export function getGuardianState() {
  return currentState;
}

async function tick() {
  if (!walletAddress) return;

  try {
    const rawPositions = await mcpClient.getPositions(walletAddress);
    
    const positions: Position[] = rawPositions.map(p => {
      const healthScore = Math.round(p.marginRatio * 100);
      let healthStatus: Position['healthStatus'] = 'safe';
      if (healthScore <= 25) healthStatus = 'critical';
      else if (healthScore <= 50) healthStatus = 'danger';
      else if (healthScore <= 70) healthStatus = 'warning';

      return {
        ...p,
        healthScore,
        healthStatus,
        updatedAt: new Date().toISOString(),
      };
    });

    currentState.positions = positions;
    currentState.lastPollAt = new Date().toISOString();

    // AI Narration debouncing
    for (const pos of positions) {
      const cached = db.prepare('SELECT narration, updated_at FROM positions_cache WHERE market_id = ? AND wallet_address = ?')
        .get(pos.marketId, walletAddress) as any;
      
      const needsNarration = !cached || 
        Math.abs(pos.healthScore - (JSON.parse(cached.snapshot || '{}').healthScore || 0)) > 5;

      if (needsNarration) {
        narratePosition(pos).then(text => {
          currentState.narrations[pos.marketId] = text;
          db.prepare('INSERT OR REPLACE INTO positions_cache (wallet_address, market_id, snapshot, narration, updated_at) VALUES (?, ?, ?, ?, ?)')
            .run(walletAddress, pos.marketId, JSON.stringify(pos), text, new Date().toISOString());
          
          broadcast({
            type: 'narration_update',
            data: { marketId: pos.marketId, narration: text },
            timestamp: new Date().toISOString()
          });
        });
      } else {
        currentState.narrations[pos.marketId] = cached.narration;
      }
    }

    // Evaluate rules
    const triggered = evaluateRules(positions, currentState.rules);
    for (const { rule, position } of triggered) {
      // Execute action
      let actionResult = '';
      if (rule.action === 'close_position') {
        const res = await mcpClient.closePosition(walletAddress, rule.marketId);
        actionResult = `Closed position. TX: ${res.txHash}`;
      } else if (rule.action === 'add_margin') {
        const amount = (rule.actionParams.amount as number) || 50;
        const res = await mcpClient.addMargin(walletAddress, rule.marketId, amount);
        actionResult = `Added $${amount} margin. TX: ${res.txHash}`;
      }

      // Create alert
      const alert: Alert = {
        id: uuidv4(),
        walletAddress,
        marketId: rule.marketId,
        alertType: rule.action === 'alert_only' ? 'rule_triggered' : 'action_executed',
        message: `${rule.condition} threshold reached for ${position.marketName}. ${actionResult}`,
        positionSnapshot: position,
        ruleId: rule.id,
        createdAt: new Date().toISOString(),
      };

      db.prepare('INSERT INTO alerts (id, wallet_address, market_id, alert_type, message, position_snapshot, rule_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .run(alert.id, alert.walletAddress, alert.marketId, alert.alertType, alert.message, JSON.stringify(alert.positionSnapshot), alert.ruleId, alert.createdAt);
      
      db.prepare('UPDATE rules SET last_triggered_at = ? WHERE id = ?').run(alert.createdAt, rule.id);

      currentState.alerts.unshift(alert);
      if (currentState.alerts.length > 50) currentState.alerts.pop();

      broadcast({
        type: 'alert',
        data: alert,
        timestamp: alert.createdAt
      });
    }

    broadcast({
      type: 'positions_update',
      data: positions,
      timestamp: currentState.lastPollAt
    });

  } catch (error) {
    console.error('Guardian Tick Error:', error);
    broadcast({
      type: 'alert',
      data: {
        id: uuidv4(),
        walletAddress,
        marketId: 'SYSTEM',
        alertType: 'error',
        message: `Guardian poll failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        createdAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString()
    });
  }
}
