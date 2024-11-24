<script lang="ts">
  import { onMount } from 'svelte';
  import { db } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import StockPageButton from '$lib/components/StockPageButton.svelte';
  import StockFilters from '$lib/components/stock-lookup/StockFilters.svelte';
  import StockTable from '$lib/components/stock-lookup/StockTable.svelte';
  import { session } from '$lib/stores/sessionStore';

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
      // Create a new array reference to trigger reactivity
      userStocks = data ? [...data] : [];
    } catch (err) {
      console.error('Error loading user stocks:', err);
    }
  }

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
      <StockPageButton onClick={() => goto('/subprojects/investment-analysis-platform')}>
        Go to IAP
      </StockPageButton>
    </div>

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
