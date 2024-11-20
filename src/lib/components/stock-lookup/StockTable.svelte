<script lang="ts">
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import { session } from '$lib/stores/sessionStore';
  import { stockForm } from '$lib/stores/stockFormStore';

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
    list_name: string;
  }

  export let userStocks: UserStock[] = [];
  export let loading = false;
  export let error: string | null = null;
  export let addingStockId: string | null = null;
  export let filteredStocks: StockMetadata[] = [];

  function formatMarketCap(value: number): string {
    if (!value) return 'N/A';
    if (value >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  }

  function getStockListName(stockId: string) {
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
