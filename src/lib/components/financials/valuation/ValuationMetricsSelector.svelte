<script lang="ts">
    import { chartStore } from '$lib/stores/financial-charts';
    import { page } from '$app/stores';
    import { db } from '$lib/supabaseClient';
    import type { ValuationMetricType } from '$lib/stores/financial-charts/types/ChartTypes';
    import type { FinancialData } from '$lib/types/financialStatements';
    import type { ValuationMetricState } from '$lib/stores/financial-charts/types/ChartTypes';
    import { metricConfigs } from './config';
    import { calculatePERatio } from './metrics/peRatio';
    import { calculateFCFYield } from './metrics/fcfYield';
    import { calculatePSRatio } from './metrics/psRatio';
    import { calculateEVEBITDA } from './metrics/evEbitda';
    import { calculatePGPRatio } from './metrics/pgpRatio';

    let symbol = $page.params.symbol;
    let loadingMetric: ValuationMetricType | null = null;
    let errorMetric: ValuationMetricType | null = null;
    let valuationMetrics: ValuationMetricState = {
        pe: false,
        fcfYield: false,
        ps: false,
        evEbitda: false,
        pgp: false
    };
    export let financialData: FinancialData;

    $: valuationMetrics = $chartStore.valuationMetrics;

    const metricCalculators: Record<ValuationMetricType, (prices: any[], data: FinancialData) => { values: number[]; dates: string[] }> = {
        pe: calculatePERatio,
        fcfYield: calculateFCFYield,
        ps: calculatePSRatio,
        evEbitda: calculateEVEBITDA,
        pgp: calculatePGPRatio
    };

    function isValuationMetricType(type: string): type is ValuationMetricType {
        return type in metricCalculators;
    }

    function isDataReady(type: ValuationMetricType): boolean {
        return !!financialData;
    }

    async function handleMetricClick(type: string) {
        if (!isValuationMetricType(type)) return;
        if (loadingMetric) return;
        
        try {
            loadingMetric = type;

            if (!valuationMetrics[type]) {
                // Get stock prices with retry logic
                let retryCount = 0;
                let prices: any[] | null = null;
                
                while (retryCount < 3 && !prices) {
                    const { data, error } = await db.from('stock_prices')
                        .select('*')
                        .eq('symbol', symbol)
                        .order('date', { ascending: true });
                    
                    if (error) throw error;
                    if (data?.length) {
                        prices = data;
                        break;
                    }
                    
                    retryCount++;
                    if (retryCount < 3) {
                        await new Promise(resolve => setTimeout(resolve, 500 * retryCount));
                    }
                }

                if (!prices?.length) {
                    throw new Error('No price data available');
                }

                // Ensure financialData is not null before proceeding
                if (!financialData) {
                    throw new Error('Financial data not available');
                }

                try {
                    const calculator = metricCalculators[type];
                    const { values, dates } = calculator(prices, financialData);

                    if (!values.length || !dates.length) {
                        throw new Error('Calculation returned no data');
                    }

                    chartStore.handleMetricClick(metricConfigs[type].name, values, dates);
                    chartStore.toggleValuationMetric(type);
                } catch (calcError) {
                    console.error('Calculation error:', calcError);
                    throw new Error(`Failed to calculate ${metricConfigs[type].name}`);
                }
            } else {
                chartStore.handleMetricClick(metricConfigs[type].name, [], []);
                chartStore.toggleValuationMetric(type);
            }
        } catch (error) {
            console.error('Error in handleMetricClick:', error);
            errorMetric = type;
            setTimeout(() => {
                errorMetric = null;
            }, 2000);
        } finally {
            loadingMetric = null;
        }
    }

    // Reset when symbol changes
    $: if ($page.params.symbol !== symbol) {
        symbol = $page.params.symbol;
        Object.entries(valuationMetrics).forEach(([type, isActive]) => {
            if (isActive && isValuationMetricType(type)) {
                chartStore.handleMetricClick(metricConfigs[type].name, [], []);
                chartStore.toggleValuationMetric(type);
            }
        });
    }
</script>

<div class="w-full flex items-center">
    <div class="flex-grow flex flex-wrap gap-2 items-center justify-center">
        {#each Object.entries(metricConfigs) as [type, config]}
            {#if isValuationMetricType(type)}
                {@const isDisabled = loadingMetric === type || errorMetric === type || !isDataReady(type)}
            <button
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 border border-transparent {!isDisabled && 'hover:bg-opacity-10'} focus:outline-none {isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
                style="color: {config.color}; background-color: {valuationMetrics[type] ? config.bgColor : 'transparent'}; border-color: transparent;"
                on:click={() => handleMetricClick(type)}
                disabled={isDisabled}
            >
                <span class="w-1.5 h-1.5 rounded-full mr-1.5" style="background-color: {config.color};"></span>
                <span class="relative">
                    {config.name} 
                    {#if loadingMetric === type}
                        <span class="inline-block animate-pulse">...</span>
                    {:else if errorMetric === type}
                        <span class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap animate-fade-in z-50 shadow-lg">
                            {!isDataReady(type) ? 'Loading financial data...' : `No valid ${config.name} data`}
                        </span>
                        ❌
                    {/if}
                </span>
            </button>
            {/if}
        {/each}
    </div>
</div>
