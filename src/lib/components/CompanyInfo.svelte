<script lang="ts">
    export let stockMetadata: any;
</script>

<div class="mt-8 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 p-6 shadow-lg dark:bg-gradient-to-r from-gray-800 to-gray-700 transition-colors">
    <h2 class="mb-4 text-3xl font-extrabold text-gray-900 dark:text-gray-100 border-b pb-2">Company Information</h2>
    <div class="space-y-3">
        {#if stockMetadata}
            <div class="flex justify-between items-center">
                <span class="font-medium text-gray-700 dark:text-gray-300">Symbol:</span>
                <span class="text-gray-900 dark:text-gray-100">{stockMetadata.symbol || 'N/A'}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="font-medium text-gray-700 dark:text-gray-300">Company Name:</span>
                <span class="text-gray-900 dark:text-gray-100">{stockMetadata.company_name || 'N/A'}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="font-medium text-gray-700 dark:text-gray-300">Sector:</span>
                <span class="text-gray-900 dark:text-gray-100">{stockMetadata.sector || 'N/A'}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="font-medium text-gray-700 dark:text-gray-300">Market Cap:</span>
                <span class="text-gray-900 dark:text-gray-100">{stockMetadata.market_cap ? `$${stockMetadata.market_cap.toLocaleString()}` : 'N/A'}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="font-medium text-gray-700 dark:text-gray-300">Shares Outstanding:</span>
                <span class="text-gray-900 dark:text-gray-100">{stockMetadata.share_outstanding ? stockMetadata.share_outstanding.toLocaleString() : 'N/A'}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="font-medium text-gray-700 dark:text-gray-300">Country:</span>
                <span class="text-gray-900 dark:text-gray-100">{stockMetadata.country || 'N/A'}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="font-medium text-gray-700 dark:text-gray-300">Currency:</span>
                <span class="text-gray-900 dark:text-gray-100">{stockMetadata.currency || 'N/A'}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="font-medium text-gray-700 dark:text-gray-300">Estimate Currency:</span>
                <span class="text-gray-900 dark:text-gray-100">{stockMetadata.estimate_currency || 'N/A'}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="font-medium text-gray-700 dark:text-gray-300">Exchange:</span>
                <span class="text-gray-900 dark:text-gray-100">{stockMetadata.exchange || 'N/A'}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="font-medium text-gray-700 dark:text-gray-300">IPO Date:</span>
                <span class="text-gray-900 dark:text-gray-100">{stockMetadata.ipo || 'N/A'}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="font-medium text-gray-700 dark:text-gray-300">Phone:</span>
                <span class="text-gray-900 dark:text-gray-100">{stockMetadata.phone || 'N/A'}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="font-medium text-gray-700 dark:text-gray-300">Website:</span>
                {#if stockMetadata.weburl}
                    <a href={stockMetadata.weburl} target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300">
                        {stockMetadata.weburl}
                    </a>
                {:else}
                    <span class="text-gray-900 dark:text-gray-100">N/A</span>
                {/if}
            </div>
        {:else}
            <div class="text-gray-600 dark:text-gray-400">No company information available.</div>
        {/if}
    </div>
</div>