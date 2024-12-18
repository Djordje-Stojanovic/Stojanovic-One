<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { NumberFormat } from '$lib/utils/numberFormat';

    export let symbol: string;
    export let companyName: string | null = null;
    export let loading: boolean = false;
    export let numberFormat: NumberFormat;
    export let selectedYears: number = 10;
    export let customYears: string = '';
    export let period: 'annual' | 'quarterly' | 'ttm' = 'annual';

    const dispatch = createEventDispatcher();

    function handleSync() {
        dispatch('sync');
    }

    function handleFormatChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        dispatch('formatChange', select.value);
    }

    function setYearRange(years: number) {
        selectedYears = years;
        customYears = '';
        dispatch('yearChange', { years });
    }

    function handleCustomYears() {
        const years = parseInt(customYears);
        if (!isNaN(years) && years > 0) {
            selectedYears = years;
            dispatch('yearChange', { years });
        }
    }

    function setPeriod(newPeriod: 'annual' | 'quarterly' | 'ttm') {
        period = newPeriod;
        dispatch('periodChange', { period: newPeriod });
    }
</script>

<div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
    <div class="container mx-auto">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div class="flex items-center gap-4">
                <h1 class="text-xl font-semibold">
                    {#if companyName}
                        {companyName} ({symbol}) Financial Statements
                    {:else}
                        {symbol} Financial Statements
                    {/if}
                </h1>
                <button
                    class="min-w-[150px] font-bold bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors duration-300"
                    on:click={handleSync}
                    disabled={loading}
                >
                    {#if loading}
                        <span class="flex items-center gap-2">
                            <div class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Syncing...
                        </span>
                    {:else}
                        <span class="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                            </svg>
                            Sync All Data
                        </span>
                    {/if}
                </button>
            </div>
            <div class="flex flex-wrap items-center gap-2">
                <div class="flex items-center gap-2 border-r dark:border-gray-600 pr-2 mr-2">
                    <button 
                        class="px-3 py-1 text-sm rounded transition-colors duration-300 {period === 'annual' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}"
                        on:click={() => setPeriod('annual')}>Annual</button>
                    <button 
                        class="px-3 py-1 text-sm rounded transition-colors duration-300 {period === 'quarterly' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}"
                        on:click={() => setPeriod('quarterly')}>Quarterly</button>
                    <button 
                        class="px-3 py-1 text-sm rounded transition-colors duration-300 {period === 'ttm' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}"
                        on:click={() => setPeriod('ttm')}>TTM</button>
                </div>
                <div class="flex items-center gap-2">
                    <button 
                        class="px-3 py-1 text-sm rounded transition-colors duration-300 {selectedYears === 3 ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}"
                        on:click={() => setYearRange(3)}>3Y</button>
                    <button 
                        class="px-3 py-1 text-sm rounded transition-colors duration-300 {selectedYears === 5 ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}"
                        on:click={() => setYearRange(5)}>5Y</button>
                    <button 
                        class="px-3 py-1 text-sm rounded transition-colors duration-300 {selectedYears === 10 ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}"
                        on:click={() => setYearRange(10)}>10Y</button>
                    <button 
                        class="px-3 py-1 text-sm rounded transition-colors duration-300 {selectedYears === 20 ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}"
                        on:click={() => setYearRange(20)}>20Y</button>
                    <button 
                        class="px-3 py-1 text-sm rounded transition-colors duration-300 {selectedYears === 0 ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}"
                        on:click={() => setYearRange(0)}>All</button>
                    <div class="flex items-center gap-1">
                        <input 
                            type="number" 
                            min="1"
                            placeholder="Custom years"
                            class="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm w-24"
                            bind:value={customYears}
                            on:change={handleCustomYears}
                        />
                        <select
                            bind:value={numberFormat}
                            on:change={handleFormatChange}
                            class="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm"
                        >
                            <option value="full">Full Numbers</option>
                            <option value="abbreviated">K/M/B</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
