<script lang="ts">
import { chartStore } from '$lib/stores/financial-charts';
import type { MarginType } from '$lib/stores/financial-charts/types/ChartTypes';
import { marginColors } from '../utils/chartConfig';
import type { FinancialData } from '$lib/types/financialStatements';

export let financialData: FinancialData;

interface MarginOption {
    id: MarginType;
    name: string;
    color: string;
}

const margins: MarginOption[] = [
    {
        id: 'netIncome',
        name: 'Net Income Margin',
        color: marginColors[0]
    },
    {
        id: 'grossProfit',
        name: 'Gross Profit Margin',
        color: marginColors[1]
    },
    {
        id: 'operating',
        name: 'Operating Margin',
        color: marginColors[2]
    },
    {
        id: 'ebitda',
        name: 'EBITDA Margin',
        color: marginColors[3]
    },
    {
        id: 'fcf',
        name: 'FCF Margin',
        color: marginColors[4]
    },
    {
        id: 'operatingCashFlow',
        name: 'Op. Cash Flow Margin',
        color: marginColors[5]
    }
];

let loadingMargin: MarginType | null = null;
let errorMargin: MarginType | null = null;

$: marginStates = $chartStore.margins;

function isDataReady(margin: MarginOption): boolean {
    // If we have financialData, allow the click - the actual margin calculation
    // will handle any missing data gracefully
    return !!financialData;
}

function toggleMargin(margin: MarginOption) {
    if (loadingMargin) return;
    if (!financialData) return;
    
    try {
        chartStore.toggleMargin(margin.id);
    } catch (error) {
        console.error('Error toggling margin:', error);
    }
}
</script>

<div class="w-full flex items-center">
    <div class="flex-grow flex flex-wrap gap-2 items-center justify-center">
        {#each margins as margin}
            {@const isDisabled = loadingMargin === margin.id || errorMargin === margin.id || !isDataReady(margin)}
            <button
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200
                       border border-transparent {!isDisabled && 'hover:bg-opacity-10'} focus:outline-none
                       {isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
                class:bg-opacity-10={marginStates[margin.id]}
                style="color: {margin.color}; 
                       background-color: {marginStates[margin.id] ? margin.color.replace(')', ', 0.1)').replace('rgb', 'rgba') : 'transparent'};
                       border-color: {marginStates[margin.id] ? margin.color : 'transparent'}"
                on:click={() => toggleMargin(margin)}
                disabled={isDisabled}
            >
                <span class="w-1.5 h-1.5 rounded-full mr-1.5" style="background-color: {margin.color}"></span>
                {margin.name}
                {#if loadingMargin === margin.id}
                    <span class="inline-block animate-pulse">...</span>
                {:else if errorMargin === margin.id}
                    <span class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap animate-fade-in z-50 shadow-lg">
                        {!isDataReady(margin) ? 'Loading financial data...' : `Failed to calculate ${margin.name}`}
                    </span>
                    ❌
                {/if}
            </button>
        {/each}
    </div>
    <button
        class="flex-shrink-0 ml-4 p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        on:click={() => chartStore.clearChart()}
        title="Close Chart"
    >
        <svg class="w-4 h-4 text-gray-600 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
    </button>
</div>
