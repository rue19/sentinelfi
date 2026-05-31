import Anthropic from '@anthropic-ai/sdk';
import { Position } from './types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function narratePosition(position: Position): Promise<string> {
  const prompt = buildNarrationPrompt(position);
  
  if (process.env.DEMO_MODE === 'true' && !process.env.ANTHROPIC_API_KEY) {
    // Mock narration for demo if no API key
    const healthDesc = position.healthStatus === 'safe' ? 'stable' : position.healthStatus === 'warning' ? 'under stress' : 'at high risk';
    return `${position.marketName} ${position.direction} is ${healthDesc} at ${position.healthScore}% health. Mark price is $${position.markPrice.toLocaleString()}, which is $${Math.abs(position.markPrice - position.entryPrice).toFixed(2)} from entry. Liquidation at $${position.liquidationPrice.toLocaleString()} is the primary threat.`;
  }

  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20240620', // Using current stable sonnet
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }],
    system: `You are SentinelFi's risk analyst. You explain DeFi position health in plain English.
Be direct, specific with numbers, and slightly urgent when things are dangerous.
Keep responses to 2-3 sentences max. No bullet points. No markdown. Just plain text.
Never say "I" or "you should". State facts and risk levels directly.
Example good output: "BTC long is at 34% health — mark price has fallen 3.8% from entry to $58,900. Liquidation triggers at $55,400, which is only $3,500 away. Funding costs are bleeding $0.29/hr."`,
  });

  return (response.content[0] as { type: 'text'; text: string }).text;
}

function buildNarrationPrompt(p: Position): string {
  const distanceToLiq = Math.abs(p.markPrice - p.liquidationPrice);
  const distancePercent = ((distanceToLiq / p.markPrice) * 100).toFixed(1);
  
  return `Narrate this position's risk:
Market: ${p.marketName}
Direction: ${p.direction.toUpperCase()}
Health score: ${p.healthScore}/100 (${p.healthStatus})
Entry: $${p.entryPrice.toLocaleString()} | Mark: $${p.markPrice.toLocaleString()} | Liquidation: $${p.liquidationPrice.toLocaleString()}
Distance to liquidation: $${distanceToLiq.toLocaleString()} (${distancePercent}%)
Unrealized PnL: ${p.unrealizedPnl >= 0 ? '+' : ''}$${p.unrealizedPnl.toFixed(2)} (${p.unrealizedPnlPercent.toFixed(2)}%)
Funding cost: $${p.fundingCostPerHour.toFixed(3)}/hr
Leverage: ${p.leverage}x`;
}
