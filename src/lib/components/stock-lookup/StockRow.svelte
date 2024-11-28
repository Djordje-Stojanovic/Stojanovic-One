<script lang="ts">
  import type { StockMetadata, UserStock } from './Types';
  import { formatMarketCap } from './Types';
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
