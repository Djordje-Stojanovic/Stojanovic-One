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

<div class="flex flex-wrap gap-2">
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
</div>
