<script lang="ts">
import { chartStore } from '$lib/stores/financial-charts';
import type { ReturnMetricType } from '$lib/stores/financial-charts/types/ChartTypes';
import { returnMetricColors } from '../utils/chartConfig';

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

function toggleReturnMetric(metric: ReturnMetricOption) {
    chartStore.toggleReturnMetric(metric.id);
}

$: returnMetricStates = $chartStore.returnMetrics;
</script>

<div class="w-full flex items-center">
    <div class="flex-grow flex flex-wrap gap-2 items-center justify-center">
        {#each returnMetrics as metric}
            <button
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200
                       border border-transparent hover:bg-opacity-10 focus:outline-none"
                class:bg-opacity-10={returnMetricStates[metric.id]}
                style="color: {metric.color}; 
                       background-color: {returnMetricStates[metric.id] ? metric.color.replace(')', ', 0.1)').replace('rgb', 'rgba') : 'transparent'};
                       border-color: {returnMetricStates[metric.id] ? metric.color : 'transparent'}"
                on:click={() => toggleReturnMetric(metric)}
            >
                <span class="w-1.5 h-1.5 rounded-full mr-1.5" style="background-color: {metric.color}"></span>
                {metric.name}
            </button>
        {/each}
    </div>
</div>
