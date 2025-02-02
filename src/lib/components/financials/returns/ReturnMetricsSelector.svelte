<script lang="ts">
import { chartStore } from '$lib/stores/financial-charts';
import type { ReturnMetricType } from '$lib/stores/financial-charts/types/ChartTypes';
import { returnMetricColors } from '../utils/chartConfig';
import type { FinancialData } from '$lib/types/financialStatements';

export let financialData: FinancialData;

interface ReturnMetricOption {
    id: ReturnMetricType;
    name: string;
    color: string;
}

const returnMetrics: ReturnMetricOption[] = [
    {
        id: 'roic',
        name: 'ROIC',
        color: returnMetricColors[0]
    },
    {
        id: 'roce',
        name: 'ROCE',
        color: returnMetricColors[1]
    },
    {
        id: 'roe',
        name: 'ROE',
        color: returnMetricColors[2]
    },
    {
        id: 'roa',
        name: 'ROA',
        color: returnMetricColors[3]
    }
];

let loadingMetric: ReturnMetricType | null = null;
let errorMetric: ReturnMetricType | null = null;

$: returnMetricStates = $chartStore.returnMetrics;

function isDataReady(metric: ReturnMetricOption): boolean {
    // If we have financialData, allow the click - the actual return metric calculation
    // will handle any missing data gracefully
    return !!financialData;
}

function toggleReturnMetric(metric: ReturnMetricOption) {
    if (loadingMetric) return;
    if (!financialData) return;
    
    try {
        chartStore.toggleReturnMetric(metric.id);
    } catch (error) {
        console.error('Error toggling return metric:', error);
    }
}
</script>

<div class="w-full flex items-center">
    <div class="flex-grow flex flex-wrap gap-2 items-center justify-center">
        {#each returnMetrics as metric}
            {@const isDisabled = loadingMetric === metric.id || errorMetric === metric.id || !isDataReady(metric)}
            <button
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200
                       border border-transparent {!isDisabled && 'hover:bg-opacity-10'} focus:outline-none
                       {isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
                class:bg-opacity-10={returnMetricStates[metric.id]}
                style="color: {metric.color}; 
                       background-color: {returnMetricStates[metric.id] ? metric.color.replace(')', ', 0.1)').replace('rgb', 'rgba') : 'transparent'};
                       border-color: {returnMetricStates[metric.id] ? metric.color : 'transparent'}"
                on:click={() => toggleReturnMetric(metric)}
                disabled={isDisabled}
            >
                <span class="w-1.5 h-1.5 rounded-full mr-1.5" style="background-color: {metric.color}"></span>
                {metric.name}
                {#if loadingMetric === metric.id}
                    <span class="inline-block animate-pulse">...</span>
                {:else if errorMetric === metric.id}
                    <span class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap animate-fade-in z-50 shadow-lg">
                        {!isDataReady(metric) ? 'Loading financial data...' : `Failed to calculate ${metric.name}`}
                    </span>
                    ❌
                {/if}
            </button>
        {/each}
    </div>
</div>
