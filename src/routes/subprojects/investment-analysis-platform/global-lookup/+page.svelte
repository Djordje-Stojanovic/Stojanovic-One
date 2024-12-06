<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { db } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import { session } from '$lib/stores/sessionStore';
  import StockPageButton from '$lib/components/StockPageButton.svelte';
  import StockFilters from '$lib/components/stock-lookup/StockFilters.svelte';
  import StockTable from '$lib/components/stock-lookup/StockTable.svelte';
  import SyncProgress from '$lib/components/stock-lookup/SyncProgress.svelte';
  import { syncAllStocks, stopSync, cleanup, type SyncState } from '$lib/services/stockSyncService';
  import { filterStocks } from '$lib/utils/stockFilters';
  import type { StockMetadata, UserStock, MarketCapCategory } from '$lib/components/stock-lookup/Types';
  import type { ListName } from '$lib/constants/listNames';

  // State
  let stocks: StockMetadata[] = [];
  let userStocks: UserStock[] = [];
  let loading = true;
  let error: string | null = null;
  let addingStockId: string | null = null;

  // Filter state
  let searchQuery = '';
  let sortColumn: keyof StockMetadata = 'market_cap';
  let sortDirection = -1;
  let sectorFilter = '';
  let exchangeFilter = '';
  let marketCapFilter: MarketCapCategory = '';
  let countryFilter = '';
  let listFilter: ListName | '' = '';

  // Sync state
  let syncing = false;
  let syncProgress = 0;
  let currentStock = '';
  let syncErrors: string[] = [];
  let countdownSeconds = 0;
  let statusMessage = '';
  let cycleTimeRemaining = 0;
  let apiCallCount = 0;

  // Derived values for filters
  $: sectors = [...new Set(stocks.map(stock => stock.sector).filter(Boolean))].sort();
  $: exchanges = [...new Set(stocks.map(stock => stock.exchange).filter(Boolean))].sort();
  $: countries = [...new Set(stocks.map(stock => stock.country).filter(Boolean))].sort();

  // Filtered stocks
  $: filteredStocks = filterStocks(
    stocks,
    searchQuery,
    sectorFilter,
    exchangeFilter,
    countryFilter,
    marketCapFilter,
    sortColumn,
    sortDirection,
    listFilter,
    userStocks
  );

  // Load user stocks whenever session changes
  $: if ($session?.user?.id) {
    loadUserStocks();
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

  function handleReloadUserStocks() {
    loadUserStocks();
  }

  function handleSyncStateChange(state: SyncState) {
    syncing = state.syncing;
    syncProgress = state.syncProgress;
    currentStock = state.currentStock;
    syncErrors = state.syncErrors;
    countdownSeconds = state.countdownSeconds;
    statusMessage = state.statusMessage;
    cycleTimeRemaining = state.cycleTimeRemaining;
    apiCallCount = state.apiCallCount;
  }

  function startSync() {
    syncAllStocks(stocks, $session, handleSyncStateChange);
  }

  onMount(() => {
    loadStocks();
    if ($session?.user?.id) {
      loadUserStocks();
    }
  });

  onDestroy(() => {
    cleanup();
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
            onClick={startSync} 
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

    <SyncProgress
      {syncing}
      {statusMessage}
      {syncProgress}
      {currentStock}
      {countdownSeconds}
      {syncErrors}
      {cycleTimeRemaining}
      {apiCallCount}
    />

    <StockFilters
      bind:searchQuery
      bind:marketCapFilter
      bind:sectorFilter
      bind:exchangeFilter
      bind:countryFilter
      bind:listFilter
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
