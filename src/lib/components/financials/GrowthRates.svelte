<script lang="ts">
    import { calculateMultiYearGrowth, formatGrowthRate } from './utils/chartUtils';
    import type { ChartMetric } from './types';

    export let metrics: ChartMetric[] = [];
    
    // Calculate growth rates for each metric
    $: growthRates = metrics.map(metric => {
        const oneYear = calculateMultiYearGrowth(metric.data, 1);
        const twoYear = calculateMultiYearGrowth(metric.data, 2);
        const fiveYear = calculateMultiYearGrowth(metric.data, 5);
        
        return {
            name: metric.name,
            rates: [
                { period: '1Y', rate: oneYear },
                { period: '2Y', rate: twoYear },
                { period: '5Y', rate: fiveYear }
            ].filter((r): r is { period: string; rate: number } => r.rate !== null)
        };
    });
</script>

<div class="flex flex-wrap gap-x-6 mt-1">
    {#each growthRates as { name, rates }}
        <div class="flex items-center">
            <span class="text-gray-400 text-xs w-[120px]">{name}:</span>
            {#each rates as { period, rate }}
                <div class="flex items-center w-[90px]">
                    <span class="text-gray-400 text-xs w-[20px]">{period}</span>
                    <span class="text-xs ml-1 {rate > 0 ? 'text-green-500' : 'text-red-500'} w-[60px]">
                        {formatGrowthRate(rate)}
                    </span>
                </div>
            {/each}
        </div>
    {/each}
</div>
