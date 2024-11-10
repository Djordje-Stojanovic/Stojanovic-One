<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { NumberFormat } from '$lib/utils/numberFormat';

    export let symbol: string;
    export let companyName: string | null = null;
    export let loading: boolean = false;
    export let numberFormat: NumberFormat;
    export let selectedYears: number = 10;
    export let customYears: string = '';

    const dispatch = createEventDispatcher();

    function handleRefresh() {
        dispatch('refresh');
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
                    class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors duration-300"
                    on:click={handleRefresh}
                    disabled={loading}
                >
                    {loading ? 'Loading...' : 'Refresh'}
                </button>
            </div>
            <div class="flex flex-wrap items-center gap-2">
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
