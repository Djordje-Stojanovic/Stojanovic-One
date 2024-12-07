<script lang="ts">
    import { chartStore } from '$lib/stores/financial-charts';
    import { getHistoricalPrices } from '$lib/services/stockPriceService';
    import { page } from '$app/stores';

    let symbol = $page.params.symbol;

    async function togglePrice() {
        const prices = await getHistoricalPrices(symbol, 260); // Get ~5 years of weekly data
        if (!prices.length) return;

        // Filter to weekly data and map to chart format
        const weeklyPrices = prices
            .filter((_, index) => index % 5 === 0)
            .map(price => ({
                date: price.date,
                value: Number(price.adj_close) || 0
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        chartStore.handleMetricClick('Stock Price (Weekly)', weeklyPrices.map(p => p.value), weeklyPrices.map(p => p.date));
    }
</script>

<div class="w-full flex items-center">
    <div class="flex-grow flex flex-wrap gap-2 items-center justify-center">
        <button
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 border border-transparent hover:bg-opacity-10 focus:outline-none"
            style="color: #10B981; background-color: transparent; border-color: transparent;"
            on:click={togglePrice}
        >
            <span class="w-1.5 h-1.5 rounded-full mr-1.5" style="background-color: #10B981;"></span>
            5Y Weekly Price
        </button>
    </div>
</div>
