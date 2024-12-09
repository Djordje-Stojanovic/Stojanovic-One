<script lang="ts">
    import { chartStore } from '$lib/stores/financial-charts';
    import { getHistoricalPrices } from '$lib/services/stockPriceService';
    import { page } from '$app/stores';
    import { loadSelectedYears } from './state/chartState';

    let symbol = $page.params.symbol;
    let isActive = false;

    async function togglePrice() {
        try {
            if (!isActive) {
                const years = loadSelectedYears();
                console.log(`Fetching ${years} years of prices for symbol:`, symbol);
                const prices = await getHistoricalPrices(symbol, years);
                console.log('Got prices:', prices.length, 'First:', prices[0], 'Last:', prices[prices.length - 1]);
                if (!prices.length) return;

                // Sort by date ascending
                const sortedPrices = [...prices].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                console.log('Sorted prices - First:', sortedPrices[0], 'Last:', sortedPrices[sortedPrices.length - 1]);

                // Create metric data
                const values = sortedPrices.map(p => Number(p.adj_close) || 0);
                const dates = sortedPrices.map(p => p.date);

                console.log('Price data prepared:', {
                    name: 'Stock Price',
                    valueCount: values.length,
                    dateCount: dates.length,
                    firstValue: values[0],
                    lastValue: values[values.length - 1],
                    firstDate: dates[0],
                    lastDate: dates[dates.length - 1]
                });

                // Add price data
                chartStore.handleMetricClick('Stock Price', values, dates);
            } else {
                // Remove price data
                chartStore.handleMetricClick('Stock Price', [], []);
            }
            isActive = !isActive;
            console.log('Toggle complete, isActive:', isActive);
        } catch (error) {
            console.error('Error in togglePrice:', error);
        }
    }

    // Reset active state when symbol changes
    $: if ($page.params.symbol !== symbol) {
        symbol = $page.params.symbol;
        isActive = false;
    }
</script>

<div class="w-full flex items-center">
    <div class="flex-grow flex flex-wrap gap-2 items-center justify-center">
        <button
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 border border-transparent hover:bg-opacity-10 focus:outline-none"
            style="color: #10B981; background-color: {isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent'}; border-color: transparent;"
            on:click={togglePrice}
        >
            <span class="w-1.5 h-1.5 rounded-full mr-1.5" style="background-color: #10B981;"></span>
            Stock Price
        </button>
    </div>
</div>
