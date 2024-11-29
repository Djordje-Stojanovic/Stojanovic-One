<script lang="ts">
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';
    import type { ChartConfiguration, TooltipItem, ChartOptions, ChartType, ChartEvent, LegendItem } from 'chart.js';
    import type { ChartProps } from './types';
    import { formatDate, formatValue, calculateGrowth } from './utils/chartUtils';
    import { theme, colors, marginColors } from './utils/chartConfig';
    import GrowthRates from './GrowthRates.svelte';
    import { chartStore } from '$lib/stores/financial-charts';
    
    export let metrics: ChartProps['metrics'] = [];
    export let darkMode: ChartProps['darkMode'] = true;
    export let showGrowthRates: boolean = false;
    
    let canvas: HTMLCanvasElement;
    let chart: Chart | null = null;

    // Get consistent color for margin metrics
    function getMarginColor(metricName: string): string {
        const marginTypes = [
            'Net Income Margin',
            'Gross Profit Margin',
            'Operating Margin',
            'EBITDA Margin',
            'FCF Margin',
            'Op. Cash Flow Margin'
        ];
        const index = marginTypes.indexOf(metricName);
        return marginColors[index % marginColors.length];
    }

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
            
            // Check if this is a margin metric
            const isMargin = metric.name.includes('Margin');
            
            if (isMargin) {
                const color = getMarginColor(metric.name);
                return {
                    type: 'line' as const,
                    label: metric.name,
                    data: allDates.map(date => dateValueMap.get(date) ?? null),
                    borderColor: color,
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    pointBackgroundColor: color,
                    pointBorderColor: color,
                    yAxisID: 'y1',
                    order: 0,
                    tension: 0.2,
                    hidden: metric.hidden
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
                order: index + 1,
                hidden: metric.hidden
            };
        });

        const config = {
            type: 'bar' as const,
            data: {
                labels: allDates.map(date => formatDate(date)),
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
                        padding: 16,
                        cornerRadius: 8,
                        bodySpacing: 8,
                        callbacks: {
                            title(items: TooltipItem<ChartType>[]) {
                                if (!items.length) return '';
                                const date = allDates[items[0].dataIndex];
                                return formatDate(date);
                            },
                            label(context: TooltipItem<ChartType>) {
                                const value = context.raw;
                                if (value === null || typeof value !== 'number') return '';
                                
                                const label = context.dataset.label || '';
                                const isMargin = label.includes('Margin');
                                const formattedValue = isMargin
                                    ? `${value.toFixed(2)}%`
                                    : formatValue(value);

                                // Calculate growth rate
                                const growthRate = calculateGrowth(
                                    context.dataset.data as number[], 
                                    context.dataIndex
                                );

                                // Return formatted string with growth rate
                                return `${label}: ${formattedValue}${growthRate}`;
                            },
                            afterLabel(context: TooltipItem<ChartType>) {
                                // Add any additional TTM calculations if needed
                                const value = context.raw;
                                if (value === null || typeof value !== 'number') return '';
                                
                                const label = context.dataset.label || '';
                                if (label === 'Revenue' || label === 'Operating Income' || label === 'Net Income') {
                                    const data = context.dataset.data as number[];
                                    const ttmValue = calculateTTM(data, context.dataIndex);
                                    if (ttmValue !== null) {
                                        return `TTM: ${formatValue(ttmValue)}`;
                                    }
                                }
                                return '';
                            }
                        }
                    },
                    legend: {
                        position: 'top' as const,
                        align: 'center' as const,
                        onClick: (e: ChartEvent, legendItem: LegendItem, legend: Chart['legend']) => {
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
                        },
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
                            color: currentTheme.text, // Always use theme's text color for consistency
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

    function calculateTTM(data: number[], currentIndex: number): number | null {
        if (currentIndex < 3) return null;
        
        // Sum up the last 4 quarters
        const ttm = data.slice(currentIndex - 3, currentIndex + 1).reduce((sum, val) => {
            return val !== null ? sum + val : sum;
        }, 0);
        
        return ttm;
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
