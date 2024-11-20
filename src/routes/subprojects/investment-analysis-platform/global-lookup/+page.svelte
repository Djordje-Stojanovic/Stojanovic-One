<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import StockPageButton from '$lib/components/StockPageButton.svelte';
  import CountrySelect from '$lib/components/CountrySelect.svelte';
  import { session } from '$lib/stores/sessionStore';
  import { stockForm } from '$lib/stores/stockFormStore';
  import { listNames, type ListName } from '$lib/constants/listNames';

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
    stock_metadata_id: number;
    list_name: ListName;
  }

  type MarketCapCategory = 'Micro' | 'Small' | 'Mid' | 'Large' | 'Mega' | '';

  const marketCapRanges = {
    Micro: { max: 2_000_000_000 },
    Small: { min: 2_000_000_000, max: 10_000_000_000 },
    Mid: { min: 10_000_000_000, max: 50_000_000_000 },
    Large: { min: 50_000_000_000, max: 500_000_000_000 },
    Mega: { min: 500_000_000_000 }
  };

  let stocks: StockMetadata[] = [];
  let userStocks: UserStock[] = [];
  let loading = true;
  let error: string | null = null;
  let searchQuery = '';
  let sortColumn: keyof StockMetadata = 'market_cap';
  let sortDirection = -1;
  let sectorFilter = '';
  let exchangeFilter = '';
  let marketCapFilter: MarketCapCategory = '';
  let countryFilter = '';
  let addingStockId: string | null = null;

  // Get unique values for filters
  $: sectors = [...new Set(stocks.map(stock => stock.sector).filter(Boolean))].sort();
  $: exchanges = [...new Set(stocks.map(stock => stock.exchange).filter(Boolean))].sort();
  $: countries = [...new Set(stocks.map(stock => stock.country).filter(Boolean))].sort();

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
      const { data, error: loadError } = await supabase
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
      const { data, error: loadError } = await supabase
        .from('user_stocks')
        .select('stock_metadata_id, list_name')
        .eq('user_id', $session.user.id);

      if (loadError) throw loadError;
      userStocks = data ?? [];
    } catch (err) {
      console.error('Error loading user stocks:', err);
    }
  }

  function getStockListName(stockId: string): ListName | null {
    const userStock = userStocks.find(stock => stock.stock_metadata_id === parseInt(stockId));
    return userStock?.list_name ?? null;
  }

  async function addToWatchlist(stock: StockMetadata) {
    if (!$session?.access_token) {
      error = 'Please log in to add stocks to your watchlist';
      return;
    }

    const existingList = getStockListName(stock.id);
    if (existingList) {
      error = `This stock is already in your ${existingList} list`;
      return;
    }

    try {
      error = null;
      addingStockId = stock.id;

      // Optimistically update UI
      userStocks = [...userStocks, {
        stock_metadata_id: parseInt(stock.id),
        list_name: 'Watchlist'
      }];

      // Then sync with database
      stockForm.reset();
      stockForm.setIdentifier(stock.symbol);
      await stockForm.validateIdentifier($session.access_token);
      const stockId = await stockForm.submitForm('Watchlist', $session.access_token);
      
      if (!stockId) {
        // Revert optimistic update on failure
        userStocks = userStocks.filter(s => s.stock_metadata_id !== parseInt(stock.id));
        throw new Error('Failed to add stock');
      }

    } catch (err) {
      // Revert optimistic update and show error
      userStocks = userStocks.filter(s => s.stock_metadata_id !== parseInt(stock.id));
      error = err instanceof Error ? err.message : 'Failed to add stock to watchlist';
    } finally {
      addingStockId = null;
    }
  }

  onMount(() => {
    loadStocks();
    loadUserStocks();
  });

  function formatMarketCap(value: number): string {
    if (!value) return 'N/A';
    if (value >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
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
</script>

<div class="min-h-screen bg-[#1F2937]">
  <div class="container mx-auto px-4 py-8">
    <StockPageButton onClick={() => goto('/subprojects/investment-analysis-platform')} class="mb-6">
      Go to IAP
    </StockPageButton>

    <h1 class="text-3xl font-bold text-white mb-8">Global Stock Lookup</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <input
        type="text"
        placeholder="Search by symbol or company name..."
        bind:value={searchQuery}
        class="w-full px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      <select
        bind:value={marketCapFilter}
        class="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Market Caps</option>
        <option value="Mega">Mega Cap (>$500B)</option>
        <option value="Large">Large Cap ($50B-$500B)</option>
        <option value="Mid">Mid Cap ($10B-$50B)</option>
        <option value="Small">Small Cap ($2B-$10B)</option>
        <option value="Micro">Micro Cap (&lt;$2B)</option>
      </select>

      <select
        bind:value={sectorFilter}
        class="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Sectors</option>
        {#each sectors as sector}
          <option value={sector}>{sector}</option>
        {/each}
      </select>
      
      <select
        bind:value={exchangeFilter}
        class="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Exchanges</option>
        {#each exchanges as exchange}
          <option value={exchange}>{exchange}</option>
        {/each}
      </select>

      <CountrySelect bind:value={countryFilter} {countries} />
    </div>

    {#if loading}
      <div class="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    {:else if error}
      <div class="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">
        <p class="font-medium">Error</p>
        <p class="text-sm">{error}</p>
      </div>
    {:else if filteredStocks.length === 0}
      <div class="bg-yellow-900 border border-yellow-700 text-yellow-100 px-4 py-3 rounded">
        <p>No stocks found matching your criteria.</p>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-xs uppercase text-gray-400 border-b border-gray-700">
              <th class="text-left py-3 px-4">Symbol</th>
              <th class="text-left py-3 px-4">Company Name</th>
              <th class="text-left py-3 px-4">Sector</th>
              <th class="text-left py-3 px-4">Market Cap ▼</th>
              <th class="text-left py-3 px-4">Country</th>
              <th class="text-left py-3 px-4">Exchange</th>
              <th class="text-left py-3 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredStocks as stock}
              {@const existingList = getStockListName(stock.id)}
              <tr class="border-b border-gray-700 hover:bg-gray-800">
                <td class="py-3 px-4">
                  <div class="flex items-center space-x-3">
                    {#if stock.logo_url}
                      <img
                        src={stock.logo_url}
                        alt=""
                        class="h-6 w-6"
                        on:error={(e) => {
                          if (e.target instanceof HTMLImageElement) {
                            e.target.style.display = 'none';
                          }
                        }}
                      />
                    {/if}
                    <span class="text-white font-medium">{stock.symbol}</span>
                  </div>
                </td>
                <td class="py-3 px-4 text-gray-300">{stock.company_name}</td>
                <td class="py-3 px-4 text-gray-300">{stock.sector || 'N/A'}</td>
                <td class="py-3 px-4 text-gray-300">{formatMarketCap(stock.market_cap)}</td>
                <td class="py-3 px-4 text-gray-300">
                  {#if stock.country}
                    <div class="flex items-center">
                      <span class="fi fi-{stock.country.toLowerCase()}"></span>
                      <span class="ml-2">{stock.country}</span>
                    </div>
                  {:else}
                    <span>N/A</span>
                  {/if}
                </td>
                <td class="py-3 px-4 text-gray-300">{stock.exchange}</td>
                <td class="py-3 px-4">
                  {#if existingList}
                    <button
                      class="px-4 py-2 bg-gray-600 text-gray-300 rounded cursor-not-allowed"
                      disabled
                      title={`Already in ${existingList}`}
                    >
                      In {existingList}
                    </button>
                  {:else if addingStockId === stock.id}
                    <button
                      class="px-4 py-2 bg-blue-400 text-white rounded cursor-wait"
                      disabled
                    >
                      Adding...
                    </button>
                  {:else}
                    <button
                      class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                      on:click={() => addToWatchlist(stock)}
                    >
                      Add to Watchlist
                    </button>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>
