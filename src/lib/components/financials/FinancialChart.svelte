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
            barThickness: 14, // Thinner bars
            maxBarThickness: 14,
            barPercentage: 0.8, // More space between bar groups
            categoryPercentage: 0.6, // More space between categories
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
                        display: true,
                        position: 'top',
                        align: 'start',
                        onClick: function(e, legendItem, legend) {
                            const index = legendItem.datasetIndex;
                            const ci = legend.chart;
                            if (typeof index === 'number') {
                                if (ci.isDatasetVisible(index)) {
                                    ci.hide(index);
                                } else {
                                    ci.show(index);
                                }
                                ci.update();
                            }
                        },
                        labels: {
                            boxWidth: 12,
                            boxHeight: 12,
                            padding: 15,
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
                            top: 8,
                            right: 12,
                            bottom: 8,
                            left: 12
                        },
                        cornerRadius: 4,
                        titleFont: {
                            size: 12,
                            weight: 600
                        },
                        bodyFont: {
                            size: 11
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
                                const formattedValue = formatValue(value);
                                const percentChange = calculateGrowth(context.dataset.data, context.dataIndex);
                                return `${context.dataset.label}: ${formattedValue}${percentChange}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: false,
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
                            padding: 6,
                            maxRotation: 0
                        }
                    },
                    y: {
                        stacked: false,
                        position: 'right',
                        grid: {
                            color: `${currentTheme.border}15`,
                            lineWidth: 0.5,
                            display: true,
                            tickLength: 0,
                            drawTicks: false
                        },
                        border: {
                            display: false
                        },
                        ticks: {
                            color: currentTheme.text,
                            padding: 12,
                            align: 'end',
                            crossAlign: 'far',
                            font: {
                                size: 11,
                                weight: 500
                            },
                            callback: function(value: any) {
                                return formatValue(value);
                            },
                            count: 8
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
                        bottom: 5,
                        left: 5
                    }
                }
            }
        });
    }

    function calculateGrowth(data: number[], currentIndex: number): string {
        if (currentIndex < 0 || !data[currentIndex]) return '';
        
        // For YoY comparison, look back 4 quarters
        const prevIndex = currentIndex - 4;
        if (prevIndex < 0 || !data[prevIndex]) {
            // If no YoY data, try QoQ
            const prevQuarterIndex = currentIndex - 1;
            if (prevQuarterIndex < 0 || !data[prevQuarterIndex]) return '';
            
            const qoqGrowth = ((data[currentIndex] - data[prevQuarterIndex]) / Math.abs(data[prevQuarterIndex])) * 100;
            const qoqSign = qoqGrowth > 0 ? '+' : '';
            return ` (QoQ: ${qoqSign}${qoqGrowth.toFixed(1)}%)`;
        }
        
        const yoyGrowth = ((data[currentIndex] - data[prevIndex]) / Math.abs(data[prevIndex])) * 100;
        const yoySign = yoyGrowth > 0 ? '+' : '';
        return ` (YoY: ${yoySign}${yoyGrowth.toFixed(1)}%)`;
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

<div class="w-full h-[500px] bg-white dark:bg-[#1F2937] rounded-lg p-2 shadow-sm dark:shadow-lg">
    <canvas bind:this={canvas}></canvas>
</div>
