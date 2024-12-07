<script lang="ts">
    import { chartStore } from '$lib/stores/financial-charts';
    import { getHistoricalPrices } from '$lib/services/stockPriceService';
    import { page } from '$app/stores';

    let symbol = $page.params.symbol;

    // Get the selected years from the URL
    $: selectedYears = (() => {
        const searchParams = new URLSearchParams(window.location.search);
        const period = searchParams.get('period') || '5Y';
        switch (period) {
            case '3Y': return 3;
            case '5Y': return 5;
            case '10Y': return 10;
            case '20Y': return 20;
            case 'All': return 100;
            default: {
                const customYears = parseInt(period);
                return !isNaN(customYears) ? customYears : 5;
            }
        }
    })();

    async function togglePrice() {
        const prices = await getHistoricalPrices(symbol);
        if (!prices.length) return;

        // Calculate cutoff date based on selected years
        const cutoffDate = new Date();
        cutoffDate.setFullYear(cutoffDate.getFullYear() - selectedYears);

        // Filter and sort data
        const filteredPrices = prices
            .filter(price => new Date(price.date) >= cutoffDate)
            .map(price => ({
                date: price.date,
                value: Number(price.adj_close) || 0
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        chartStore.handleMetricClick('Stock Price', filteredPrices.map(p => p.value), filteredPrices.map(p => p.date));
    }

    // Watch for URL changes to update the chart when time period changes
    $: {
        const searchParams = new URLSearchParams(window.location.search);
        const period = searchParams.get('period');
        if (period) {
            togglePrice();
        }
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
            Stock Price
        </button>
    </div>
</div>
