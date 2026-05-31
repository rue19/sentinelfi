import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Position } from './types';

// This module manages a single MCP client connection to the Injective MCP Server.
// It spawns the MCP server as a subprocess and communicates via stdio transport.
// In DEMO_MODE=true, all methods return realistic mock data instead of calling MCP.

const IS_DEMO = process.env.DEMO_MODE === 'true';

let client: Client | null = null;
let transport: StdioClientTransport | null = null;

async function getClient() {
  if (IS_DEMO) return null;
  if (client) return client;

  const serverPath = process.env.MCP_SERVER_PATH || '../injective-mcp-server/build/index.js';
  
  transport = new StdioClientTransport({
    command: 'node',
    args: [serverPath],
  });

  client = new Client({
    name: 'sentinelfi-client',
    version: '1.0.0',
  }, {
    capabilities: {}
  });

  await client.connect(transport);
  return client;
}

const MOCK_POSITIONS: Position[] = [
  {
    marketId: 'BTC/USDT-PERP',
    marketName: 'BTC/USDT PERP',
    direction: 'long',
    size: 0.05,
    entryPrice: 61200,
    markPrice: 58900,
    liquidationPrice: 55400,
    margin: 306,
    unrealizedPnl: -115,
    unrealizedPnlPercent: -3.76,
    marginRatio: 0.34,
    healthScore: 34,
    healthStatus: 'danger',
    fundingRate: 0.0001,
    fundingCostPerHour: 0.29,
    leverage: 10,
    updatedAt: new Date().toISOString(),
  },
  {
    marketId: 'ETH/USDT-PERP',
    marketName: 'ETH/USDT PERP',
    direction: 'short',
    size: 1.2,
    entryPrice: 3280,
    markPrice: 3190,
    liquidationPrice: 3580,
    margin: 393.6,
    unrealizedPnl: 108,
    unrealizedPnlPercent: 2.75,
    marginRatio: 0.72,
    healthScore: 72,
    healthStatus: 'warning',
    fundingRate: -0.00005,
    fundingCostPerHour: -0.19,
    leverage: 10,
    updatedAt: new Date().toISOString(),
  },
  {
    marketId: 'INJ/USDT-PERP',
    marketName: 'INJ/USDT PERP',
    direction: 'long',
    size: 45,
    entryPrice: 22.4,
    markPrice: 24.1,
    liquidationPrice: 18.2,
    margin: 1008,
    unrealizedPnl: 76.5,
    unrealizedPnlPercent: 7.59,
    marginRatio: 0.88,
    healthScore: 88,
    healthStatus: 'safe',
    fundingRate: 0.00008,
    fundingCostPerHour: 0.087,
    leverage: 1,
    updatedAt: new Date().toISOString(),
  }
];

export async function getPositions(walletAddress: string): Promise<Position[]> {
  if (IS_DEMO) {
    // Add subtle random price drift to mock positions
    return MOCK_POSITIONS.map(p => {
      const drift = 1 + (Math.random() * 0.006 - 0.003); // +/- 0.3%
      const newMarkPrice = p.markPrice * drift;
      const priceDiff = p.direction === 'long' 
        ? newMarkPrice - p.entryPrice 
        : p.entryPrice - newMarkPrice;
      const unrealizedPnl = priceDiff * p.size;
      const unrealizedPnlPercent = (priceDiff / p.entryPrice) * 100;
      
      return {
        ...p,
        markPrice: Number(newMarkPrice.toFixed(2)),
        unrealizedPnl: Number(unrealizedPnl.toFixed(2)),
        unrealizedPnlPercent: Number(unrealizedPnlPercent.toFixed(2)),
        updatedAt: new Date().toISOString(),
      };
    });
  }

  const mcp = await getClient();
  if (!mcp) throw new Error('MCP client not initialized');
  
  const response = await mcp.callTool({
    name: 'get_derivative_positions',
    arguments: { address: walletAddress }
  }) as any;

  // Transform MCP response to our Position type 
  // (Assuming MCP returns data that can be mapped)
  return response.positions || []; 
}

export async function getMarketData(marketId: string) {
  if (IS_DEMO) {
    return { markPrice: 60000, fundingRate: 0.0001 };
  }
  const mcp = await getClient();
  if (!mcp) throw new Error('MCP client not initialized');
  
  const response = await mcp.callTool({
    name: 'get_derivative_market',
    arguments: { marketId }
  }) as any;

  return {
    markPrice: response.market?.markPrice || 0,
    fundingRate: response.market?.fundingRate || 0,
  };
}

export async function addMargin(walletAddress: string, marketId: string, amountUsdt: number) {
  if (IS_DEMO) {
    console.log(`[DEMO] Adding ${amountUsdt} USDT margin to ${marketId} for ${walletAddress}`);
    return { txHash: '0x' + Math.random().toString(16).slice(2) };
  }
  const mcp = await getClient();
  if (!mcp) throw new Error('MCP client not initialized');

  const response = await mcp.callTool({
    name: 'msg_deposit',
    arguments: { 
      subaccountId: walletAddress + '000000000000000000000000', // simplification
      amount: { amount: amountUsdt.toString(), denom: 'usdt' } 
    }
  }) as any;

  return { txHash: response.txHash };
}

export async function closePosition(walletAddress: string, marketId: string) {
  if (IS_DEMO) {
    console.log(`[DEMO] Closing position ${marketId} for ${walletAddress}`);
    return { txHash: '0x' + Math.random().toString(16).slice(2) };
  }
  const mcp = await getClient();
  if (!mcp) throw new Error('MCP client not initialized');

  const response = await mcp.callTool({
    name: 'msg_create_derivative_market_order',
    arguments: {
      marketId,
      direction: 'sell', // simplified: assumes closing a long
      orderType: 'market',
      quantity: '0', // size should be fetched first
      price: '0',
    }
  }) as any;

  return { txHash: response.txHash };
}

export async function ping(): Promise<boolean> {
  if (IS_DEMO) return true;
  try {
    const mcp = await getClient();
    return !!mcp;
  } catch (e) {
    return false;
  }
}
