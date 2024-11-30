<script lang="ts">
    import { chartStore } from '$lib/stores/financial-charts';
    import FinancialChart from './FinancialChart.svelte';
    import MarginSelector from './margins/MarginSelector.svelte';
    import { formatValue } from './utils/chartUtils';
    import { colors, marginColors } from './utils/chartConfig';
    import type { FinancialData } from '$lib/types/financialStatements';

    export let allFinancialData: FinancialData;

    $: showChart = $chartStore.showChart;
    $: darkMode = true;

    interface GrowthRate {
        name: string;
        oneYear: string;
        twoYear: string;
        fiveYear: string;
        color: string;
    }

    const EXCLUDED_MARGINS = [
        'Net Income Margin',
        'Gross Profit Margin',
        'Operating Margin',
        'EBITDA Margin',
        'FCF Margin',
        'Op. Cash Flow Margin'
    ];

    function getCompleteMetricData(metricName: string) {
        // Get complete data for the metric from allFinancialData
        const statements = allFinancialData?.income_statements || [];
        const quarterlyData = statements
            .filter(stmt => stmt.period !== 'FY' && stmt.period !== 'TTM')
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        return quarterlyData.map(stmt => ({
            date: stmt.date,
            value: stmt[metricName.toLowerCase().replace(/ /g, '_') as keyof typeof stmt] as number
        }));
    }

    function shouldShowGrowthRate(metricName: string): boolean {
        return !EXCLUDED_MARGINS.includes(metricName);
    }

    function calculateGrowthRates(metrics: any[]): GrowthRate[] {
        const results: GrowthRate[] = [];
        for (const metric of metrics) {
            if (!metric.hidden && shouldShowGrowthRate(metric.name)) {
                // Get complete data for calculations
                const allData = getCompleteMetricData(metric.name);
                
                if (allData.length >= 21) {  // Need at least 21 quarters for 5Y calculation
                    const current = allData[allData.length - 1].value;
                    const oneYearAgo = allData[allData.length - 5]?.value;
                    const twoYearAgo = allData[allData.length - 9]?.value;
                    const fiveYearAgo = allData[allData.length - 21]?.value;
                    
                    const oneYear = oneYearAgo !== undefined && oneYearAgo !== 0 ? 
                        ((current - oneYearAgo) / Math.abs(oneYearAgo)) * 100 : null;
                    const twoYear = twoYearAgo !== undefined && twoYearAgo !== 0 ? 
                        (Math.pow(current / twoYearAgo, 1/2) - 1) * 100 : null;
                    const fiveYear = fiveYearAgo !== undefined && fiveYearAgo !== 0 ? 
                        (Math.pow(current / fiveYearAgo, 1/5) - 1) * 100 : null;

                    const isMargin = metric.name.includes('Margin');
                    const colorIndex: number = isMargin 
                        ? Math.floor(results.length % marginColors.length)
                        : Math.floor(results.length % colors.length);
                    const color: string = isMargin ? marginColors[colorIndex] : colors[colorIndex];
                    
                    results.push({
                        name: metric.name,
                        oneYear: oneYear !== null ? oneYear.toFixed(1) : 'N/A',
                        twoYear: twoYear !== null ? twoYear.toFixed(1) : 'N/A',
                        fiveYear: fiveYear !== null ? fiveYear.toFixed(1) : 'N/A',
                        color
                    });
                }
            }
        }
        return results;
    }

    $: growthRates = calculateGrowthRates($chartStore.selectedMetrics);
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
                            1Y: <span class={Number(rate.oneYear) >= 0 ? 'text-green-500' : 'text-red-500'}>
                                {rate.oneYear}%
                            </span>
                        </span>
                        <span class="whitespace-nowrap">
                            2Y: <span class={Number(rate.twoYear) >= 0 ? 'text-green-500' : 'text-red-500'}>
                                {rate.twoYear}%
                            </span>
                        </span>
                        <span class="whitespace-nowrap">
                            5Y: <span class={Number(rate.fiveYear) >= 0 ? 'text-green-500' : 'text-red-500'}>
                                {rate.fiveYear}%
                            </span>
                        </span>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
{/if}
