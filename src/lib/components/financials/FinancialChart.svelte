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
    ];
    
    let canvas: HTMLCanvasElement;
    let chart: Chart;

    function createChart() {
        if (!canvas) return;
        
        // Destroy existing chart if it exists
        if (chart) {
            chart.destroy();
        }
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Get current theme
        const currentTheme = darkMode ? theme.dark : theme.light;

        // Create gradients for each color
        const gradients = colors.map(color => {
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, `${color}FF`);
            gradient.addColorStop(1, `${color}90`);
            return gradient;
        });

        // Create hover gradients
        const hoverGradients = colors.map(color => {
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, `${color}B0`);
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
            barPercentage: 0.9,
            categoryPercentage: 0.8,
            order: index
        }));

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
                        enabled: true,
                        position: 'nearest',
                        mode: 'index',
                        intersect: false,
                        backgroundColor: currentTheme.background,
                        titleColor: currentTheme.text,
                        bodyColor: currentTheme.text,
                        borderColor: currentTheme.border,
                        borderWidth: 1,
                        padding: {
                            top: 10,
                            right: 15,
                            bottom: 10,
                            left: 15
                        },
                        cornerRadius: 4,
                        titleFont: {
                            size: 13,
                            weight: 600
                        },
                        bodyFont: {
                            size: 12
                        },
                        displayColors: true,
                        boxWidth: 8,
                        boxHeight: 8,
                        boxPadding: 4,
                        callbacks: {
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
                                return `${context.dataset.label}: ${formatValue(value)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        grid: {
                            display: false
                        },
                        border: {
                            display: false
                        },
                        ticks: {
                            color: currentTheme.text,
                            font: {
                                size: 11
                            },
                            padding: 8,
                            maxRotation: 0
                        }
                    },
                    y: {
                        stacked: true,
                        position: 'right',
                        grid: {
                            color: `${currentTheme.border}20`,
                            lineWidth: 0.5,
                            display: true
                        },
                        border: {
                            display: false
                        },
                        ticks: {
                            color: currentTheme.text,
                            padding: 12,
                            align: 'center',
                            crossAlign: 'center',
                            font: {
                                size: 11,
                                weight: 500
                            },
                            callback: function(value: any) {
                                return formatValue(value);
                            },
                            maxTicksLimit: 6
                        }
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                hover: {
                    mode: 'index',
                    intersect: false
                },
                animation: {
                    duration: 200,
                    easing: 'easeOutQuart'
                },
                layout: {
                    padding: {
                        top: 20,
                        right: 15,
                        bottom: 0,
                        left: 10
                    }
                }
            }
        });
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
        
        const absValue = Math.abs(numValue);
        if (absValue >= 1e9) {
            return `${(numValue / 1e9).toFixed(1)}B`;
        } else if (absValue >= 1e6) {
            return `${(numValue / 1e6).toFixed(1)}M`;
        } else if (absValue >= 1e3) {
            return `${(numValue / 1e3).toFixed(1)}K`;
        }
        return numValue.toFixed(1);
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

<div class="w-full h-[400px] bg-white dark:bg-[#1F2937] rounded-lg p-4 shadow-sm dark:shadow-lg">
    <canvas bind:this={canvas}></canvas>
</div>
