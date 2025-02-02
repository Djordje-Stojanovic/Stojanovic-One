<script lang="ts">
    import { chartStore } from '$lib/stores/financial-charts';
    import { page } from '$app/stores';
    import { db } from '$lib/supabaseClient';
    import { loadSelectedYears, loadSelectedPeriod } from './state/chartState';
    import { getHistoricalPrices } from '$lib/services/stockPriceService';

    let symbol = $page.params.symbol;
    let isLoading = false;
    let isActive = false;
    let errorState = false;
    let selectedYears = loadSelectedYears();
    let selectedPeriod = loadSelectedPeriod();

    // Subscribe to store to sync active state
    $: {
        const priceMetric = $chartStore.selectedMetrics.find(m => m.name === 'Stock Price');
        isActive = !!priceMetric && !priceMetric.hidden;
    }

    async function updatePriceData() {
        if (!isActive || isLoading) return;
        
        try {
            isLoading = true;
            errorState = false;

            const prices = await getHistoricalPrices(symbol, selectedYears);
            
            if (!prices?.length) {
                throw new Error('No price data available');
            }

            const values = prices.map(p => Number(p.adj_close));
            const dates = prices.map(p => p.date);

            if (!values.some(v => !isNaN(v))) {
                throw new Error('Invalid price data');
            }

            // Update data while maintaining active state
            chartStore.handleMetricClick('Stock Price', values, dates);
        } catch (error) {
            console.error('Error updating price data:', error);
            errorState = true;
            setTimeout(() => {
                errorState = false;
            }, 2000);
        } finally {
            isLoading = false;
        }
    }

    async function togglePrice() {
        if (isLoading) return;
        
        try {
            isLoading = true;
            errorState = false;
            
            if (!isActive) {
                const prices = await getHistoricalPrices(symbol, selectedYears);
                
                if (!prices?.length) {
                    throw new Error('No price data available');
                }

                const values = prices.map(p => Number(p.adj_close));
                const dates = prices.map(p => p.date);

                if (!values.some(v => !isNaN(v))) {
                    throw new Error('Invalid price data');
                }

                chartStore.handleMetricClick('Stock Price', values, dates);
            } else {
                chartStore.handleMetricClick('Stock Price', [], []);
            }
        } catch (error) {
            console.error('Error in togglePrice:', error);
            errorState = true;
            setTimeout(() => {
                errorState = false;
            }, 2000);
        } finally {
            isLoading = false;
        }
    }

    // Update when symbol changes
    $: if ($page.params.symbol !== symbol) {
        symbol = $page.params.symbol;
        if (isActive) {
            updatePriceData();
        }
    }

    // Update when time period changes
    $: if ($chartStore.selectedYears !== selectedYears) {
        selectedYears = $chartStore.selectedYears;
        // Only update if the metric is active
        if (isActive) {
            updatePriceData();
        }
    }
</script>

<div class="w-full flex items-center">
    <div class="flex-grow flex flex-wrap gap-2 items-center justify-center">
        <button
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 border border-transparent {!isLoading && 'hover:bg-opacity-10'} focus:outline-none {isLoading ? 'cursor-wait opacity-50' : errorState ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
            style="color: #10B981; background-color: {isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent'}; border-color: transparent;"
            on:click={togglePrice}
            disabled={isLoading || errorState}
        >
            <span class="w-1.5 h-1.5 rounded-full mr-1.5" style="background-color: #10B981;"></span>
            Stock Price 
            {#if isLoading}
                <span class="inline-block animate-pulse">...</span>
            {:else if errorState}
                <span class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap animate-fade-in z-50 shadow-lg">
                    Failed to load price data
                </span>
                ❌
            {/if}
        </button>
    </div>
</div>
