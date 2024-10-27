<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  interface StockMetadata {
    id: string;
    symbol: string;
    company_name: string;
    sector: string;
    market_cap: number;
    exchange: string;
    parqet_logo_url: string;
    logo_url: string;
  }

  let stocks: StockMetadata[] = [];
  let loading = true;
  let error: string | null = null;
  let searchQuery = '';
  let sortColumn: keyof StockMetadata = 'symbol';
  let sortDirection = 1; // 1 for ascending, -1 for descending

  async function loadStocks() {
    loading = true;
    error = null;

    try {
      const { data, error: loadError } = await supabase
        .from('stock_metadata')
        .select('*');

      if (loadError) {
        throw loadError;
      }

      stocks = data ?? [];
    } catch (err: unknown) {
      console.error('Error loading stocks:', err);
      error = err instanceof Error ? err.message : 'An unknown error occurred.';
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadStocks();
  });

  function handleSort(column: keyof StockMetadata) {
    if (sortColumn === column) {
      sortDirection *= -1;
    } else {
      sortColumn = column;
      sortDirection = 1;
    }
  }

  $: filteredStocks = stocks
    .filter((stock) => {
      const query = searchQuery.toLowerCase();
      return (
        stock.symbol.toLowerCase().includes(query) ||
        stock.company_name.toLowerCase().includes(query) ||
        stock.sector?.toLowerCase().includes(query) ||
        stock.exchange?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      const aValue = a[sortColumn] ?? '';
      const bValue = b[sortColumn] ?? '';
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection * aValue.localeCompare(bValue);
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection * (aValue - bValue);
      }
      return 0;
    });

  function viewDetails(stock: StockMetadata) {
    goto(`/subprojects/investment-analysis-platform/company/${encodeURIComponent(stock.symbol)}`);
  }

  function viewFinancials(stock: StockMetadata) {
    goto(`/subprojects/investment-analysis-platform/company/${encodeURIComponent(stock.symbol)}/financials`);
  }
</script>

<svelte:head>
  <title>Global Stock Lookup - Investment Analysis Platform</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
  <div class="container mx-auto px-4 py-8">
    <h1 class="mb-6 text-4xl font-bold text-gray-800 dark:text-gray-100">Global Stock Lookup</h1>
    <div class="mb-6 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <input
        type="text"
        placeholder="Search stocks..."
        bind:value={searchQuery}
        class="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:focus:border-primary-400 dark:focus:ring-primary-400"
      />
    </div>
    {#if loading}
      <div class="flex justify-center">
        <LoadingSpinner />
      </div>
    {:else if error}
      <div class="rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900 dark:text-red-100">
        <p>{error}</p>
      </div>
    {:else}
      <div class="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
        <div class="overflow-x-auto">
          <table class="w-full min-w-max text-left text-sm text-gray-700 dark:text-gray-200">
            <thead>
              <tr class="bg-gray-50 text-xs uppercase leading-normal text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                <th class="cursor-pointer py-3 px-6" on:click={() => handleSort('symbol')}>
                  <div class="flex items-center">
                    Symbol
                    {#if sortColumn === 'symbol'}
                      <svg class="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        {#if sortDirection === 1}
                          <path d="M5 15l5-5 5 5H5z" />
                        {:else}
                          <path d="M5 10l5 5 5-5H5z" />
                        {/if}
                      </svg>
                    {/if}
                  </div>
                </th>
                <th class="cursor-pointer py-3 px-6" on:click={() => handleSort('company_name')}>
                  <div class="flex items-center">
                    Company Name
                    {#if sortColumn === 'company_name'}
                      <svg class="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        {#if sortDirection === 1}
                          <path d="M5 15l5-5 5 5H5z" />
                        {:else}
                          <path d="M5 10l5 5 5-5H5z" />
                        {/if}
                      </svg>
                    {/if}
                  </div>
                </th>
                <th class="cursor-pointer py-3 px-6" on:click={() => handleSort('sector')}>
                  <div class="flex items-center">
                    Sector
                    {#if sortColumn === 'sector'}
                      <svg class="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        {#if sortDirection === 1}
                          <path d="M5 15l5-5 5 5H5z" />
                        {:else}
                          <path d="M5 10l5 5 5-5H5z" />
                        {/if}
                      </svg>
                    {/if}
                  </div>
                </th>
                <th class="cursor-pointer py-3 px-6" on:click={() => handleSort('market_cap')}>
                  <div class="flex items-center">
                    Market Cap
                    {#if sortColumn === 'market_cap'}
                      <svg class="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        {#if sortDirection === 1}
                          <path d="M5 15l5-5 5 5H5z" />
                        {:else}
                          <path d="M5 10l5 5 5-5H5z" />
                        {/if}
                      </svg>
                    {/if}
                  </div>
                </th>
                <th class="cursor-pointer py-3 px-6" on:click={() => handleSort('exchange')}>
                  <div class="flex items-center">
                    Exchange
                    {#if sortColumn === 'exchange'}
                      <svg class="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        {#if sortDirection === 1}
                          <path d="M5 15l5-5 5 5H5z" />
                        {:else}
                          <path d="M5 10l5 5 5-5H5z" />
                        {/if}
                      </svg>
                    {/if}
                  </div>
                </th>
                <th class="py-3 px-6">Actions</th>
              </tr>
            </thead>
            <tbody class="text-sm font-light">
              {#each filteredStocks as stock}
                <tr class="border-b border-gray-200 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700">
                  <td class="py-3 px-6">{stock.symbol}</td>
                  <td class="py-3 px-6">{stock.company_name}</td>
                  <td class="py-3 px-6">{stock.sector}</td>
                  <td class="py-3 px-6">${stock.market_cap?.toLocaleString()}</td>
                  <td class="py-3 px-6">{stock.exchange}</td>
                  <td class="py-3 px-6 flex space-x-2">
                    <button
                      class="rounded bg-primary-500 px-4 py-2 text-white transition-colors hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-offset-gray-800"
                      on:click={() => viewDetails(stock)}
                    >
                      View Details
                    </button>
                    <button
                      class="rounded bg-secondary-500 px-4 py-2 text-white transition-colors hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 dark:bg-secondary-600 dark:hover:bg-secondary-700 dark:focus:ring-offset-gray-800"
                      on:click={() => viewFinancials(stock)}
                    >
                      View Financials
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  /* Add any additional custom styles here */
</style>
