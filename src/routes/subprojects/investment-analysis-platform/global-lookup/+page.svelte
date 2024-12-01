<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { db } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import StockPageButton from '$lib/components/StockPageButton.svelte';
  import StockFilters from '$lib/components/stock-lookup/StockFilters.svelte';
  import StockTable from '$lib/components/stock-lookup/StockTable.svelte';
  import { session } from '$lib/stores/sessionStore';
  import { loadFinancialData } from '$lib/services/companyFinancialsService';

  interface StockMetadata {
    id: string;
    symbol: string;
    company_name: string;
    sector: string;
    market_cap: number;
    exchange: string;
    logo_url: string;
    country: string;
  }

  interface UserStock {
    stock_metadata_id: string | number;
    list_name: string;
  }

  type MarketCapCategory = 'Micro' | 'Small' | 'Mid' | 'Large' | 'Mega' | '';

  const marketCapRanges = {
    Micro: { max: 2_000_000_000 },
    Small: { min: 2_000_000_000, max: 10_000_000_000 },
    Mid: { min: 10_000_000_000, max: 50_000_000_000 },
    Large: { min: 50_000_000_000, max: 500_000_000_000 },
    Mega: { min: 500_000_000_000 }
  } as const;

  // State
  let stocks: StockMetadata[] = [];
  let userStocks: UserStock[] = [];
  let loading = true;
  let error: string | null = null;
  let addingStockId: string | null = null;

  // Sync state
  let syncing = false;
  let syncProgress = 0;
  let totalStocks = 0;
  let currentStock = '';
  let syncErrors: string[] = [];
  let apiCallCount = 0;
  let shouldStop = false;
  let countdownSeconds = 0;
  let minuteTimer: NodeJS.Timeout | null = null;
  let statusMessage = '';

// Constants
const INITIAL_COUNTDOWN = 10;
const API_CALLS_PER_STOCK = 11;  // 1 profile + 6 financial statements + 4 revenue segments
const MAX_API_CALLS_PER_MINUTE = 220;
const STOCKS_PER_MINUTE = Math.floor(MAX_API_CALLS_PER_MINUTE / API_CALLS_PER_STOCK); // ~18 stocks per minute
const MINUTE_MS = 60000;

  // Filter state
  let searchQuery = '';
  let sortColumn: keyof StockMetadata = 'market_cap';
  let sortDirection = -1;
  let sectorFilter = '';
  let exchangeFilter = '';
  let marketCapFilter: MarketCapCategory = '';
  let countryFilter = '';

  // Derived values for filters
  $: sectors = [...new Set(stocks.map(stock => stock.sector).filter(Boolean))].sort();
  $: exchanges = [...new Set(stocks.map(stock => stock.exchange).filter(Boolean))].sort();
  $: countries = [...new Set(stocks.map(stock => stock.country).filter(Boolean))].sort();

  // Load user stocks whenever session changes
  $: if ($session?.user?.id) {
    loadUserStocks();
  }

  function getMarketCapCategory(marketCap: number): MarketCapCategory {
    if (marketCap < marketCapRanges.Micro.max) return 'Micro';
    if (marketCap < marketCapRanges.Small.max) return 'Small';
    if (marketCap < marketCapRanges.Mid.max) return 'Mid';
    if (marketCap < marketCapRanges.Large.max) return 'Large';
    return 'Mega';
  }

  async function loadStocks() {
    loading = true;
    error = null;

    try {
      const { data, error: loadError } = await db
        .from('stock_metadata')
        .select('*')
        .order('market_cap', { ascending: false });

      if (loadError) throw loadError;
      stocks = data ?? [];
    } catch (err: unknown) {
      console.error('Error loading stocks:', err);
      error = err instanceof Error ? err.message : 'An unknown error occurred.';
    } finally {
      loading = false;
    }
  }

  async function loadUserStocks() {
    if (!$session?.user?.id) return;

    try {
      const { data, error: loadError } = await db
        .from('user_stocks')
        .select('stock_metadata_id, list_name')
        .eq('user_id', $session.user.id);

      if (loadError) throw loadError;
      userStocks = data ? [...data] : [];
    } catch (err) {
      console.error('Error loading user stocks:', err);
    }
  }

  function updateSyncProgress(processed: number, total: number, symbol: string) {
    syncProgress = Math.round((processed / total) * 100);
    currentStock = symbol;
  }

  function startMinuteTimer() {
    apiCallCount = 0;
    minuteTimer = setTimeout(() => {
      apiCallCount = 0;
      startMinuteTimer();
    }, MINUTE_MS);
  }

  async function syncAllStocks() {
    if (syncing || !$session?.access_token) return;
    
    syncing = true;
    syncProgress = 0;
    syncErrors = [];
    currentStock = '';
    totalStocks = stocks.length;
    shouldStop = false;
    apiCallCount = 0;
    
    // Initial countdown
    countdownSeconds = INITIAL_COUNTDOWN;
    statusMessage = `Starting in ${countdownSeconds}s...`;
    
    const countdownInterval = setInterval(() => {
      countdownSeconds--;
      statusMessage = `Starting in ${countdownSeconds}s...`;
      if (countdownSeconds <= 0) {
        clearInterval(countdownInterval);
        void startSync();
      }
    }, 1000);
  }

  async function startSync() {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    try {
        const token = $session?.access_token;
        if (!token) {
            statusMessage = 'Session expired';
            return;
        }

        startMinuteTimer();
        statusMessage = 'Syncing...';

        for (let i = 0; i < stocks.length; i++) {
            if (shouldStop) {
                statusMessage = 'Sync stopped by user';
                break;
            }

            const stock = stocks[i];
            currentStock = stock.symbol;

            // Wait if we've processed max stocks for this minute
            if (apiCallCount >= STOCKS_PER_MINUTE * API_CALLS_PER_STOCK) {
                statusMessage = `Rate limit reached (${apiCallCount}/220 calls), waiting for next minute...`;
                await delay(MINUTE_MS);
                apiCallCount = 0;
            }
            
            try {
                await loadFinancialData(stock.symbol, token, true);
                apiCallCount += API_CALLS_PER_STOCK;
                updateSyncProgress(i + 1, stocks.length, stock.symbol);
                const remainingStocks = stocks.length - (i + 1);
                const remainingMinutes = Math.ceil(remainingStocks / STOCKS_PER_MINUTE);
                statusMessage = `Synced ${i + 1}/${stocks.length} stocks (${apiCallCount}/220 API calls this minute, ~${remainingMinutes}min remaining)`;
            } catch (err) {
                console.error(`Error syncing ${stock.symbol}:`, err);
                syncErrors.push(`${stock.symbol}: ${err instanceof Error ? err.message : 'Unknown error'}`);
                
                if (err instanceof Error && err.message.includes('Too Many Requests')) {
                    statusMessage = 'Rate limit hit, waiting for next minute...';
                    await delay(MINUTE_MS);
                    apiCallCount = 0;
                    i--; // Retry this stock
                    continue;
                }
            }

            // Small delay between stocks to prevent hammering the API
            await delay(100);
        }
    } finally {
        if (minuteTimer) clearTimeout(minuteTimer);
        syncing = false;
        statusMessage = shouldStop ? 'Sync stopped by user' : 'Sync complete';
        setTimeout(() => {
            statusMessage = '';
        }, 3000);
    }
  }

  function stopSync() {
    shouldStop = true;
    if (minuteTimer) clearTimeout(minuteTimer);
  }

  onDestroy(() => {
    if (minuteTimer) clearTimeout(minuteTimer);
  });

  function handleReloadUserStocks() {
    loadUserStocks();
  }

  function compareValues(a: string | number | null | undefined, b: string | number | null | undefined, direction: number): number {
    if (a === null || a === undefined) return 1;
    if (b === null || b === undefined) return -1;
    if (typeof a === 'string' && typeof b === 'string') {
      return direction * a.localeCompare(b);
    }
    if (typeof a === 'number' && typeof b === 'number') {
      return direction * (a - b);
    }
    return 0;
  }

  $: filteredStocks = stocks
    .filter((stock) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        stock.symbol.toLowerCase().includes(query) ||
        stock.company_name.toLowerCase().includes(query);
      const matchesSector = !sectorFilter || stock.sector === sectorFilter;
      const matchesExchange = !exchangeFilter || stock.exchange === exchangeFilter;
      const matchesCountry = !countryFilter || stock.country === countryFilter;
      const matchesMarketCap = !marketCapFilter || getMarketCapCategory(stock.market_cap) === marketCapFilter;
      return matchesSearch && matchesSector && matchesExchange && matchesCountry && matchesMarketCap;
    })
    .sort((a, b) => compareValues(a[sortColumn], b[sortColumn], sortDirection));

  onMount(() => {
    loadStocks();
    if ($session?.user?.id) {
      loadUserStocks();
    }
  });
</script>

<div class="min-h-screen bg-[#1F2937]">
  <div class="container mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold text-[#F9FAFB]">Global Stock Lookup</h1>
      <div class="flex items-center gap-4">
        <StockPageButton onClick={() => goto('/subprojects/investment-analysis-platform')}>
          Go to IAP
        </StockPageButton>
        {#if !syncing}
          <StockPageButton 
            onClick={syncAllStocks} 
            disabled={!$session}
            variant="primary"
            class="min-w-[200px] font-bold"
          >
            <span class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
              </svg>
              Sync All Stocks
            </span>
          </StockPageButton>
        {:else}
          <StockPageButton 
            onClick={stopSync}
            variant="danger"
            class="min-w-[200px] font-bold"
          >
            Stop Sync
          </StockPageButton>
        {/if}
      </div>
    </div>

    {#if syncing || statusMessage}
      <div class="mb-6 p-4 bg-blue-900 rounded-lg">
        <div class="flex items-center justify-between mb-2">
          <span class="text-blue-200">
            {#if countdownSeconds > 0}
              {statusMessage}
            {:else}
              {currentStock ? `Syncing ${currentStock}` : ''} 
              {statusMessage}
            {/if}
          </span>
        </div>
        <div class="w-full bg-blue-950 rounded-full h-4">
          <div 
            class="bg-blue-500 h-4 rounded-full transition-all duration-300"
            style="width: {syncProgress}%"
          ></div>
        </div>
        {#if syncErrors.length > 0}
          <div class="mt-2 text-red-400 text-sm">
            Failed: {syncErrors.join(', ')}
          </div>
        {/if}
      </div>
    {/if}

    <StockFilters
      bind:searchQuery
      bind:marketCapFilter
      bind:sectorFilter
      bind:exchangeFilter
      bind:countryFilter
      {sectors}
      {exchanges}
      {countries}
    />

    <StockTable
      {userStocks}
      {loading}
      bind:error
      bind:addingStockId
      {filteredStocks}
      on:reloadUserStocks={handleReloadUserStocks}
    />
  </div>
</div>