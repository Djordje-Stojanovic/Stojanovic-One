<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { goto } from '$app/navigation';
    import { allowedMoves } from '$lib/utils/stockMoves';
    import type { ListName } from '$lib/constants/listNames';
    import type { UserStock, StockMetadata } from '$lib/types';
    import StockPageButton from './StockPageButton.svelte';

    export let item: StockMetadata | undefined;
    export let userStock: UserStock | undefined;
    
    const dispatch = createEventDispatcher<{
        stockUpdated: UserStock;
        deleteItem: string;
        moveItem: { stockId: string; newListName: ListName };
        dragStart: ListName;
        dragEnd: void;
    }>();
    
    async function handleMoveItem(event: Event) {
        if (!userStock) return;
        const newListName = (event.target as HTMLSelectElement).value as ListName;
        if (newListName) {
            dispatch('moveItem', { stockId: userStock.id, newListName });
            (event.target as HTMLSelectElement).value = '';
        }
    }
    
    function handleFullPage() {
        if (!userStock || !item) return;
        goto(`/subprojects/investment-analysis-platform/${userStock.list_name.toLowerCase()}/${item.symbol.toLowerCase()}`);
    }
    
    function handleDelete() {
        if (!userStock) return;
        if (confirm('Are you sure you want to delete this stock item?')) {
            dispatch('deleteItem', userStock.id);
        }
    }

    function handleDragStart(event: DragEvent) {
        if (!userStock || !event.dataTransfer) return;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', userStock.id);
        event.dataTransfer.setData('application/json', JSON.stringify({
            id: userStock.id,
            currentList: userStock.list_name
        }));
        dispatch('dragStart', userStock.list_name);
    }

    function handleDragEnd() {
        dispatch('dragEnd');
    }
</script>

{#if item && userStock}
<div 
    class="group relative rounded-lg border bg-white px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
    draggable="true"
    role="listitem"
    aria-label="Stock item for {item.symbol}"
    on:dragstart={handleDragStart}
    on:dragend={handleDragEnd}
>
    <!-- Header with logo and symbol -->
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
            <img src={item.logo_url} alt="{item.symbol} logo" class="h-6 w-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {item.symbol}
            </h3>
        </div>
    </div>

    <!-- Company info -->
    <div class="mt-2 space-y-1">
        <p class="text-sm text-gray-700 dark:text-gray-300">{item.company_name}</p>
        <div class="flex items-center gap-4 text-xs">
            <span class="text-gray-600 dark:text-gray-400">Sector: {item.sector}</span>
            <span class="text-gray-600 dark:text-gray-400">Exchange: {item.exchange}</span>
        </div>
        <div class="text-xs text-gray-600 dark:text-gray-400">
            Market Cap: <span class="font-medium">${item.market_cap?.toLocaleString() ?? 'N/A'}</span>
        </div>
    </div>

    <!-- Notes -->
    {#if userStock.notes}
        <p class="mt-2 text-xs text-gray-600 dark:text-gray-400">{userStock.notes}</p>
    {/if}

    <!-- Actions -->
    <div class="mt-3 space-y-2">
        <!-- List management actions -->
        <div class="flex gap-2">
            {#if allowedMoves[userStock.list_name] && allowedMoves[userStock.list_name].length > 0}
                <select 
                    on:change={handleMoveItem} 
                    class="flex-1 rounded bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    aria-label="Move stock to different list"
                >
                    <option value="">Move to...</option>
                    {#each allowedMoves[userStock.list_name] as listName}
                        <option value={listName}>{listName}</option>
                    {/each}
                </select>
            {/if}
            <StockPageButton 
                variant="danger"
                onClick={handleDelete}
                aria-label="Delete {item.symbol} from list"
            >
                Delete
            </StockPageButton>
        </div>

        <!-- Navigation actions -->
        <div class="grid grid-cols-3 gap-2">
            <StockPageButton 
                variant="secondary"
                onClick={handleFullPage}
                aria-label="View full page for {item.symbol}"
            >
                Full Page
            </StockPageButton>
            <StockPageButton 
                variant="secondary"
                onClick={() => goto(`/subprojects/investment-analysis-platform/company/${item.symbol}`)}
                aria-label="View wiki for {item.symbol}"
            >
                Wiki
            </StockPageButton>
            <StockPageButton 
                variant="secondary"
                onClick={() => goto(`/subprojects/investment-analysis-platform/company/${item.symbol}/financials`)}
                aria-label="View financials for {item.symbol}"
            >
                Financials
            </StockPageButton>
        </div>
    </div>
</div>
{:else}
<div class="rounded-lg border bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <p class="text-sm text-gray-600 dark:text-gray-400">Error loading stock data</p>
</div>
{/if}
