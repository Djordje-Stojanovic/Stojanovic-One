<script lang="ts">
    import { chartStore } from '$lib/stores/financial-charts';
    import { getHistoricalPrices } from '$lib/services/stockPriceService';
    import { page } from '$app/stores';
    import { loadSelectedYears } from './state/chartState';

    let symbol = $page.params.symbol;
    let isActive = false;
    let isLoading = false;
    let currentPriceData: { values: number[], dates: string[] } | null = null;

    // Subscribe to chartStore to sync active state and data
    $: {
        const priceMetric = $chartStore.selectedMetrics.find(m => m.name === 'Stock Price');
        isActive = !!priceMetric;
        if (priceMetric) {  // Always update currentPriceData when priceMetric exists
            currentPriceData = {
                values: priceMetric.data.map(d => d.value),
                dates: priceMetric.data.map(d => d.date)
            };
        }
    }

    // Subscribe to store updates to detect metric updates
    $: {
        if (isActive && !isLoading) {
            const years = loadSelectedYears();
            updatePriceData(years);
        }
    }

    async function updatePriceData(years: number) {
        try {
            isLoading = true;
            const prices = await getHistoricalPrices(symbol, years);
            if (prices.length > 0) {
                const sortedPrices = [...prices].sort((a, b) => 
                    new Date(a.date).getTime() - new Date(b.date).getTime()
                );
                const values = sortedPrices.map(p => Number(p.adj_close) || 0);
                const dates = sortedPrices.map(p => p.date);
                currentPriceData = { values, dates };
                chartStore.handleMetricClick('Stock Price', values, dates);
            }
        } catch (error) {
            console.error('Error updating price data:', error);
        } finally {
            isLoading = false;
        }
    }

    async function togglePrice() {
        if (isLoading) return; // Prevent multiple clicks while loading
        
        try {
            isLoading = true;
            
            if (!isActive) {
                const years = loadSelectedYears();
                const prices = await getHistoricalPrices(symbol, years);
                if (!prices.length) return;

                // Sort by date ascending
                const sortedPrices = [...prices].sort((a, b) => 
                    new Date(a.date).getTime() - new Date(b.date).getTime()
                );

                // Create metric data - use adj_close for price values
                const values = sortedPrices.map(p => Number(p.adj_close) || 0);
                const dates = sortedPrices.map(p => p.date);

                currentPriceData = { values, dates };
                chartStore.handleMetricClick('Stock Price', values, dates);
            } else {
                // Remove price data
                currentPriceData = null;
                chartStore.handleMetricClick('Stock Price', [], []);
            }
        } catch (error) {
            console.error('Error in togglePrice:', error);
        } finally {
            isLoading = false;
        }
    }

    // Reset active state when symbol changes
    $: if ($page.params.symbol !== symbol) {
        symbol = $page.params.symbol;
        if (isActive) {
            currentPriceData = null;
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
