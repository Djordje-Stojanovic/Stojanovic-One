<script lang="ts">
    import { formatCurrency, formatNumber } from '$lib/utils/numberFormat';
    export let stockMetadata: any;
</script>

<div class="mt-8 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 p-6 shadow-lg dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-700 transition-colors">
    <h2 class="mb-4 text-3xl font-extrabold text-gray-900 dark:text-gray-100 border-b pb-2">Company Information</h2>
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
