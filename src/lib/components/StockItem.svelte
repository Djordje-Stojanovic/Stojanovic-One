<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { goto } from '$app/navigation';
    import { allowedMoves } from '$lib/utils/stockMoves';
    import type { ListName } from '$lib/constants/listNames';
    import type { UserStock, StockMetadata } from '$lib/types';

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
            (event.target as HTMLSelectElement).value = ''; // Reset select
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
    class="rounded-lg border bg-white p-6 shadow-md transition-all duration-100 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
    draggable="true"
    role="listitem"
    aria-label="Stock item for {item.symbol}"
    on:dragstart={handleDragStart}
    on:dragend={handleDragEnd}
>
    <div class="mb-3 flex items-center">
        <img src={item.logo_url} alt="{item.symbol} logo" class="mr-3 h-8 w-8">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {item.symbol}
        </h3>
    </div>
    <p class="mb-2 text-gray-700 dark:text-gray-300">{item.company_name}</p>
    <p class="mb-2 text-gray-600 dark:text-gray-400">Sector: {item.sector}</p>
    <div class="mb-2 flex justify-between">
        <span class="text-gray-600 dark:text-gray-400">Market Cap:</span>
        <span class="font-semibold text-gray-900 dark:text-gray-100">${item.market_cap?.toLocaleString() ?? 'N/A'}</span>
    </div>
    <div class="mb-4 flex justify-between">
        <span class="text-gray-600 dark:text-gray-400">Exchange:</span>
        <span class="font-semibold text-gray-900 dark:text-gray-100">{item.exchange}</span>
    </div>
    <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">{userStock.notes}</p>

    <!-- Actions section with consistent spacing and grouping -->
    <div class="space-y-2">
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
            <button 
                on:click={handleDelete} 
                class="rounded bg-red-600 px-3 py-2 text-sm text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                aria-label="Delete {item.symbol} from list"
            >
                Delete
            </button>
        </div>

        <!-- Navigation actions in a grid -->
        <div class="grid grid-cols-3 gap-2">
            <button 
                on:click={handleFullPage} 
                class="rounded bg-gray-600 px-3 py-2 text-sm text-white transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                aria-label="View full page for {item.symbol}"
            >
                Full Page
            </button>
            <button 
                on:click={() => goto(`/subprojects/investment-analysis-platform/company/${item.symbol}`)} 
                class="rounded bg-gray-600 px-3 py-2 text-sm text-white transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                aria-label="View wiki for {item.symbol}"
            >
                Wiki
            </button>
            <button 
                on:click={() => goto(`/subprojects/investment-analysis-platform/company/${item.symbol}/financials`)} 
                class="rounded bg-gray-600 px-3 py-2 text-sm text-white transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                aria-label="View financials for {item.symbol}"
            >
                Financials
            </button>
        </div>
    </div>
</div>
{:else}
<div class="rounded-lg border bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
    <p class="text-gray-600 dark:text-gray-400">Error loading stock data</p>
</div>
{/if}
