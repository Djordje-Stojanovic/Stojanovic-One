<script lang="ts">
    import { chartStore } from '$lib/stores/financial-charts';
    import { page } from '$app/stores';
    import { db } from '$lib/supabaseClient';
    import type { ValuationMetricType } from '$lib/stores/financial-charts/types/ChartTypes';
    import type { FinancialData } from '$lib/types/financialStatements';
    import type { ValuationMetricState } from '$lib/stores/financial-charts/types/ChartTypes';
    import { loadSelectedYears, loadSelectedPeriod } from '../state/chartState';
    import { getHistoricalPrices } from '$lib/services/stockPriceService';
    import { metricConfigs } from './config';
import { calculatePERatio } from './metrics/peRatio';
import { calculateFCFYield } from './metrics/fcfYield';
import { calculatePSRatio } from './metrics/psRatio';
import { calculateEVEBITDA } from './metrics/evEbitda';
import { calculatePGPRatio } from './metrics/pgpRatio';
import { calculatePBRatio } from './metrics/pb';
import { calculatePTBRatio } from './metrics/ptb';
import { calculatePOIRatio } from './metrics/poi';

    let symbol = $page.params.symbol;
    let loadingMetric: ValuationMetricType | null = null;
    let errorMetric: ValuationMetricType | null = null;
    let selectedYears = loadSelectedYears();
    let selectedPeriod = loadSelectedPeriod();
    let valuationMetrics: ValuationMetricState = {
        pe: false,
        fcfYield: false,
        ps: false,
        evEbitda: false,
        pgp: false,
        pb: false,
        ptb: false,
        poi: false
    };
    export let financialData: FinancialData;

    $: valuationMetrics = $chartStore.valuationMetrics;

    const metricCalculators: Record<ValuationMetricType, (prices: any[], data: FinancialData) => { values: number[]; dates: string[] }> = {
        pe: calculatePERatio,
        fcfYield: calculateFCFYield,
        ps: calculatePSRatio,
        evEbitda: calculateEVEBITDA,
        pgp: calculatePGPRatio,
        pb: calculatePBRatio,
        ptb: calculatePTBRatio,
        poi: calculatePOIRatio
    };

    function isValuationMetricType(type: string): type is ValuationMetricType {
        return type in metricCalculators;
    }

    function isDataReady(type: ValuationMetricType): boolean {
        return !!financialData;
    }

    async function updateMetricData(type: ValuationMetricType) {
        if (loadingMetric || !valuationMetrics[type]) return;
        
        try {
            loadingMetric = type;
            const prices = await getHistoricalPrices(symbol, selectedYears);
            
            if (!prices?.length) {
                throw new Error('No price data available');
            }

            if (!financialData) {
                throw new Error('Financial data not available');
            }

            const calculator = metricCalculators[type];
            const { values, dates } = calculator(prices, financialData);

            if (!values.length || !dates.length) {
                throw new Error('Calculation returned no data');
            }

            // Update data without toggling the metric state
            chartStore.handleMetricClick(metricConfigs[type].name, values, dates);
            if (!valuationMetrics[type]) {
                chartStore.toggleValuationMetric(type);
            }
        } catch (error) {
            console.error('Error updating valuation metric:', error);
            errorMetric = type;
            setTimeout(() => {
                errorMetric = null;
            }, 2000);
        } finally {
            loadingMetric = null;
        }
    }

    async function handleMetricClick(type: string) {
        if (!isValuationMetricType(type)) return;
        if (loadingMetric) return;
        
        try {
            loadingMetric = type;

            if (!valuationMetrics[type]) {
                const prices = await getHistoricalPrices(symbol, selectedYears);
                
                if (!prices?.length) {
                    throw new Error('No price data available');
                }

                if (!financialData) {
                    throw new Error('Financial data not available');
                }

                const calculator = metricCalculators[type];
                const { values, dates } = calculator(prices, financialData);

                if (!values.length || !dates.length) {
                    throw new Error('Calculation returned no data');
                }

                chartStore.handleMetricClick(metricConfigs[type].name, values, dates);
                chartStore.toggleValuationMetric(type);
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

    // Update metrics when time period changes
    $: if ($chartStore.selectedYears !== selectedYears) {
        selectedYears = $chartStore.selectedYears;
        // Get currently active metrics before update
        const activeMetrics = Object.entries(valuationMetrics)
            .filter(([type, isActive]) => isActive && isValuationMetricType(type))
            .map(([type]) => type as ValuationMetricType);
        
        // Update each active metric
        activeMetrics.forEach(type => {
            updateMetricData(type);
        });
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
