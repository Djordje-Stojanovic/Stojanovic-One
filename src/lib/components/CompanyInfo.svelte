<script lang="ts">
    import { formatCurrency, formatNumber } from '$lib/utils/numberFormat';
    export let stockMetadata: any;
    export let incomeStatements: any[] = [];

    // Sort income statements by date in descending order and filter out any without links
    $: sortedStatements = incomeStatements
        .filter(stmt => stmt.final_link)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let showFilings = false;
</script>

<div class="mt-8 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 p-6 shadow-lg dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-700 transition-colors">
    <div class="relative">
        <h2 class="mb-4 text-3xl font-extrabold text-gray-900 dark:text-gray-100 border-b pb-2 flex justify-between items-center">
            Company Information
            {#if sortedStatements.length > 0}
                <div class="relative">
                    <button
                        class="text-sm px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition-colors"
                        on:click={() => showFilings = !showFilings}
                        aria-haspopup="true"
                        aria-expanded={showFilings}
                        aria-controls="sec-filings-menu"
                    >
                        SEC Filings
                    </button>
                    {#if showFilings}
                        <div
                            id="sec-filings-menu"
                            role="menu"
                            tabindex="0"
                            class="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 border dark:border-gray-700"
                            on:mouseleave={() => showFilings = false}
                            on:keydown={e => e.key === 'Escape' && (showFilings = false)}
                            aria-label="SEC Filings Menu"
                        >
                            <div class="max-h-96 overflow-y-auto">
                                {#each sortedStatements as stmt}
                                    <a
                                        href={stmt.final_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 border-b dark:border-gray-700 last:border-0"
                                        role="menuitem"
                                        tabindex="0"
                                    >
                                        {new Date(stmt.date).getFullYear()} {stmt.period} Report
                                    </a>
                                {/each}
                            </div>
                        </div>
                    {/if}
                </div>
            {/if}
        </h2>
    </div>
    <div class="space-y-3">
        {#if stockMetadata}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-3">
                    <div class="flex justify-between items-center">
                        <span class="font-medium text-gray-700 dark:text-gray-300">Symbol:</span>
                        <span class="text-gray-900 dark:text-gray-100">{stockMetadata.symbol || 'N/A'}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="font-medium text-gray-700 dark:text-gray-300">Company Name:</span>
                        <span class="text-gray-900 dark:text-gray-100">{stockMetadata.company_name || 'N/A'}</span>
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
        {:else}
            <div class="text-gray-600 dark:text-gray-400">No company information available.</div>
        {/if}
    </div>
</div>
