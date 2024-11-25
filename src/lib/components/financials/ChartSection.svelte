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
</script>

{#if $chartStore.showChart && $chartStore.selectedMetrics.length > 0}
    <div class="mb-6 bg-white dark:bg-[#1F2937] rounded-lg shadow-lg dark:shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Financial Metrics Chart</h3>
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
