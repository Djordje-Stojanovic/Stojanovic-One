<script lang="ts">
    import { investmentStore } from '$lib/stores/investmentStore';

    export let showAddForm: boolean;
    export let isCompactView: boolean;

    $: isSyncing = $investmentStore.isSyncing;
</script>

<div class="mb-6 flex items-center justify-between">
    <div class="flex items-center space-x-4">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Investment Analysis Platform</h1>
        <label class="relative inline-flex items-center cursor-pointer">
            <input 
                type="checkbox" 
                bind:checked={isCompactView}
                class="sr-only peer"
            >
            <div class="relative w-[2.75rem] h-[1.5rem] bg-gray-200 dark:bg-gray-700 rounded-full peer 
                        peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800
                        peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600
                        transition-all duration-300 ease-in-out">
                <div class="absolute top-[0.125rem] left-[0.125rem] bg-white border border-gray-300 dark:border-gray-600
                           rounded-full w-[1.25rem] h-[1.25rem] 
                           transition-transform duration-300 ease-in-out
                           peer-checked:translate-x-[1.25rem] rtl:peer-checked:-translate-x-[1.25rem]">
                </div>
            </div>
            <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Compact View</span>
        </label>
    </div>
    <div class="space-x-2">
        <button
            on:click={() => investmentStore.syncSymbols()}
            disabled={isSyncing}
            class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition duration-300 ease-in-out transform hover:scale-105"
        >
            {isSyncing ? 'Syncing...' : 'Sync Symbols'}
        </button>
        <button
            on:click={() => showAddForm = true}
            class="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-300 ease-in-out transform hover:scale-105"
        >
            Add Stock
        </button>
    </div>
</div>

{#if $investmentStore.syncResult}
    <div class="mb-4 rounded-md bg-green-100 p-4 text-green-700 dark:bg-green-800 dark:text-green-100 transition-colors duration-300">
        {$investmentStore.syncResult}
    </div>
{/if}

{#if $investmentStore.syncError}
    <div class="mb-4 rounded-md bg-red-100 p-4 text-red-700 dark:bg-red-800 dark:text-red-100 transition-colors duration-300">
        Error syncing symbols: {$investmentStore.syncError}
    </div>
{/if}
