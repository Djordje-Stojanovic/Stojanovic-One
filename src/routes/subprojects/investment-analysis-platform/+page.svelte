<script lang="ts">
    import { onMount } from 'svelte';
    import { investmentStore } from '$lib/stores/investmentStore';
    import AddStockForm from '$lib/components/AddStockForm.svelte';
    import InvestmentHeader from '$lib/components/investment/InvestmentHeader.svelte';
    import StockList from '$lib/components/investment/StockList.svelte';
    import type { ListName } from '$lib/constants/listNames';
    import { session } from '$lib/stores/sessionStore';

    let showAddForm = false;
    let isCompactView = false;
    let activeList: ListName = 'Watchlist';

    // Subscribe to session changes and fetch stocks when session is available
    $: if ($session?.user) {
        investmentStore.fetchStocks();
    }

    // No need for onMount since we're using reactive statement above
</script>

<div class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
    <div class="container mx-auto px-4 py-8">
        <InvestmentHeader 
            bind:showAddForm
            bind:isCompactView
        />

        <StockList 
            {isCompactView}
        />

        {#if showAddForm}
            <AddStockForm
                {activeList}
                on:close={() => (showAddForm = false)}
                on:stockAdded={() => investmentStore.fetchStocks()}
            />
        {/if}
    </div>
</div>
