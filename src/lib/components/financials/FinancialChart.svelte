<script lang="ts">
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';
    import type { ChartConfiguration, TooltipItem, ChartOptions } from 'chart.js';
    import type { ChartProps } from './types';
    import { formatDate, formatValue, calculateGrowth } from './utils/chartUtils';
    import { theme, colors } from './utils/chartConfig';
    import GrowthRates from './GrowthRates.svelte';
    
    export let metrics: ChartProps['metrics'] = [];
    export let darkMode: ChartProps['darkMode'] = true;
    export let showGrowthRates: boolean = false;
    
    let canvas: HTMLCanvasElement;
    let chart: Chart | null = null;

    function updateChart() {
        if (!canvas || !metrics.length) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const currentTheme = darkMode ? theme.dark : theme.light;

        // Get all unique dates and sort them
        const allDates = [...new Set(metrics.flatMap(m => m.data.map(d => d.date)))].sort();

        // Create datasets
        const datasets = metrics.map((metric, index) => {
            const dateValueMap = new Map(metric.data.map(d => [d.date, d.value]));
            
            return {
                type: 'bar' as const,
                label: metric.name,
                data: allDates.map(date => dateValueMap.get(date) ?? null),
                backgroundColor: `${colors[index]}E6`,
                borderColor: colors[index],
                borderWidth: 0,
                borderRadius: 3,
                barPercentage: 0.9,
                categoryPercentage: 0.8,
                yAxisID: 'y',
                order: index
            };
        });

        const chartOptions: ChartOptions<'bar'> = {
            responsive: true,
            maintainAspectRatio: false,
            normalized: true,
            animation: {
                duration: 0
            },
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        title(items: TooltipItem<'bar'>[]) {
                            if (!items.length) return '';
                            const date = new Date(items[0].label);
                            return date.toLocaleDateString('en-US', { 
                                year: 'numeric',
                                month: 'long'
                            });
                        },
                        label(context: TooltipItem<'bar'>) {
                            const value = context.raw;
                            if (value === null || typeof value !== 'number') return '';
                            const formattedValue = formatValue(value);
                            const percentChange = calculateGrowth(context.dataset.data as number[], context.dataIndex);
                            return `${context.dataset.label}: ${formattedValue}${percentChange}`;
                        }
                    }
                },
                legend: {
                    position: 'top',
                    labels: {
                        color: currentTheme.text
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: currentTheme.border
                    },
                    ticks: {
                        color: currentTheme.text
                    }
                },
                y: {
                    grid: {
                        color: currentTheme.border
                    },
                    ticks: {
                        color: currentTheme.text,
                        callback: (value: any) => formatValue(value)
                    }
                }
            }
        };

        const config: ChartConfiguration<'bar'> = {
            type: 'bar',
            data: {
                labels: allDates.map(formatDate),
                datasets
            },
            options: chartOptions
        };

        if (chart) {
            // Update existing chart
            chart.data = config.data;
            chart.options = chartOptions;
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

<div class="w-full bg-white dark:bg-[#1F2937] rounded-lg p-2 shadow-sm dark:shadow-lg">
    <div class="h-[500px]">
        <canvas bind:this={canvas}></canvas>
    </div>
    
    {#if showGrowthRates && metrics.length > 0}
        <GrowthRates {metrics} />
    {/if}
</div>
