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
    import { getHistoricalPrices } from '$lib/services/stockPriceService';
    import { page } from '$app/stores';
    import { loadSelectedYears } from './state/chartState';
    import 'chartjs-adapter-date-fns';
    
    export let metrics: ChartProps['metrics'] = [];
    export let darkMode: ChartProps['darkMode'] = true;
    export let showGrowthRates: boolean = false;
    
    let canvas: HTMLCanvasElement;
    let chart: Chart | null = null;
    let priceData: any[] = [];
    let showPriceChart = false;

    // Subscribe to chartStore to detect price selection/deselection
    $: {
        const priceMetric = $chartStore.selectedMetrics.find(m => m.name === 'Stock Price');
        if (priceMetric && !showPriceChart) {
            loadPriceData();
        } else if (!priceMetric && showPriceChart) {
            showPriceChart = false;
            priceData = [];
        }
    }

    async function loadPriceData() {
        try {
            const symbol = $page.params.symbol;
            const years = loadSelectedYears();
            const prices = await getHistoricalPrices(symbol, years);
            if (prices.length > 0) {
                // Sort prices by date ascending
                priceData = [...prices].sort((a, b) => 
                    new Date(a.date).getTime() - new Date(b.date).getTime()
                );
                showPriceChart = true;
            }
        } catch (error) {
            console.error('Error loading price data:', error);
        }
    }

    function handleLegendClick(e: ChartEvent, legendItem: LegendItem, legend: Chart['legend']) {
        const index = legendItem.datasetIndex;
        if (index !== undefined && chart?.data.datasets[index] && legend?.chart) {
            const dataset = chart.data.datasets[index];
            const label = dataset.label || '';
            
            // Use the store's toggleMetricVisibility action
            chartStore.toggleMetricVisibility(label);
            
            // Update chart visibility
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
        if (!canvas || !metrics.length) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const currentTheme = darkMode ? theme.dark : theme.light;

        // Filter out price metric from main chart when showing price chart
        const filteredMetrics = metrics.filter(m => m.name !== 'Stock Price');

        // Get all unique dates and sort them
        const allDates = [...new Set(filteredMetrics.flatMap(m => m.data.map(d => d.date)))].sort();

        // Get chart configuration
        const config = getChartConfig(filteredMetrics, darkMode, allDates, currentTheme, handleLegendClick);

        if (chart) {
            // Update existing chart
            chart.data = config.data;
            chart.options = config.options;
            chart.update('none');
        } else {
            // Create new chart
            chart = new Chart(ctx, config);
        }
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

    // Watch metrics changes
    $: if (metrics.length > 0) {
        updateChart();
    }
</script>

<div class="w-full bg-white dark:bg-[#1F2937] rounded-lg">
    {#if showPriceChart && priceData.length > 0}
        <PriceChart 
            {priceData} 
            {darkMode} 
            onClose={() => {
                showPriceChart = false;
                priceData = [];
                chartStore.handleMetricClick('Stock Price', [], []);
            }} 
        />
    {/if}
    
    <div class="h-[600px]">
        <canvas bind:this={canvas}></canvas>
    </div>
    
    {#if showGrowthRates && metrics.length > 0}
        <GrowthRates {metrics} />
    {/if}
</div>
