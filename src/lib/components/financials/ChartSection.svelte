<script lang="ts">
    import { chartStore } from '$lib/stores/chartStore';
    import FinancialChart from './FinancialChart.svelte';

    export let selectedPeriod: 'annual' | 'quarterly' | 'ttm';

    // Track if chart was previously shown to prevent unwanted hiding
    let wasShown = $chartStore.showChart;

    $: {
        // Only update wasShown when chart is shown, not when hidden
        if ($chartStore.showChart) {
            wasShown = true;
        }
    }

    // Only show margin toggle when Net Income is selected
    $: showMarginToggle = $chartStore.selectedMetricNames.includes('Net Income');

    function handleMarginToggle() {
        chartStore.toggleNetIncomeMargin();
        // Immediately trigger a metrics update with the last known financial data
        if ($chartStore.lastFinancialData) {
            chartStore.updateMetrics($chartStore.lastFinancialData);
        }
    }
</script>

{#if $chartStore.showChart && $chartStore.selectedMetrics.length > 0}
    <div class="mb-6 bg-white dark:bg-[#1F2937] rounded-lg shadow-lg dark:shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center space-x-4">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Financial Metrics Chart</h3>
                {#if showMarginToggle}
                    <label class="inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            class="sr-only peer"
                            checked={$chartStore.showNetIncomeMargin}
                            on:change={handleMarginToggle}
                        >
                        <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        <span class="ms-3 text-sm font-medium text-gray-800 dark:text-gray-200">Show Margin</span>
                    </label>
                {/if}
            </div>
            <button 
                class="text-sm px-3 py-1.5 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                on:click={() => {
                    chartStore.clearChart();
                    wasShown = false;
                }}
            >
                Close Chart
            </button>
        </div>
        <div class="p-4">
            <FinancialChart 
                metrics={$chartStore.selectedMetrics}
                showGrowthRates={selectedPeriod === 'ttm'}
            />
        </div>
    </div>
{/if}
