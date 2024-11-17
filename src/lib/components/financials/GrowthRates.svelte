<script lang="ts">
    import { calculateMultiYearGrowth, formatGrowthRate } from './utils/chartUtils';
    import type { ChartMetric } from './types';

    export let metrics: ChartMetric[] = [];
    
    // Calculate growth rates for each metric
    $: growthRates = metrics.map(metric => {
        const oneYear = calculateMultiYearGrowth(metric.data, 1);
        const twoYear = calculateMultiYearGrowth(metric.data, 2);
        const fiveYear = calculateMultiYearGrowth(metric.data, 5);
        const tenYear = calculateMultiYearGrowth(metric.data, 10);
        
        return {
            name: metric.name,
            rates: [
                { period: '1Y', rate: oneYear },
                { period: '2Y', rate: twoYear },
                { period: '5Y', rate: fiveYear },
                { period: '10Y', rate: tenYear }
            ].filter((r): r is { period: string; rate: number } => r.rate !== null) // Type guard to ensure rate is number
        };
    });
</script>

<div class="mt-4 space-y-2">
    {#each growthRates as { name, rates }}
        <div class="flex items-center space-x-4 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span class="font-medium text-gray-700 dark:text-gray-300 min-w-[200px]">{name}:</span>
            <div class="flex space-x-4">
                {#each rates as { period, rate }}
                    <div class="px-3 py-1 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                        <span class="text-sm text-gray-600 dark:text-gray-400">{period}:</span>
                        <span class="ml-1 font-medium {rate > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
                            {formatGrowthRate(rate)}
                        </span>
                    </div>
                {/each}
            </div>
        </div>
    {/each}
</div>
