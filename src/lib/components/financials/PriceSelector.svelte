<script lang="ts">
    import { chartStore } from '$lib/stores/financial-charts';
    import { page } from '$app/stores';
    import { db } from '$lib/supabaseClient';
    import { loadSelectedYears } from './state/chartState';

    let symbol = $page.params.symbol;
    let isLoading = false;
    let isActive = false;

    // Subscribe to store to sync active state
    $: {
        const priceMetric = $chartStore.selectedMetrics.find(m => m.name === 'Stock Price');
        isActive = !!priceMetric && !priceMetric.hidden;
    }

    async function togglePrice() {
        if (isLoading) return;
        
        try {
            isLoading = true;
            
            if (!isActive) {
                const years = loadSelectedYears();
                const endDate = new Date();
                const startDate = new Date();
                startDate.setFullYear(endDate.getFullYear() - years);

                const { data: prices } = await db
                    .from('stock_prices')
                    .select('*')
                    .eq('symbol', symbol)
                    .gte('date', startDate.toISOString().split('T')[0])
                    .lte('date', endDate.toISOString().split('T')[0])
                    .order('date', { ascending: true });

                if (prices?.length) {
                    const values = prices.map(p => Number(p.adj_close));
                    const dates = prices.map(p => p.date);
                    chartStore.handleMetricClick('Stock Price', values, dates);
                }
            } else {
                chartStore.handleMetricClick('Stock Price', [], []);
            }
        } catch (error) {
            console.error('Error in togglePrice:', error);
        } finally {
            isLoading = false;
        }
    }

    // Reset when symbol changes
    $: if ($page.params.symbol !== symbol) {
        symbol = $page.params.symbol;
        if (isActive) {
            chartStore.handleMetricClick('Stock Price', [], []);
        }
    }
</script>

<div class="w-full flex items-center">
    <div class="flex-grow flex flex-wrap gap-2 items-center justify-center">
        <button
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 border border-transparent hover:bg-opacity-10 focus:outline-none"
            style="color: #10B981; background-color: {isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent'}; border-color: transparent;"
            on:click={togglePrice}
            disabled={isLoading}
        >
            <span class="w-1.5 h-1.5 rounded-full mr-1.5" style="background-color: #10B981;"></span>
            Stock Price {#if isLoading}...{/if}
        </button>
    </div>
</div>
