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
    <div class="mb-4 bg-white dark:bg-[#1F2937] rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div class="flex justify-end">
            <button 
                class="text-sm px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white transition-colors"
                on:click={() => {
                    chartStore.clearChart();
                    wasShown = false;
                }}
            >
                Close Chart
            </button>
        </div>
        <FinancialChart 
            metrics={$chartStore.selectedMetrics}
            showGrowthRates={selectedPeriod === 'ttm'}
        />
    </div>
{/if}
