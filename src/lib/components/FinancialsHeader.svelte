<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { NumberFormat } from '$lib/utils/numberFormat';

    export let symbol: string;
    export let companyName: string | null = null;
    export let loading: boolean = false;
    export let numberFormat: NumberFormat;
    export let startDate: string;
    export let endDate: string;

    const dispatch = createEventDispatcher();

    function handleRefresh() {
        dispatch('refresh');
    }

    function handleFormatChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        dispatch('formatChange', select.value);
    }

    function handleDateChange(event: Event) {
        const input = event.target as HTMLInputElement;
        dispatch('dateChange', {
            [input.name]: input.value
        });
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
                    class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    on:click={handleRefresh}
                    disabled={loading}
                >
                    {loading ? 'Loading...' : 'Refresh'}
                </button>
            </div>
            <div class="flex items-center gap-4">
                <input 
                    type="date" 
                    name="startDate"
                    bind:value={startDate}
                    on:change={handleDateChange}
                    class="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm"
                />
                <span class="text-gray-500">to</span>
                <input 
                    type="date" 
                    name="endDate"
                    bind:value={endDate}
                    on:change={handleDateChange}
                    class="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm"
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
