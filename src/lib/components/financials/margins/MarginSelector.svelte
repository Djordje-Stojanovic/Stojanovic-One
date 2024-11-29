<script lang="ts">
import { chartStore } from '$lib/stores/financial-charts';
import type { MarginType } from '$lib/stores/financial-charts/types/ChartTypes';
import { marginColors } from '../utils/chartConfig';

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
        color: marginColors[0] + '80'
    },
    {
        id: 'fcf',
        name: 'FCF Margin',
        color: marginColors[1] + '80'
    },
    {
        id: 'operatingCashFlow',
        name: 'Op. Cash Flow Margin',
        color: marginColors[2] + '80'
    }
];

function toggleMargin(margin: MarginOption) {
    chartStore.toggleMargin(margin.id);
}

$: marginStates = $chartStore.margins;
</script>

<div class="flex flex-wrap gap-2 items-center">
    {#each margins as margin}
        <button
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200
                   border border-transparent hover:bg-opacity-10 focus:outline-none"
            class:bg-opacity-10={marginStates[margin.id]}
            style="color: {margin.color}; 
                   background-color: {marginStates[margin.id] ? margin.color + '20' : 'transparent'};
                   border-color: {marginStates[margin.id] ? margin.color : 'transparent'}"
            on:click={() => toggleMargin(margin)}
        >
            <span class="w-1.5 h-1.5 rounded-full mr-1.5" style="background-color: {margin.color}"></span>
            {margin.name}
        </button>
    {/each}
    <button
        class="ml-auto p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        on:click={() => chartStore.clearChart()}
        title="Close Chart"
    >
        <svg class="w-4 h-4 text-gray-600 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
    </button>
</div>
