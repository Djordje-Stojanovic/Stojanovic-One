<script lang="ts">
    import { chartStore, getFieldName, financialFieldMap } from '$lib/stores/financial-charts';
    import { extractMetricData, extractSegmentData } from '$lib/stores/financial-charts/utils/DataProcessing';
    import FinancialChart from './FinancialChart.svelte';
    import MarginSelector from './margins/MarginSelector.svelte';
    import ReturnMetricsSelector from './returns/ReturnMetricsSelector.svelte';
    import PriceSelector from './PriceSelector.svelte';
    import ValuationMetricsSelector from './valuation/ValuationMetricsSelector.svelte';
    import { formatValue, calculateMultiYearGrowth } from './utils/chartUtils';
    import { colors } from './utils/chartConfig';
    import { getMarginColor } from './chart/chartUtils';
    import type { FinancialData } from '$lib/types/financialStatements';
    import type { ChartDataPoint, ChartMetric } from '$lib/stores/financial-charts/types/ChartTypes';

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

    function getCompleteMetricData(metricName: string): ChartDataPoint[] {
        let data: ChartDataPoint[] = [];
        
        // First try revenue segments and geographic segments since they use raw names
        if (allFinancialData?.revenue_segments && allFinancialData.revenue_segments.length > 0) {
            const segments = allFinancialData.revenue_segments;
            if (segments.some(stmt => metricName in stmt.segments)) {
                data = segments
                    .map(stmt => ({
                        date: stmt.date,
                        value: stmt.segments[metricName] || 0
                    }))
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            }
        }
        
        if (data.length === 0 && allFinancialData?.revenue_geo_segments && allFinancialData.revenue_geo_segments.length > 0) {
            const geoSegments = allFinancialData.revenue_geo_segments;
            if (geoSegments.some(stmt => metricName in stmt.segments)) {
                data = geoSegments
                    .map(stmt => ({
                        date: stmt.date,
                        value: stmt.segments[metricName] || 0
                    }))
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            }
        }

        // If no segment data found, try financial statements using field mapping
        if (data.length === 0) {
            const fieldName = getFieldName(metricName);
            
            // Try income statements
            if (allFinancialData?.income_statements?.length > 0 && 
                fieldName in allFinancialData.income_statements[0]) {
                data = extractMetricData(
                    allFinancialData.income_statements.filter(stmt => stmt.period !== 'FY' && stmt.period !== 'TTM'),
                    fieldName
                );
            }
            // Try balance sheets
            else if (allFinancialData?.balance_sheets?.length > 0 && 
                     fieldName in allFinancialData.balance_sheets[0]) {
                data = extractMetricData(
                    allFinancialData.balance_sheets.filter(stmt => stmt.period !== 'FY' && stmt.period !== 'TTM'),
                    fieldName
                );
            }
            // Try cash flow statements
            else if (allFinancialData?.cash_flow_statements?.length > 0 && 
                     fieldName in allFinancialData.cash_flow_statements[0]) {
                data = extractMetricData(
                    allFinancialData.cash_flow_statements.filter(stmt => stmt.period !== 'FY' && stmt.period !== 'TTM'),
                    fieldName
                );
            }
        }

        return data;
    }

    function calculateGrowthRates(metrics: ChartMetric[]): GrowthRate[] {
        const results: GrowthRate[] = [];
        metrics.forEach((metric, index) => {
            if (!metric.hidden && !metric.name.includes('Margin') && !['ROIC', 'ROCE', 'ROE', 'ROA', 'Stock Price'].includes(metric.name)) {
                // Get complete data for calculations
                const allData = getCompleteMetricData(metric.name);
                
                // Only proceed if we have enough data points
                if (allData.length >= 4) {  // Need at least 4 quarters of data
                    // Calculate growth rates using the more robust calculateMultiYearGrowth function
                    const oneYear = calculateMultiYearGrowth(allData, 1);
                    const twoYear = calculateMultiYearGrowth(allData, 2);
                    const fiveYear = calculateMultiYearGrowth(allData, 5);

                    // Use the same color logic as DatasetManager
                    const color = colors[index];
                    
                    results.push({
                        name: metric.name,
                        oneYear: oneYear !== null ? oneYear.toFixed(1) : 'N/A',
                        twoYear: twoYear !== null ? twoYear.toFixed(1) : 'N/A',
                        fiveYear: fiveYear !== null ? fiveYear.toFixed(1) : 'N/A',
                        color
                    });
                }
            }
        });
        return results;
    }

    $: growthRates = calculateGrowthRates($chartStore.selectedMetrics);
</script>

{#if showChart}
    <div class="space-y-2">
        <MarginSelector />
        <ReturnMetricsSelector />
        <ValuationMetricsSelector />
        <PriceSelector />
    </div>
    <div class="bg-white dark:bg-[#1F2937] rounded-lg">
        <FinancialChart 
            metrics={$chartStore.selectedMetrics}
            {darkMode}
        />
    </div>
    
    {#if growthRates.length > 0}
        <div class="flex flex-wrap justify-center gap-4 mt-2 text-sm">
            {#each growthRates as rate}
                <div class="flex flex-col items-center mx-2">
                    <span style="color: {rate.color}" class="font-medium mb-1">{rate.name}</span>
                    <div class="flex flex-col gap-0.5 items-center">
                        <div class="flex items-center gap-2">
                            <span class="text-gray-400 dark:text-gray-500">1Y:</span>
                            <span class={Number(rate.oneYear) >= 0 ? 'text-green-500' : 'text-red-500'}>
                                {rate.oneYear}%
                            </span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-gray-400 dark:text-gray-500">2Y:</span>
                            <span class={Number(rate.twoYear) >= 0 ? 'text-green-500' : 'text-red-500'}>
                                {rate.twoYear}%
                            </span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-gray-400 dark:text-gray-500">5Y:</span>
                            <span class={Number(rate.fiveYear) >= 0 ? 'text-green-500' : 'text-red-500'}>
                                {rate.fiveYear}%
                            </span>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
{/if}
