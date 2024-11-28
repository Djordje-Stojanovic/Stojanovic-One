<script lang="ts">
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import { session } from '$lib/stores/sessionStore';
  import { stockForm } from '$lib/stores/stockFormStore';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

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

  export let userStocks: UserStock[] = [];
  export let loading = false;
  export let error: string | null = null;
  export let addingStockId: string | null = null;
  export let filteredStocks: StockMetadata[] = [];

  // Sorting state
  let sortColumn: keyof StockMetadata | null = 'market_cap';
  let sortDirection: 'asc' | 'desc' = 'desc';

  function formatMarketCap(value: number): string {
    if (!value) return 'N/A';
    if (value >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  }

  function getStockListName(stockId: string) {
    const numericStockId = parseInt(stockId);
    const userStock = userStocks.find(stock => {
      const stockMetadataId = typeof stock.stock_metadata_id === 'string' 
        ? parseInt(stock.stock_metadata_id) 
        : stock.stock_metadata_id;
      return stockMetadataId === numericStockId;
    });
    return userStock?.list_name ?? null;
  }

  function handleSort(column: keyof StockMetadata) {
    if (sortColumn === column) {
      // If clicking the same column, toggle direction
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // If clicking a new column, set it with default desc direction
      sortColumn = column;
      sortDirection = 'desc';
    }
  }

  function getSortIcon(column: keyof StockMetadata): string {
    if (sortColumn !== column) return '↕';
    return sortDirection === 'asc' ? '↑' : '↓';
  }

  // Reactive sorting of stocks
  $: sortedStocks = [...filteredStocks].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];

    // Handle null/undefined values
    if (!aVal && !bVal) return 0;
    if (!aVal) return 1;
    if (!bVal) return -1;

    // Special handling for market cap to sort numerically
    if (sortColumn === 'market_cap') {
      return sortDirection === 'asc' 
        ? Number(aVal) - Number(bVal)
        : Number(bVal) - Number(aVal);
    }

    // String comparison for other columns
    const comparison = String(aVal).localeCompare(String(bVal));
    return sortDirection === 'asc' ? comparison : -comparison;
  });

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

      // Then sync with database
      stockForm.reset();
      stockForm.setIdentifier(stock.symbol);
      await stockForm.validateIdentifier($session.access_token);
      const result = await stockForm.submitForm('Watchlist', $session.access_token);
      
      if (!result.success) {
        // Handle specific error codes
        if (result.code === 'DUPLICATE_ENTRY') {
          error = `This stock is already in your Watchlist`;
        } else {
          throw new Error(result.error || 'Failed to add stock');
        }
      } else {
        // Dispatch event to reload user stocks after successful addition
        dispatch('reloadUserStocks');
      }

    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to add stock to watchlist';
    } finally {
      addingStockId = null;
    }
  }
</script>

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
  <div class="overflow-x-auto rounded-[0.375rem] border-2 border-[#4B5563]">
    <table class="w-full">
      <thead class="bg-[#374151] border-b-2 border-[#4B5563]">
        <tr class="text-xs uppercase tracking-wider">
          <th 
            class="text-left py-4 px-4 text-[#60A5FA] font-semibold cursor-pointer hover:text-blue-400"
            on:click={() => handleSort('symbol')}
          >
            Symbol {getSortIcon('symbol')}
          </th>
          <th 
            class="text-left py-4 px-4 text-[#60A5FA] font-semibold border-l border-[#374151] cursor-pointer hover:text-blue-400"
            on:click={() => handleSort('company_name')}
          >
            Company Name {getSortIcon('company_name')}
          </th>
          <th 
            class="text-left py-4 px-4 text-[#60A5FA] font-semibold border-l border-[#374151] cursor-pointer hover:text-blue-400"
            on:click={() => handleSort('sector')}
          >
            Sector {getSortIcon('sector')}
          </th>
          <th 
            class="text-left py-4 px-4 text-[#60A5FA] font-semibold border-l border-[#374151] cursor-pointer hover:text-blue-400"
            on:click={() => handleSort('market_cap')}
          >
            Market Cap {getSortIcon('market_cap')}
          </th>
          <th 
            class="text-left py-4 px-4 text-[#60A5FA] font-semibold border-l border-[#374151] cursor-pointer hover:text-blue-400"
            on:click={() => handleSort('country')}
          >
            Country {getSortIcon('country')}
          </th>
          <th 
            class="text-left py-4 px-4 text-[#60A5FA] font-semibold border-l border-[#374151] cursor-pointer hover:text-blue-400"
            on:click={() => handleSort('exchange')}
          >
            Exchange {getSortIcon('exchange')}
          </th>
          <th class="text-left py-4 px-4 text-[#60A5FA] font-semibold border-l border-[#374151]">Action</th>
        </tr>
      </thead>
      <tbody class="bg-[#1F2937]">
        {#each sortedStocks as stock (stock.id)}
          <tr class="border-b border-[#374151] hover:bg-[#4B5563] transition-colors duration-200">
            <td class="py-4 px-4">
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
                <span class="text-[#F9FAFB] font-medium">{stock.symbol}</span>
              </div>
            </td>
            <td class="py-4 px-4 text-[#F9FAFB] border-l border-[#374151]">{stock.company_name}</td>
            <td class="py-4 px-4 text-[#F9FAFB] border-l border-[#374151]">{stock.sector || 'N/A'}</td>
            <td class="py-4 px-4 text-[#F9FAFB] border-l border-[#374151]">{formatMarketCap(stock.market_cap)}</td>
            <td class="py-4 px-4 text-[#F9FAFB] border-l border-[#374151]">
              {#if stock.country}
                <div class="flex items-center">
                  <span class="fi fi-{stock.country.toLowerCase()}"></span>
                  <span class="ml-2">{stock.country}</span>
                </div>
              {:else}
                <span>N/A</span>
              {/if}
            </td>
            <td class="py-4 px-4 text-[#F9FAFB] border-l border-[#374151]">{stock.exchange}</td>
            <td class="py-4 px-4 border-l border-[#374151]">
              <div class="w-[160px]">
                {#key userStocks}
                  {#if getStockListName(stock.id)}
                    <button
                      class="w-full px-4 py-2 bg-[#374151] text-[#F9FAFB] rounded-[0.375rem] cursor-not-allowed font-medium text-sm"
                      disabled
                      title={`Already in ${getStockListName(stock.id)}`}
                    >
                      In {getStockListName(stock.id)}
                    </button>
                  {:else if addingStockId === stock.id}
                    <button
                      class="w-full px-4 py-2 bg-[#3B82F6] text-white rounded-[0.375rem] cursor-wait font-medium text-sm"
                      disabled
                    >
                      Adding...
                    </button>
                  {:else}
                    <button
                      class="w-full px-4 py-2 bg-[#3B82F6] text-white rounded-[0.375rem] hover:bg-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#1F2937] transition-colors duration-200 font-medium text-sm"
                      on:click={() => addToWatchlist(stock)}
                    >
                      Add to Watchlist
                    </button>
                  {/if}
                {/key}
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
