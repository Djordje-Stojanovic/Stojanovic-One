<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import Chart from 'chart.js/auto';
    import type { Chart as ChartType } from 'chart.js';
    import { chartStore } from '$lib/stores/financial-charts';
    import { loadSelectedYears } from '../state/chartState';
    import 'chartjs-adapter-date-fns';

    function getMetricColor(name: string): string {
        switch (name) {
            case 'P/E Ratio':
                return '#9333EA'; // Purple
            case 'FCF Yield':
                return '#06B6D4'; // Cyan
            case 'P/S Ratio':
                return '#F59E0B'; // Amber
            case 'EV/EBITDA':
                return '#3B82F6'; // Blue
            case 'P/GP Ratio':
                return '#10B981'; // Emerald
            default:
                return '#6B7280'; // Gray
        }
    }
    
    export let darkMode: boolean = true;
    
    let canvas: HTMLCanvasElement;
    let chart: ChartType | null = null;
    let selectedYears = loadSelectedYears();
    let priceMetric = $chartStore.selectedMetrics.find(m => m.name === 'Stock Price');
    let valuationMetrics = $chartStore.selectedMetrics.filter(m => 
        ['P/E Ratio', 'FCF Yield', 'P/S Ratio', 'EV/EBITDA', 'P/GP Ratio'].includes(m.name)
    );

    // Deduplicate data points by date for each metric
    function deduplicateData(data: any[]) {
        const seen = new Set();
        return data.filter(d => {
            const dateStr = d.date;
            if (seen.has(dateStr)) {
                return false;
            }
            seen.add(dateStr);
            return true;
        });
    }

    function handleClose() {
        chartStore.handleMetricClick('Stock Price', [], []);
        // Clear any selected valuation metrics
        valuationMetrics.forEach(m => {
            chartStore.handleMetricClick(m.name, [], []);
        });
    }

    function updateChart() {
        if (!canvas || (!priceMetric?.data.length && !valuationMetrics.length)) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Calculate date range based on selected years
        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(endDate.getFullYear() - selectedYears);

        // Process price data if available
        const priceDataset = priceMetric ? {
            label: 'Stock Price',
            data: deduplicateData(priceMetric.data)
                .filter(d => {
                    const date = new Date(d.date);
                    return date >= startDate && date <= endDate;
                })
                .map(d => ({
                    x: new Date(d.date).getTime(),
                    y: d.value
                }))
                .sort((a, b) => a.x - b.x),
            borderColor: '#10B981',
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: '#10B981',
            yAxisID: 'y',
            tension: 0.4
        } : null;

        // Process valuation metrics data
        const valuationData = valuationMetrics.map(metric => {
            const filteredMetricData = deduplicateData(metric.data)
                .filter(d => {
                    const date = new Date(d.date);
                    return date >= startDate && date <= endDate;
                })
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            return {
                label: metric.name,
                data: filteredMetricData.map(d => ({
                    x: new Date(d.date).getTime(),
                    y: d.value
                })),
                borderColor: getMetricColor(metric.name),
                backgroundColor: 'transparent',
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4,
                yAxisID: 'y1',
                tension: 0.4
            };
        });

        // Destroy existing chart if it exists
        if (chart) {
            chart.destroy();
            chart = null;
        }

        // Create new chart
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [
                    ...(priceDataset ? [priceDataset] : []),
                    ...valuationData
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
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
                        callbacks: {
                            label: (context) => {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y as number;
                                if (label === 'Stock Price') {
                                    return `${label}: $${value.toFixed(2)}`;
                                } else if (label === 'FCF Yield') {
                                    return `${label}: ${value.toFixed(2)}%`;
                                } else {
                                    return `${label}: ${value.toFixed(2)}`;
                                }
                            }
                        }
                    },
                    legend: { 
                        display: true,
                        position: 'top',
                        labels: {
                            color: darkMode ? '#9CA3AF' : '#4B5563',
                            usePointStyle: true
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'month',
                            displayFormats: { month: 'MMM yyyy' }
                        },
                        min: startDate.getTime(),
                        max: endDate.getTime(),
                        grid: { display: false },
                        ticks: {
                            color: darkMode ? '#9CA3AF' : '#4B5563',
                            maxRotation: 0
                        }
                    },
                    y: {
                        position: 'right',
                        grid: {
                            color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: darkMode ? '#9CA3AF' : '#4B5563',
                            callback: (value) => `$${value}`
                        }
                    },
                    y1: {
                        position: 'left',
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: darkMode ? '#9CA3AF' : '#4B5563',
                            callback: (value) => typeof value === 'number' ? value.toFixed(1) : value
                        }
                    }
                }
            }
        });
    }

    // Watch for store changes
    $: {
        selectedYears = loadSelectedYears();
        priceMetric = $chartStore.selectedMetrics.find(m => m.name === 'Stock Price');
        valuationMetrics = $chartStore.selectedMetrics.filter(m => 
            ['P/E Ratio', 'FCF Yield', 'P/S Ratio', 'EV/EBITDA', 'P/GP Ratio'].includes(m.name) && !m.hidden
        );
        if (priceMetric?.data.length || valuationMetrics.length > 0) {
            updateChart();
        }
    }

    onMount(() => {
        if (priceMetric?.data.length || valuationMetrics.length > 0) {
            updateChart();
        }
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
            title="Close price/valuation chart"
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
