<script lang="ts">
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';
    import type { ChartConfiguration, TooltipItem, ChartOptions, ChartType } from 'chart.js';
    import type { ChartProps } from './types';
    import { formatDate, formatValue, calculateGrowth } from './utils/chartUtils';
    import { theme, colors, marginColors } from './utils/chartConfig';
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
            
            // Special handling for Net Income Margin
            if (metric.name === 'Net Income Margin') {
                const color = marginColors[0];
                // Create a semi-transparent version of the color
                const transparentColor = color + '60'; // 30% opacity
                return {
                    type: 'line' as const,
                    label: metric.name,
                    data: allDates.map(date => dateValueMap.get(date) ?? null),
                    borderColor: transparentColor,
                    backgroundColor: 'transparent',
                    borderWidth: 2.5,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    pointBackgroundColor: color,
                    pointBorderColor: color,
                    yAxisID: 'y1',
                    order: 0, // Draw on top
                    tension: 0.2, // Slight curve for better visibility
                    fill: false
                };
            }

            return {
                type: 'bar' as const,
                label: metric.name,
                data: allDates.map(date => dateValueMap.get(date) ?? null),
                backgroundColor: `${colors[index]}CC`,
                borderColor: colors[index],
                borderWidth: 1,
                borderRadius: 4,
                barPercentage: 0.85,
                categoryPercentage: 0.8,
                yAxisID: 'y',
                order: index + 1
            };
        });

        const config = {
            type: 'bar' as const,
            data: {
                labels: allDates.map(formatDate),
                datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                normalized: true,
                animation: {
                    duration: 300
                },
                interaction: {
                    mode: 'index' as const,
                    intersect: false
                },
                plugins: {
                    tooltip: {
                        backgroundColor: darkMode ? '#374151' : '#FFFFFF',
                        titleColor: darkMode ? '#F3F4F6' : '#111827',
                        bodyColor: darkMode ? '#F3F4F6' : '#111827',
                        borderColor: darkMode ? '#4B5563' : '#E5E7EB',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            title(items: TooltipItem<ChartType>[]) {
                                if (!items.length) return '';
                                const date = new Date(items[0].label);
                                return date.toLocaleDateString('en-US', { 
                                    year: 'numeric',
                                    month: 'long'
                                });
                            },
                            label(context: TooltipItem<ChartType>) {
                                const value = context.raw;
                                if (value === null || typeof value !== 'number') return '';
                                const formattedValue = context.dataset.label === 'Net Income Margin' 
                                    ? `${value.toFixed(2)}%`
                                    : formatValue(value);
                                const percentChange = calculateGrowth(context.dataset.data as number[], context.dataIndex);
                                return `${context.dataset.label}: ${formattedValue}${percentChange}`;
                            }
                        }
                    },
                    legend: {
                        position: 'top' as const,
                        align: 'start' as const,
                        labels: {
                            color: currentTheme.text,
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: currentTheme.border,
                            lineWidth: 0.5
                        },
                        ticks: {
                            color: currentTheme.text,
                            padding: 8,
                            maxRotation: 0,
                            autoSkip: true,
                            autoSkipPadding: 20
                        }
                    },
                    y: {
                        type: 'linear' as const,
                        position: 'left' as const,
                        grid: {
                            color: currentTheme.border,
                            lineWidth: 0.5
                        },
                        ticks: {
                            color: currentTheme.text,
                            padding: 12,
                            callback: (value: any) => formatValue(value),
                            font: {
                                size: 12,
                                weight: 500
                            },
                            maxTicksLimit: 8
                        }
                    },
                    y1: {
                        type: 'linear' as const,
                        position: 'right' as const,
                        grid: {
                            drawOnChartArea: false
                        },
                        ticks: {
                            color: marginColors[0] + '80', // Match line transparency
                            padding: 12,
                            callback: (value: any) => `${value.toFixed(1)}%`,
                            font: {
                                size: 12,
                                weight: 500
                            },
                            maxTicksLimit: 8
                        },
                        display: datasets.some(d => d.yAxisID === 'y1'), // Only show if margin is present
                        min: 0 // Start from 0 for better margin visualization
                    }
                }
            }
        };

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
    <div class="h-[600px]">
        <canvas bind:this={canvas}></canvas>
    </div>
    
    {#if showGrowthRates && metrics.length > 0}
        <GrowthRates {metrics} />
    {/if}
</div>
