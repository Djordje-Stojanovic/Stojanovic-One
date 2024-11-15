<script lang="ts">
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';
    import type { ChartProps } from './types';
    
    export let metrics: ChartProps['metrics'] = [];
    export let darkMode: ChartProps['darkMode'] = true;

    // Theme colors from AI.MD
    const theme = {
        dark: {
            background: '#1F2937',
            secondary: '#374151',
            text: '#F9FAFB',
            border: '#4B5563',
            accent: '#3B82F6'
        },
        light: {
            background: '#FFFFFF',
            secondary: '#F3F4F6',
            text: '#111827',
            border: '#E5E7EB',
            accent: '#2563EB'
        }
    };

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

    function createChart() {
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Get current theme
        const currentTheme = darkMode ? theme.dark : theme.light;

        // Prepare data
        const allDates = [...new Set(metrics.flatMap(m => m.data.map(d => d.date)))].sort();
        const datasets = metrics.map((metric, index) => ({
            label: metric.name,
            data: allDates.map(date => {
                const dataPoint = metric.data.find(d => d.date === date);
                return dataPoint ? dataPoint.value : null;
            }),
            backgroundColor: colors[index % colors.length],
            borderColor: colors[index % colors.length],
            borderWidth: 2,
            borderRadius: 4,
            barThickness: 32,
            maxBarThickness: 40
        }));

        console.log('Creating chart with data:', { allDates, datasets });

        // Create chart
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: allDates.map(formatDate),
                datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'start',
                        labels: {
                            boxWidth: 12,
                            boxHeight: 12,
                            padding: 20,
                            color: currentTheme.text,
                            font: {
                                size: 12,
                                weight: 500
                            },
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: currentTheme.secondary,
                        titleColor: currentTheme.text,
                        bodyColor: currentTheme.text,
                        borderColor: currentTheme.border,
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 4,
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
                    x: {
                        grid: {
                            display: false
                        },
                        border: {
                            display: false
                        },
                        ticks: {
                            color: currentTheme.text,
                            font: {
                                size: 12
                            },
                            padding: 8
                        }
                    },
                    y: {
                        position: 'right',
                        grid: {
                            color: currentTheme.secondary,
                            lineWidth: 1,
                            display: true
                        },
                        border: {
                            display: false
                        },
                        ticks: {
                            color: currentTheme.text,
                            padding: 8,
                            font: {
                                size: 12
                            },
                            callback: function(value: any) {
                                return formatValue(value);
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                animation: {
                    duration: 200
                },
                layout: {
                    padding: {
                        top: 20,
                        right: 20,
                        bottom: 0,
                        left: 0
                    }
                }
            }
        });
    }

    function updateChart() {
        if (!chart || !metrics.length) return;

        const allDates = [...new Set(metrics.flatMap(m => m.data.map(d => d.date)))].sort();
        
        const datasets = metrics.map((metric, index) => ({
            label: metric.name,
            data: allDates.map(date => {
                const dataPoint = metric.data.find(d => d.date === date);
                return dataPoint ? dataPoint.value : null;
            }),
            backgroundColor: colors[index % colors.length],
            borderColor: colors[index % colors.length],
            borderWidth: 2,
            borderRadius: 4,
            barThickness: 32,
            maxBarThickness: 40
        }));

        console.log('Updating chart with data:', { allDates, datasets });

        chart.data.labels = allDates.map(formatDate);
        chart.data.datasets = datasets;
        chart.update('none');
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
            return `${(numValue / 1e9).toFixed(1)}B`;
        } else if (Math.abs(numValue) >= 1e6) {
            return `${(numValue / 1e6).toFixed(1)}M`;
        } else if (Math.abs(numValue) >= 1e3) {
            return `${(numValue / 1e3).toFixed(1)}K`;
        }
        return numValue.toFixed(1);
    }

    onMount(() => {
        if (metrics.length > 0) {
            console.log('Mounting chart with metrics:', metrics);
            createChart();
        }
        return () => {
            if (chart) {
                chart.destroy();
            }
        };
    });

    // Watch metrics changes
    $: {
        console.log('Metrics changed:', metrics);
        if (metrics.length > 0) {
            if (!chart) {
                createChart();
            } else {
                updateChart();
            }
        }
    }
</script>

<div class="w-full h-[400px] bg-white dark:bg-[#1F2937] rounded-lg p-4 shadow-sm dark:shadow-lg">
    <canvas bind:this={canvas}></canvas>
</div>
