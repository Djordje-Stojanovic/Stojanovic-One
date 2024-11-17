<script lang="ts">
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';
    import type { ChartProps } from './types';
    import { formatDate, formatValue, calculateGrowth } from './utils/chartUtils';
    import { theme, colors, createChartOptions } from './utils/chartConfig';
    
    export let metrics: ChartProps['metrics'] = [];
    export let darkMode: ChartProps['darkMode'] = true;
    
    let canvas: HTMLCanvasElement;
    let chart: Chart;

    function createChart() {
        if (!canvas) return;
        
        if (chart) {
            chart.destroy();
        }
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const currentTheme = darkMode ? theme.dark : theme.light;

        // Create gradients for each color
        const gradients = colors.map(color => {
            const gradient = ctx.createLinearGradient(0, 0, 0, 500);
            gradient.addColorStop(0, `${color}E6`);
            gradient.addColorStop(1, `${color}99`);
            return gradient;
        });

        // Create hover gradients
        const hoverGradients = colors.map(color => {
            const gradient = ctx.createLinearGradient(0, 0, 0, 500);
            gradient.addColorStop(0, `${color}FF`);
            gradient.addColorStop(1, `${color}CC`);
            return gradient;
        });

        // Prepare data
        const allDates = [...new Set(metrics.flatMap(m => m.data.map(d => d.date)))].sort();
        const datasets = metrics.map((metric, index) => ({
            label: metric.name,
            data: allDates.map(date => {
                const dataPoint = metric.data.find(d => d.date === date);
                return dataPoint ? dataPoint.value : null;
            }),
            backgroundColor: gradients[index % gradients.length],
            hoverBackgroundColor: hoverGradients[index % hoverGradients.length],
            borderColor: colors[index % colors.length],
            borderWidth: 0,
            borderRadius: 3,
            barThickness: 14,
            maxBarThickness: 14,
            barPercentage: 0.8,
            categoryPercentage: 0.6,
            order: index
        }));

        const options = createChartOptions(currentTheme);
        
        // Add custom callbacks
        const tooltipCallbacks = {
            title: function(items: any[]) {
                if (!items.length) return '';
                const date = new Date(items[0].label);
                return date.toLocaleDateString('en-US', { 
                    year: 'numeric',
                    month: 'long'
                });
            },
            label: function(context: any) {
                const value = context.raw;
                if (value === null || typeof value !== 'number') {
                    return '';
                }
                const formattedValue = formatValue(value);
                const percentChange = calculateGrowth(context.dataset.data, context.dataIndex);
                return `${context.dataset.label}: ${formattedValue}${percentChange}`;
            }
        };

        const yAxisCallback = function(value: any) {
            return formatValue(value);
        };

        // Type assertion to handle possibly undefined properties
        const chartOptions = {
            ...options,
            plugins: {
                ...options.plugins,
                tooltip: {
                    ...options.plugins?.tooltip,
                    callbacks: tooltipCallbacks
                }
            },
            scales: {
                ...options.scales,
                y: {
                    ...options.scales?.y,
                    ticks: {
                        ...options.scales?.y?.ticks,
                        callback: yAxisCallback
                    }
                }
            }
        };

        // Create chart
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: allDates.map(formatDate),
                datasets
            },
            options: chartOptions
        });
    }

    onMount(() => {
        if (metrics.length > 0) {
            createChart();
        }
        return () => {
            if (chart) {
                chart.destroy();
            }
        };
    });

    // Watch metrics changes
    $: if (metrics.length > 0) {
        createChart();
    }
</script>

<div class="w-full h-[500px] bg-white dark:bg-[#1F2937] rounded-lg p-2 shadow-sm dark:shadow-lg">
    <canvas bind:this={canvas}></canvas>
</div>
