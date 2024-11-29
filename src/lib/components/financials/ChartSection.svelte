<script lang="ts">
    import { chartStore } from '$lib/stores/financial-charts';
    import FinancialChart from './FinancialChart.svelte';
    import MarginSelector from './margins/MarginSelector.svelte';

    $: showChart = $chartStore.showChart;
    $: darkMode = true;
</script>

{#if showChart}
    <MarginSelector />
    <div class="bg-white dark:bg-[#1F2937] rounded-lg">
        <FinancialChart 
            metrics={$chartStore.selectedMetrics}
            {darkMode}
        />
    </div>
{/if}
