import { create } from 'zustand';
import { Position, GuardRail, Alert, SSEMessage } from '@/lib/types';

interface SentinelState {
  walletAddress: string | null;
  positions: Position[];
  rules: GuardRail[];
  alerts: Alert[];
  narrations: Record<string, string>;
  isGuardianRunning: boolean;
  isConnected: boolean;
  lastPollAt: string | null;
  selectedMarketId: string | null;
  
  setWalletAddress: (address: string | null) => void;
  setPositions: (positions: Position[]) => void;
  setRules: (rules: GuardRail[]) => void;
  addRule: (rule: GuardRail) => void;
  removeRule: (id: string) => void;
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  setNarration: (marketId: string, text: string) => void;
  setGuardianRunning: (running: boolean) => void;
  setSelectedMarket: (marketId: string | null) => void;
  
  connectSSE: () => void;
  disconnectSSE: () => void;
}

let eventSource: EventSource | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
let retryCount = 0;

export const useSentinelStore = create<SentinelState>((set, get) => ({
  walletAddress: null,
  positions: [],
  rules: [],
  alerts: [],
  narrations: {},
  isGuardianRunning: false,
  isConnected: false,
  lastPollAt: null,
  selectedMarketId: null,

  setWalletAddress: (address) => set({ walletAddress: address }),
  setPositions: (positions) => set({ positions }),
  setRules: (rules) => set({ rules }),
  addRule: (rule) => set(state => ({ rules: [...state.rules, rule] })),
  removeRule: (id) => set(state => ({ rules: state.rules.filter(r => r.id !== id) })),
  setAlerts: (alerts) => set({ alerts }),
  addAlert: (alert) => set(state => ({ alerts: [alert, ...state.alerts.slice(0, 49)] })),
  setNarration: (marketId, text) => set(state => ({ 
    narrations: { ...state.narrations, [marketId]: text } 
  })),
  setGuardianRunning: (running) => set({ isGuardianRunning: running }),
  setSelectedMarket: (marketId) => set({ selectedMarketId: marketId }),

  connectSSE: () => {
    if (eventSource) return;

    const connect = () => {
      eventSource = new EventSource('/api/stream');
      
      eventSource.onopen = () => {
        set({ isConnected: true });
        retryCount = 0;
      };

      eventSource.onmessage = (event) => {
        const message: SSEMessage = JSON.parse(event.data);
        const { type, data, timestamp } = message;

        set({ lastPollAt: timestamp });

        switch (type) {
          case 'positions_update':
            set({ positions: data as Position[] });
            break;
          case 'alert':
            get().addAlert(data as Alert);
            break;
          case 'guardian_status':
            set({ isGuardianRunning: (data as { isRunning: boolean }).isRunning });
            break;
          case 'narration_update':
            const { marketId, narration } = data as { marketId: string, narration: string };
            get().setNarration(marketId, narration);
            break;
        }
      };

      eventSource.onerror = (err) => {
        console.error('SSE Error:', err);
        set({ isConnected: false });
        eventSource?.close();
        eventSource = null;

        if (retryCount < 5) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
          reconnectTimeout = setTimeout(() => {
            retryCount++;
            connect();
          }, delay);
        }
      };
    };

    connect();
  },

  disconnectSSE: () => {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
    set({ isConnected: false });
  }
}));
