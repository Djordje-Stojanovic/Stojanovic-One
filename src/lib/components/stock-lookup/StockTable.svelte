<script lang="ts">
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import type { StockMetadata, UserStock } from './Types';
  import TableHeader from './TableHeader.svelte';
  import StockRow from './StockRow.svelte';
  import Pagination from './Pagination.svelte';

  export let userStocks: UserStock[] = [];
  export let loading = false;
  export let error: string | null = null;
  export let addingStockId: string | null = null;
  export let filteredStocks: StockMetadata[] = [];

  const ITEMS_PER_PAGE = 100;

  // Sorting state
  let sortColumn: keyof StockMetadata | null = 'market_cap';
  let sortDirection: 'asc' | 'desc' = 'desc';

  // Pagination state
  let currentPage = 1;

  // Reactive calculations
  $: totalPages = Math.ceil(filteredStocks.length / ITEMS_PER_PAGE);
  $: startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  $: endIndex = startIndex + ITEMS_PER_PAGE;

  // Reset to first page when filtered stocks change
  $: {
    if (filteredStocks) {
      currentPage = 1;
    }
  }

  function handleSort(event: CustomEvent<keyof StockMetadata>) {
    const column = event.detail;
    if (sortColumn === column) {
      // If clicking the same column, toggle direction
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // If clicking a new column, set it with default desc direction
      sortColumn = column;
      sortDirection = 'desc';
    }
  }

  function handlePageChange(event: CustomEvent<number>) {
    currentPage = event.detail;
    // Scroll to top of table
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Get current page stocks
  $: paginatedStocks = sortedStocks.slice(startIndex, endIndex);

  function handleError(event: CustomEvent<string | null>) {
    error = event.detail;
  }

  function handleAdding(event: CustomEvent<string | null>) {
    addingStockId = event.detail;
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
  <Pagination
    {currentPage}
    {totalPages}
    itemsPerPage={ITEMS_PER_PAGE}
    totalItems={filteredStocks.length}
    on:pageChange={handlePageChange}
  />
  <div class="mt-4 overflow-x-auto rounded-[0.375rem] border-2 border-[#4B5563]">
    <table class="w-full">
      <TableHeader
        {sortColumn}
        {sortDirection}
        on:sort={handleSort}
      />
      <tbody class="bg-[#1F2937]">
        {#each paginatedStocks as stock (stock.id)}
          <StockRow
            {stock}
            {userStocks}
            {addingStockId}
            on:error={handleError}
            on:adding={handleAdding}
            on:reloadUserStocks
          />
        {/each}
      </tbody>
    </table>
  </div>
  <Pagination
    {currentPage}
    {totalPages}
    itemsPerPage={ITEMS_PER_PAGE}
    totalItems={filteredStocks.length}
    on:pageChange={handlePageChange}
  />
{/if}
