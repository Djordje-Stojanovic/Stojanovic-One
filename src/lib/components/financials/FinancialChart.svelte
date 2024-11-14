<script lang="ts">
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';
    import type { ChartProps } from './types';
    
    export let metrics: ChartProps['metrics'] = [];
    export let darkMode: ChartProps['darkMode'] = true;

    const colors = [
        '#3B82F6', // blue
        '#10B981', // green
        '#F59E0B', // yellow
        '#EF4444', // red
        '#8B5CF6', // purple
        '#EC4899', // pink
        '#06B6D4', // cyan
        '#F97316'  // orange
    ];
    
    let canvas: HTMLCanvasElement;
    let chart: Chart;

    $: if (chart && metrics) {
        // Get all unique dates across all metrics
        const allDates = [...new Set(metrics.flatMap(m => m.data.map(d => d.date)))].sort();
        
        chart.data.labels = allDates.map(formatDate);
        chart.data.datasets = metrics.map((metric, index) => ({
            label: metric.name,
            data: allDates.map(date => {
                const dataPoint = metric.data.find(d => d.date === date);
                return dataPoint ? dataPoint.value : null;
            }),
            backgroundColor: colors[index % colors.length],
            borderColor: colors[index % colors.length],
            borderWidth: 1,
            borderRadius: 4,
            barThickness: 32,
            maxBarThickness: 40
        }));
        chart.update();
    }

    function formatDate(dateStr: string) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric',
            month: 'short'
        });
    }

    function formatValue(value: number | string): string {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numValue)) return '';
        
        if (Math.abs(numValue) >= 1e9) {
            return `${(numValue / 1e9).toFixed(2)}B`;
        } else if (Math.abs(numValue) >= 1e6) {
            return `${(numValue / 1e6).toFixed(2)}M`;
        } else if (Math.abs(numValue) >= 1e3) {
            return `${(numValue / 1e3).toFixed(2)}K`;
        }
        return numValue.toFixed(2);
    }

    onMount(() => {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: []
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                color: darkMode ? '#F9FAFB' : '#111827',
                                padding: 20,
                                usePointStyle: true,
                                pointStyle: 'circle'
                            }
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            backgroundColor: darkMode ? '#374151' : '#F3F4F6',
                            titleColor: darkMode ? '#F9FAFB' : '#111827',
                            bodyColor: darkMode ? '#F9FAFB' : '#111827',
                            borderColor: darkMode ? '#4B5563' : '#E5E7EB',
                            borderWidth: 1,
                            padding: 12,
                            callbacks: {
                                label: function(context: any) {
                                    const value = context.raw;
                                    if (value === null || typeof value !== 'number') {
                                        return '';
                                    }
                                    return `${context.dataset.label}: ${formatValue(value)}`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            border: {
                                display: false
                            },
                            grid: {
                                color: darkMode ? '#374151' : '#F3F4F6',
                                lineWidth: 1
                            },
                            ticks: {
                                color: darkMode ? '#F9FAFB' : '#111827',
                                padding: 8,
                                callback: function(value: any) {
                                    return formatValue(value);
                                }
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            border: {
                                display: false
                            },
                            ticks: {
                                color: darkMode ? '#F9FAFB' : '#111827',
                                padding: 8
                            },
                            reverse: true // Newest dates on the right
                        }
                    },
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    animation: {
                        duration: 200
                    }
                }
            });
        }

        return () => {
            if (chart) {
                chart.destroy();
            }
        };
    });
</script>

<div class="w-full h-[400px] bg-white dark:bg-[#1F2937] rounded-lg p-4 shadow-sm dark:shadow-lg">
    <canvas bind:this={canvas}></canvas>
</div>
