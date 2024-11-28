<script lang="ts">
  import { session } from '$lib/stores/sessionStore';
  import { stockForm } from '$lib/stores/stockFormStore';
  import { createEventDispatcher } from 'svelte';
  import type { StockMetadata } from './Types';

  const dispatch = createEventDispatcher();

  export let stock: StockMetadata;
  export let listName: string | null;
  export let addingStockId: string | null;

  async function addToWatchlist() {
    if (!$session?.access_token) {
      dispatch('error', 'Please log in to add stocks to your watchlist');
      return;
    }

    if (listName) {
      dispatch('error', `This stock is already in your ${listName} list`);
      return;
    }

    try {
      dispatch('error', null);
      dispatch('adding', stock.id);

      // Then sync with database
      stockForm.reset();
      stockForm.setIdentifier(stock.symbol);
      await stockForm.validateIdentifier($session.access_token);
      const result = await stockForm.submitForm('Watchlist', $session.access_token);
      
      if (!result.success) {
        // Handle specific error codes
        if (result.code === 'DUPLICATE_ENTRY') {
          dispatch('error', `This stock is already in your Watchlist`);
        } else {
          throw new Error(result.error || 'Failed to add stock');
        }
      } else {
        dispatch('reloadUserStocks');
      }

    } catch (err) {
      dispatch('error', err instanceof Error ? err.message : 'Failed to add stock to watchlist');
    } finally {
      dispatch('adding', null);
    }
  }
</script>

<div class="w-[160px]">
  {#if listName}
    <button
      class="w-full px-4 py-2 bg-[#374151] text-[#F9FAFB] rounded-[0.375rem] cursor-not-allowed font-medium text-sm"
      disabled
      title={`Already in ${listName}`}
    >
      In {listName}
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
      on:click={addToWatchlist}
    >
      Add to Watchlist
    </button>
  {/if}
</div>
