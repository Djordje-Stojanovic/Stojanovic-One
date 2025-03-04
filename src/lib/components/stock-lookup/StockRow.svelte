<script lang="ts">
  import type { StockMetadata, UserStock } from './Types';
  import { formatMarketCap, formatPERatio } from './Types';
  import AddToWatchlistButton from './AddToWatchlistButton.svelte';

  export let stock: StockMetadata;
  export let userStocks: UserStock[] = [];
  export let addingStockId: string | null = null;

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

  $: listName = getStockListName(stock.id);
</script>

<tr class="border-b border-[#374151] group/row">
  <td class="p-0 relative cursor-pointer group/cell">
    <div class="absolute inset-0 bg-[#2a3441] opacity-0 group-hover/cell:opacity-100 transition-opacity duration-200"></div>
    <a 
      href="/subprojects/investment-analysis-platform/company/{stock.symbol}/financials"
      class="block py-4 px-4 w-full h-full relative z-10"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          {#if stock.logo_url}
            <img
              src={stock.logo_url}
              alt=""
              class="h-6 w-6 transition-transform duration-200 group-hover/cell:scale-110"
              on:error={(e) => {
                if (e.target instanceof HTMLImageElement) {
                  e.target.style.display = 'none';
                }
              }}
            />
          {/if}
          <span class="text-[#F9FAFB] font-medium group-hover/cell:text-blue-400 transition-colors duration-200">{stock.symbol}</span>
        </div>
        <div class="opacity-0 group-hover/cell:opacity-100 transition-opacity duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </a>
  </td>
  <td class="py-4 px-4 text-[#F9FAFB] border-l border-[#374151]">{stock.company_name}</td>
  <td class="py-4 px-4 text-[#F9FAFB] border-l border-[#374151]">{stock.sector || 'N/A'}</td>
  <td class="py-4 px-4 text-[#F9FAFB] border-l border-[#374151]">{stock.industry || 'N/A'}</td>
  <td class="py-4 px-4 text-[#F9FAFB] border-l border-[#374151]">{formatMarketCap(stock.market_cap)}</td>
  <td class="py-4 px-4 text-[#F9FAFB] border-l border-[#374151]">{formatPERatio(stock.pe_ratio)}</td>
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
    <AddToWatchlistButton
      {stock}
      {listName}
      {addingStockId}
      on:error
      on:adding
      on:reloadUserStocks
    />
  </td>
</tr>
