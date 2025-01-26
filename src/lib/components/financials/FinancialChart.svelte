<script lang="ts">
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';
    import type { ChartEvent, LegendItem } from 'chart.js';
    import type { ChartProps } from './types';
    import { getChartConfig } from './chart/chartConfig';
    import GrowthRates from './GrowthRates.svelte';
    import { chartStore } from '$lib/stores/financial-charts';
    import { theme } from './utils/chartConfig';
    import PriceChart from './chart/PriceChart.svelte';
    import 'chartjs-adapter-date-fns';
    
    export let metrics: ChartProps['metrics'] = [];
    export let darkMode: ChartProps['darkMode'] = true;
    export let showGrowthRates: boolean = false;
    
    let canvas: HTMLCanvasElement;
    let chart: Chart | null = null;
    let isUpdating = false;

    // Check if price chart should be shown
    $: priceMetric = $chartStore.selectedMetrics.find(m => m.name === 'Stock Price');
    $: showPriceChart = !!priceMetric && !priceMetric.hidden;

    function handleLegendClick(e: ChartEvent, legendItem: LegendItem, legend: Chart['legend']) {
        const index = legendItem.datasetIndex;
        if (index !== undefined && chart?.data.datasets[index] && legend?.chart) {
            const dataset = chart.data.datasets[index];
            const label = dataset.label || '';
            
            chartStore.toggleMetricVisibility(label);
            
            const ci = legend.chart;
            if (ci.isDatasetVisible(index)) {
                ci.hide(index);
            } else {
                ci.show(index);
            }
            ci.update();
        }
    }

    function updateChart() {
        if (!canvas || !metrics.length || isUpdating) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const currentTheme = darkMode ? theme.dark : theme.light;

        // Filter out price and valuation metrics from main chart
        const filteredMetrics = metrics.filter(m => {
            const name = m.name || '';
            return name !== 'Stock Price' && 
                !['P/E Ratio', 'FCF Yield', 'P/S Ratio', 'EV/EBITDA', 'P/GP Ratio'].includes(name);
        });

        // Get all unique dates and sort them
        const allDates = [...new Set(filteredMetrics.flatMap(m => m.data.map(d => d.date)))].sort();

        isUpdating = true;
        try {
            const config = getChartConfig(filteredMetrics, darkMode, allDates, currentTheme, handleLegendClick);

            if (chart) {
                chart.data = config.data;
                chart.options = config.options;
                chart.update('none');
            } else {
                chart = new Chart(ctx, config);
            }
        } finally {
            isUpdating = false;
        }
    }

    // Watch metrics changes
    $: if (metrics.length > 0 && !isUpdating) {
        updateChart();
    }

    onMount(() => {
        if (metrics.length > 0) {
            updateChart();
        }
        return () => {
            if (chart) {
                chart.destroy();
                chart = null;
            }
        };
    });
</script>

<div class="w-full bg-white dark:bg-[#1F2937] rounded-lg">
    {#if showPriceChart}
        <PriceChart {darkMode} />
    {/if}
    
    <div class="h-[600px]">
        <canvas bind:this={canvas}></canvas>
    </div>
    
    {#if showGrowthRates && metrics.length > 0}
        <GrowthRates {metrics} />
    {/if}
</div>
