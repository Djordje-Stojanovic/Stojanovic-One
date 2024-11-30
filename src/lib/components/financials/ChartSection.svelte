<script lang="ts">
    import { chartStore } from '$lib/stores/financial-charts';
    import FinancialChart from './FinancialChart.svelte';
    import MarginSelector from './margins/MarginSelector.svelte';
    import { formatValue } from './utils/chartUtils';
    import { colors, marginColors } from './utils/chartConfig';

    $: showChart = $chartStore.showChart;
    $: darkMode = true;

    interface GrowthRate {
        name: string;
        growth: string;
        color: string;
    }

    function calculateYoYGrowth(metrics: any[]): GrowthRate[] {
        const results: GrowthRate[] = [];
        for (const metric of metrics) {
            if (!metric.hidden && metric.data.length >= 4) {
                const current = metric.data[metric.data.length - 1].value;
                const yearAgo = metric.data[metric.data.length - 5]?.value;
                if (yearAgo && yearAgo !== 0) {
                    const growth = ((current - yearAgo) / Math.abs(yearAgo)) * 100;
                    const isMargin = metric.name.includes('Margin');
                    const colorIndex: number = isMargin 
                        ? Math.floor(results.length % marginColors.length)
                        : Math.floor(results.length % colors.length);
                    const color: string = isMargin ? marginColors[colorIndex] : colors[colorIndex];
                    
                    results.push({
                        name: metric.name,
                        growth: growth.toFixed(1),
                        color
                    });
                }
            }
        }
        return results;
    }

    $: growthRates = calculateYoYGrowth($chartStore.selectedMetrics);
</script>

{#if showChart}
    <MarginSelector />
    <div class="bg-white dark:bg-[#1F2937] rounded-lg">
        <FinancialChart 
            metrics={$chartStore.selectedMetrics}
            {darkMode}
        />
    </div>
    
    {#if growthRates.length > 0}
        <div class="flex justify-center gap-8 mt-2 text-sm">
            {#each growthRates as rate}
                <div class="flex items-center gap-2">
                    <span style="color: {rate.color}">{rate.name}</span>
                    <div class="flex items-center gap-4">
                        <span class="whitespace-nowrap">
                            YoY: <span class={Number(rate.growth) >= 0 ? 'text-green-500' : 'text-red-500'}>
                                {rate.growth}%
                            </span>
                        </span>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
{/if}
