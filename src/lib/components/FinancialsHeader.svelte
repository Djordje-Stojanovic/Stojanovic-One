<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { NumberFormat } from '$lib/utils/numberFormat';
    import { generateAIPrompt } from '$lib/utils/aiPrompt';
    import AISummaryModal from './AISummaryModal.svelte';
    import { session } from '$lib/stores/sessionStore';
    import { financialStore } from '$lib/stores/financialDataStore';
    import { stockPriceStore } from '$lib/stores/stockPriceStore';

    export let symbol: string;
    export let companyName: string | null = null;
    export let loading: boolean = false;
    export let numberFormat: NumberFormat;
    export let selectedYears: number = 10;
    export let customYears: string = '';
    export let period: 'annual' | 'quarterly' | 'ttm' = 'annual';

    let showAISummary = false;
    let aiSummaryLoading = false;
    let aiSummaryText: string | null = null;

    const dispatch = createEventDispatcher();

    async function handleAISummary() {
        if (!$session) return;
        
        showAISummary = true;
        aiSummaryLoading = true;
        aiSummaryText = null;

        try {
            // Get company info from the due diligence page URL
            const response = await fetch(`/api/company-info/${symbol}`, {
                headers: {
                    'Authorization': `Bearer ${$session.access_token}`
                }
            });
            const companyInfo = await response.json();

            const prompt = generateAIPrompt({
                symbol,
                companyName,
                financialData: $financialStore.filteredData,
                stockPriceData: $stockPriceStore.allData,
                companyInfo
            });

            const result = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer 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",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "meta-llama/llama-3.2-3b-instruct",
                    "messages": [
                        {"role": "user", "content": prompt}
                    ]
                })
            });

            const data = await result.json();
            aiSummaryText = data.choices[0].message.content;
        } catch (error) {
            console.error('Error generating AI summary:', error);
            aiSummaryText = 'Failed to generate AI summary. Please try again.';
        } finally {
            aiSummaryLoading = false;
        }
    }

    function handleCloseSummary() {
        showAISummary = false;
        aiSummaryText = null;
    }

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

    function handleDefaultView() {
        dispatch('defaultView');
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
                <div class="flex items-center gap-2">
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
                    <button
                        class="min-w-[150px] font-bold bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors duration-300"
                        on:click={handleDefaultView}
                    >
                        <span class="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                            </svg>
                            Default View
                        </span>
                    </button>
                    <button
                        class="min-w-[150px] font-bold bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm transition-colors duration-300"
                        on:click={handleAISummary}
                    >
                        <span class="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                            </svg>
                            AI Summary
                        </span>
                    </button>
                </div>
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

{#if showAISummary}
    <AISummaryModal 
        loading={aiSummaryLoading}
        summary={aiSummaryText}
        on:close={handleCloseSummary}
    />
{/if}
