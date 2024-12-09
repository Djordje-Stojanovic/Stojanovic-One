<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import Chart from 'chart.js/auto';
    import type { Chart as ChartType } from 'chart.js';
    import { getPriceChartConfig } from './priceChartConfig';
    import { theme } from '../utils/chartConfig';
    import { chartStore } from '$lib/stores/financial-charts';
    import { loadSelectedYears } from '../state/chartState';
    import type { StockPrice } from '$lib/types/stockPrices';
    import 'chartjs-adapter-date-fns';
    
    export let priceData: StockPrice[] = [];
    export let darkMode: boolean = true;
    
    let canvas: HTMLCanvasElement;
    let chart: ChartType | null = null;
    let isUpdating = false;

    // Subscribe to both store changes and priceData
    $: selectedYears = loadSelectedYears();
    $: priceMetric = $chartStore.selectedMetrics.find(m => m.name === 'Stock Price');
    $: if ((selectedYears || priceMetric) && canvas && !isUpdating) {
        updateChart();
    }

    function handleClose() {
        chartStore.handleMetricClick('Stock Price', [], []);
    }

    function updateChart() {
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const currentTheme = darkMode ? theme.dark : theme.light;
        
        // Calculate date range based on selected years
        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(endDate.getFullYear() - selectedYears);

        const config = getPriceChartConfig(priceData, darkMode, currentTheme, startDate.getTime(), endDate.getTime());

        if (chart) {
            isUpdating = true;
            try {
                if (config.data) {
                    chart.data = config.data;
                }
                if (config.options) {
                    chart.options = config.options;
                }
                chart.update('none');
            } finally {
                isUpdating = false;
            }
        } else {
            chart = new Chart(ctx, config);
        }
    }

    onMount(() => {
        updateChart();
    });

    onDestroy(() => {
        if (chart) {
            chart.destroy();
            chart = null;
        }
    });
</script>

<div class="w-full bg-white dark:bg-[#1F2937] rounded-lg mb-4 relative">
    <div class="absolute top-2 right-2 z-10">
        <button 
            on:click={handleClose}
            class="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
            title="Close price chart"
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
        </button>
    </div>
    <div class="h-[300px] pt-2 px-4">
        <canvas bind:this={canvas}></canvas>
    </div>
</div>
