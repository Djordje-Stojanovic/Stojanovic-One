import type { Session } from '@supabase/supabase-js';
import { loadFinancialData } from './companyFinancialsService';
import type { StockMetadata } from '$lib/components/stock-lookup/Types';

const INITIAL_COUNTDOWN = 10;
const API_CALLS_PER_STOCK = 11;  // 1 profile + 6 financial statements + 4 revenue segments
const MAX_API_CALLS_PER_MINUTE = 220;
const STOCKS_PER_MINUTE = Math.floor(MAX_API_CALLS_PER_MINUTE / API_CALLS_PER_STOCK); // ~18 stocks per minute
const MINUTE_MS = 60000;

export interface SyncState {
  syncing: boolean;
  syncProgress: number;
  currentStock: string;
  syncErrors: string[];
  apiCallCount: number;
  shouldStop: boolean;
  countdownSeconds: number;
  minuteTimer: NodeJS.Timeout | null;
  statusMessage: string;
  cycleStartTime: number;
  cycleTimeRemaining: number;
}

let state: SyncState = {
  syncing: false,
  syncProgress: 0,
  currentStock: '',
  syncErrors: [],
  apiCallCount: 0,
  shouldStop: false,
  countdownSeconds: 0,
  minuteTimer: null,
  statusMessage: '',
  cycleStartTime: 0,
  cycleTimeRemaining: 0
};

function updateSyncProgress(processed: number, total: number, symbol: string) {
  state.syncProgress = Math.round((processed / total) * 100);
  state.currentStock = symbol;
}

function startMinuteTimer() {
  state.apiCallCount = 0;
  state.cycleStartTime = Date.now();
  state.minuteTimer = setTimeout(() => {
    state.apiCallCount = 0;
    startMinuteTimer();
  }, MINUTE_MS);
}

function updateCycleTime() {
  if (state.cycleStartTime === 0) return;
  const elapsed = Date.now() - state.cycleStartTime;
  state.cycleTimeRemaining = Math.max(0, MINUTE_MS - elapsed);
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function syncAllStocks(
  stocks: StockMetadata[], 
  session: Session | null, 
  onStateChange: (state: SyncState) => void
) {
  if (state.syncing || !session?.access_token) return;
  
  state = {
    ...state,
    syncing: true,
    syncProgress: 0,
    syncErrors: [],
    currentStock: '',
    shouldStop: false,
    apiCallCount: 0,
    countdownSeconds: INITIAL_COUNTDOWN,
    statusMessage: `Starting in ${INITIAL_COUNTDOWN}s...`,
    cycleStartTime: 0,
    cycleTimeRemaining: 0
  };
  onStateChange(state);
  
  const countdownInterval = setInterval(() => {
    state.countdownSeconds--;
    state.statusMessage = `Starting in ${state.countdownSeconds}s...`;
    onStateChange(state);
    
    if (state.countdownSeconds <= 0) {
      clearInterval(countdownInterval);
      void startSync(stocks, session.access_token, onStateChange);
    }
  }, 1000);
}

async function startSync(
  stocks: StockMetadata[], 
  token: string, 
  onStateChange: (state: SyncState) => void
) {
  try {
    startMinuteTimer();
    state.statusMessage = 'Syncing...';
    onStateChange(state);

    // Start cycle time update interval
    const cycleInterval = setInterval(() => {
      updateCycleTime();
      onStateChange(state);
    }, 1000);

    for (let i = 0; i < stocks.length; i++) {
      if (state.shouldStop) {
        state.statusMessage = 'Sync stopped by user';
        onStateChange(state);
        break;
      }

      const stock = stocks[i];
      state.currentStock = stock.symbol;
      onStateChange(state);

      if (state.apiCallCount >= STOCKS_PER_MINUTE * API_CALLS_PER_STOCK) {
        const waitTime = state.cycleTimeRemaining;
        state.statusMessage = `Rate limit reached (${state.apiCallCount}/220 calls), waiting ${Math.ceil(waitTime / 1000)}s for next cycle...`;
        onStateChange(state);
        await delay(waitTime);
        state.apiCallCount = 0;
        startMinuteTimer(); // Start new cycle
      }
      
      try {
        await loadFinancialData(stock.symbol, token, true);
        state.apiCallCount += API_CALLS_PER_STOCK;
        updateSyncProgress(i + 1, stocks.length, stock.symbol);
        
        const remainingStocks = stocks.length - (i + 1);
        const remainingMinutes = Math.ceil(remainingStocks / STOCKS_PER_MINUTE);
        const cycleSeconds = Math.ceil(state.cycleTimeRemaining / 1000);
        state.statusMessage = `Synced ${i + 1}/${stocks.length} stocks (${state.apiCallCount}/220 API calls, ${cycleSeconds}s until next cycle, ~${remainingMinutes}min remaining)`;
        onStateChange(state);
      } catch (err) {
        console.error(`Error syncing ${stock.symbol}:`, err);
        state.syncErrors.push(`${stock.symbol}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        onStateChange(state);
        
        if (err instanceof Error && err.message.includes('Too Many Requests')) {
          const waitTime = state.cycleTimeRemaining;
          state.statusMessage = `Rate limit hit, waiting ${Math.ceil(waitTime / 1000)}s for next cycle...`;
          onStateChange(state);
          await delay(waitTime);
          state.apiCallCount = 0;
          startMinuteTimer(); // Start new cycle
          i--; // Retry this stock
          continue;
        }
      }

      await delay(100);
    }

    clearInterval(cycleInterval);
  } finally {
    if (state.minuteTimer) clearTimeout(state.minuteTimer);
    state.syncing = false;
    state.statusMessage = state.shouldStop ? 'Sync stopped by user' : 'Sync complete';
    onStateChange(state);
    
    setTimeout(() => {
      state.statusMessage = '';
      onStateChange(state);
    }, 3000);
  }
}

export function stopSync() {
  state.shouldStop = true;
  if (state.minuteTimer) clearTimeout(state.minuteTimer);
}

export function cleanup() {
  if (state.minuteTimer) clearTimeout(state.minuteTimer);
}
