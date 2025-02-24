<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { formatCurrency, formatNumber } from '$lib/utils/numberFormat';
    
    export let loading = false;
    export let stockMetadata: any = null;
    export let incomeStatements: any[] = [];

    const dispatch = createEventDispatcher();
    
    // Sort income statements by date in descending order and filter out any without links
    $: sortedStatements = incomeStatements
        .filter(stmt => stmt.final_link)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    function handleClose() {
        dispatch('close');
    }
</script>

<div class="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div class="bg-white/95 dark:bg-gray-900/95 rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col">
        <div class="p-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
            <div>
                <h2 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Company Information</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {stockMetadata ? stockMetadata.symbol : ''}
                </p>
            </div>
            <button 
                on:click={handleClose}
                class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        
        <div class="px-6 pb-6 overflow-y-auto flex-grow">
            {#if loading}
                <div class="flex flex-col items-center justify-center space-y-4 py-8">
                    <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p class="text-gray-600 dark:text-gray-300">Loading Company Information...</p>
                </div>
            {:else if stockMetadata}
                <div class="mt-8 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 p-6 shadow-lg dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-700 transition-colors">
                    <div class="relative">
                        <h2 class="mb-4 text-3xl font-extrabold text-gray-900 dark:text-gray-100 border-b pb-2 flex justify-between items-center">
                            Company Information
                        </h2>
                    </div>
                    <div class="space-y-3">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="space-y-3">
                                <div class="flex justify-between items-center">
                                    <span class="font-medium text-gray-700 dark:text-gray-300">Symbol:</span>
                                    <span class="text-gray-900 dark:text-gray-100">{stockMetadata.symbol || 'N/A'}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="font-medium text-gray-700 dark:text-gray-300">Company Name:</span>
                                    <span class="text-gray-900 dark:text-gray-100">{stockMetadata.company_name || stockMetadata.name || 'N/A'}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="font-medium text-gray-700 dark:text-gray-300">CEO:</span>
                                    <span class="text-gray-900 dark:text-gray-100">{stockMetadata.ceo || 'N/A'}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="font-medium text-gray-700 dark:text-gray-300">Sector:</span>
                                    <span class="text-gray-900 dark:text-gray-100">{stockMetadata.sector || 'N/A'}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="font-medium text-gray-700 dark:text-gray-300">Industry:</span>
                                    <span class="text-gray-900 dark:text-gray-100">{stockMetadata.industry || 'N/A'}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="font-medium text-gray-700 dark:text-gray-300">Price:</span>
                                    <span class="text-gray-900 dark:text-gray-100" title={formatCurrency(stockMetadata.price, 'full').tooltip}>
                                        {formatCurrency(stockMetadata.price, 'full').formatted}
                                    </span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="font-medium text-gray-700 dark:text-gray-300">Market Cap:</span>
                                    <span class="text-gray-900 dark:text-gray-100" title={formatCurrency(stockMetadata.market_cap, 'full').tooltip}>
                                        {formatCurrency(stockMetadata.market_cap, 'abbreviated').formatted}
                                    </span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="font-medium text-gray-700 dark:text-gray-300">Beta:</span>
                                    <span class="text-gray-900 dark:text-gray-100">{stockMetadata.beta?.toFixed(2) || 'N/A'}</span>
                                </div>
                            </div>
                            <div class="space-y-3">
                                <div class="flex justify-between items-center">
                                    <span class="font-medium text-gray-700 dark:text-gray-300">Exchange:</span>
                                    <span class="text-gray-900 dark:text-gray-100">{stockMetadata.exchange || 'N/A'}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="font-medium text-gray-700 dark:text-gray-300">Currency:</span>
                                    <span class="text-gray-900 dark:text-gray-100">{stockMetadata.currency || 'N/A'}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="font-medium text-gray-700 dark:text-gray-300">Last Dividend:</span>
                                    <span class="text-gray-900 dark:text-gray-100" title={formatCurrency(stockMetadata.last_div, 'full').tooltip}>
                                        {formatCurrency(stockMetadata.last_div, 'full').formatted}
                                    </span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="font-medium text-gray-700 dark:text-gray-300">Price Range:</span>
                                    <span class="text-gray-900 dark:text-gray-100">{stockMetadata.price_range || 'N/A'}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="font-medium text-gray-700 dark:text-gray-300">Employees:</span>
                                    <span class="text-gray-900 dark:text-gray-100" title={formatNumber(stockMetadata.full_time_employees, 'full').tooltip}>
                                        {formatNumber(stockMetadata.full_time_employees, 'abbreviated').formatted}
                                    </span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="font-medium text-gray-700 dark:text-gray-300">IPO Date:</span>
                                    <span class="text-gray-900 dark:text-gray-100">{stockMetadata.ipo || 'N/A'}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="font-medium text-gray-700 dark:text-gray-300">Location:</span>
                                    <span class="text-gray-900 dark:text-gray-100">
                                        {[stockMetadata.city, stockMetadata.state, stockMetadata.country].filter(Boolean).join(', ') || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {#if stockMetadata.description}
                            <div class="mt-6">
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Description</h3>
                                <p class="text-gray-700 dark:text-gray-300">{stockMetadata.description}</p>
                            </div>
                        {/if}

                        {#if stockMetadata.weburl}
                            <div class="mt-4">
                                <a 
                                    href={stockMetadata.weburl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    class="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                                >
                                    Visit Company Website →
                                </a>
                            </div>
                        {/if}
                        
                        {#if sortedStatements.length > 0}
                            <div class="mt-6">
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">SEC Filings</h3>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {#each sortedStatements.slice(0, 10) as stmt}
                                        <a
                                            href={stmt.final_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 border rounded dark:border-gray-700"
                                        >
                                            {new Date(stmt.date).getFullYear()} {stmt.period} Report
                                        </a>
                                    {/each}
                                </div>
                            </div>
                        {/if}
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>
