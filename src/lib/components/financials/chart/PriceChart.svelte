<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import Chart from 'chart.js/auto';
    import type { Chart as ChartType } from 'chart.js';
    import { chartStore } from '$lib/stores/financial-charts';
    import { loadSelectedYears } from '../state/chartState';
    import 'chartjs-adapter-date-fns';
    
    export let darkMode: boolean = true;
    
    let canvas: HTMLCanvasElement;
    let chart: ChartType | null = null;
    let selectedYears = loadSelectedYears();
    let priceMetric = $chartStore.selectedMetrics.find(m => m.name === 'Stock Price');

    function handleClose() {
        chartStore.handleMetricClick('Stock Price', [], []);
    }

    function updateChart() {
        if (!canvas || !priceMetric?.data.length) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Calculate date range based on selected years
        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(endDate.getFullYear() - selectedYears);

        // Filter data based on selected years
        const filteredData = priceMetric.data.filter(d => {
            const date = new Date(d.date);
            return date >= startDate && date <= endDate;
        });

        const chartData = filteredData.map(d => ({
            x: new Date(d.date).getTime(),
            y: d.value
        }));

        if (chart) {
            chart.data.datasets[0].data = chartData;
            chart.options.scales!.x!.min = startDate.getTime();
            chart.options.scales!.x!.max = endDate.getTime();
            chart.update('none');
        } else {
            chart = new Chart(ctx, {
                type: 'line',
                data: {
                    datasets: [{
                        label: 'Stock Price',
                        data: chartData,
                        borderColor: '#10B981',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        pointHoverBackgroundColor: '#10B981',
                        tension: 0.4
                    }]
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
                                label: (context) => `$${context.parsed.y.toFixed(2)}`
                            }
                        },
                        legend: { display: false }
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
                        }
                    }
                }
            });
        }
    }

    // Watch for store changes
    $: {
        selectedYears = loadSelectedYears();
        priceMetric = $chartStore.selectedMetrics.find(m => m.name === 'Stock Price');
        if (priceMetric?.data.length) {
            updateChart();
        }
    }

    onMount(() => {
        if (priceMetric?.data.length) {
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
