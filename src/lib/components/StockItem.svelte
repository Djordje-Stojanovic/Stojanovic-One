<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { goto } from '$app/navigation';
    import { allowedMoves } from '$lib/utils/stockMoves';
    
    export let item;
    const dispatch = createEventDispatcher();
    
    function handleMoveItem(event) {
        const newListName = event.target.value;
        if (newListName) {
            dispatch('moveItem', { item, newListName });
        }
    }
    
    function handleFullPage() {
        goto(`/subprojects/investment-analysis-platform/${item.list_name.toLowerCase()}/${item.symbol.toLowerCase()}`);
    }
</script>

<div class="rounded-lg border bg-white p-6 shadow-md transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
    <div class="mb-3 flex items-center">
        {#if item.symbol}
            <img src={`https://assets.parqet.com/logos/symbol/${item.symbol}?format=png`} alt={`${item.symbol} logo`} class="mr-3 h-8 w-8">
        {:else if item.isin}
            <img src={`https://assets.parqet.com/logos/isin/${item.isin}?format=png`} alt={`${item.isin} logo`} class="mr-3 h-8 w-8">
        {:else}
            <!-- Placeholder image or icon -->
        {/if}
        <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {item.symbol ? item.symbol : item.isin}
        </h3>
    </div>
    <p class="mb-2 text-gray-700 dark:text-gray-300">{item.company_name}</p>
    <p class="mb-2 text-gray-600 dark:text-gray-400">Sector: {item.sector}</p>
    <div class="mb-2 flex justify-between">
        <span class="text-gray-600 dark:text-gray-400">Current Price:</span>
        <span class="font-semibold text-gray-900 dark:text-gray-100">${item.current_price}</span>
    </div>
    <div class="mb-4 flex justify-between">
        <span class="text-gray-600 dark:text-gray-400">Target Price:</span>
        <span class="font-semibold text-gray-900 dark:text-gray-100">${item.target_price}</span>
    </div>
    <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">{item.notes}</p>
    <div class="flex flex-wrap justify-between gap-2">
        {#if allowedMoves[item.list_name] && allowedMoves[item.list_name].length > 0}
            <select on:change={handleMoveItem} class="rounded bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
                <option value="">Move to...</option>
                {#each allowedMoves[item.list_name] as listName}
                    <option value={listName}>{listName}</option>
                {/each}
            </select>
        {/if}
        <button on:click={handleFullPage} class="rounded bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
            Full Page
        </button>
        <button on:click={() => {
            if (confirm('Are you sure you want to delete this stock item?')) {
                dispatch('deleteItem', item.id);
            }
        }} class="rounded bg-red-600 px-3 py-2 text-sm text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
            Delete
        </button>
    </div>
</div>