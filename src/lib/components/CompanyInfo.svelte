<script lang="ts">
    export let stockMetadata: any;
</script>

<div class="mt-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
    <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">Company Information</h2>
    <div class="space-y-4">
        {#if stockMetadata}
            <div><span class="font-semibold">Symbol:</span> {stockMetadata.symbol || 'N/A'}</div>
            <div><span class="font-semibold">Company Name:</span> {stockMetadata.company_name || 'N/A'}</div>
            <div><span class="font-semibold">ISIN:</span> {stockMetadata.isin || 'N/A'}</div>
            <div><span class="font-semibold">Sector:</span> {stockMetadata.sector || 'N/A'}</div>
            <div><span class="font-semibold">Market Cap:</span> {stockMetadata.market_cap || 'N/A'}</div>
            <div><span class="font-semibold">Shares Outstanding:</span> {stockMetadata.share_outstanding || 'N/A'}</div>
            <div><span class="font-semibold">Country:</span> {stockMetadata.country || 'N/A'}</div>
            <div><span class="font-semibold">Currency:</span> {stockMetadata.currency || 'N/A'}</div>
            <div><span class="font-semibold">Exchange:</span> {stockMetadata.exchange || 'N/A'}</div>
            <div><span class="font-semibold">IPO Date:</span> {stockMetadata.ipo || 'N/A'}</div>
            <div><span class="font-semibold">Website:</span> 
                {#if stockMetadata.weburl}
                    <a href={stockMetadata.weburl} target="_blank" rel="noopener noreferrer">{stockMetadata.weburl}</a>
                {:else}
                    N/A
                {/if}
            </div>
        {:else}
            <div>No company information available.</div>
        {/if}
    </div>
</div>
