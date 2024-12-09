import { formatDate, formatValue, calculateGrowth } from '../utils/chartUtils';
import { createDatasets } from './DatasetManager';
import type { TooltipItem, ChartType, ChartEvent, LegendItem, Chart, Scale, CoreScaleOptions } from 'chart.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getChartConfig(metrics: any[], darkMode: boolean | undefined, allDates: string[], currentTheme: any, onLegendClick: (e: ChartEvent, legendItem: LegendItem, legend: Chart['legend']) => void) {
    const isDarkMode = darkMode ?? true; // Default to true if undefined
    const datasets = createDatasets(metrics, allDates);

    // Find visible percentage and price metrics
    const percentageDatasets = datasets.filter(d => {
        const label = d.label || '';
        return (label.includes('Margin') || ['ROIC', 'ROCE', 'ROE', 'ROA'].includes(label)) && !d.hidden;
    });
    
    const priceDatasets = datasets.filter(d => {
        const label = d.label || '';
        return label === 'Stock Price' && !d.hidden;
    });

    const visibleNonPercentageDatasets = datasets.filter(d => {
        const label = d.label || '';
        return !label.includes('Margin') && !['ROIC', 'ROCE', 'ROE', 'ROA', 'Stock Price'].includes(label) && !d.hidden;
    });

    // Determine which axis should show grid lines
    const showLeftGridLines = visibleNonPercentageDatasets.length > 0;
    const showRightGridLines = !showLeftGridLines && percentageDatasets.length > 0;
    
    let minValue = -50; // Updated default minimum to -50%
    let maxValue = 100; // Default maximum

    if (percentageDatasets.length > 0) {
        const allValues = percentageDatasets.flatMap(d => d.data.filter(v => v !== null) as number[]);
        if (allValues.length > 0) {
            const dataMin = Math.min(...allValues);
            const dataMax = Math.max(...allValues);
            const range = dataMax - dataMin;
            const padding = range * 0.15;
            minValue = Math.max(dataMin - padding, -50);
            maxValue = Math.min(dataMax + padding, 100);
            minValue = Math.floor(minValue / 5) * 5;
            maxValue = Math.ceil(maxValue / 5) * 5;
        }
    }

    // Calculate price axis range
    let minPrice = 0;
    let maxPrice = 100;
    if (priceDatasets.length > 0) {
        const allPrices = priceDatasets.flatMap(d => d.data.filter(v => v !== null) as number[]);
        if (allPrices.length > 0) {
            const priceMin = Math.min(...allPrices);
            const priceMax = Math.max(...allPrices);
            const priceRange = priceMax - priceMin;
            const pricePadding = priceRange * 0.15;
            minPrice = Math.max(0, priceMin - pricePadding);
            maxPrice = priceMax + pricePadding;
        }
    }

    return {
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
                    backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
                    titleColor: isDarkMode ? '#F3F4F6' : '#111827',
                    bodyColor: isDarkMode ? '#F3F4F6' : '#111827',
                    borderColor: isDarkMode ? '#4B5563' : '#E5E7EB',
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
                            const isPercentage = label.includes('Margin') || ['ROIC', 'ROCE', 'ROE', 'ROA'].includes(label);
                            const isPrice = label === 'Stock Price';
                            const formattedValue = isPercentage
                                ? `${value.toFixed(2)}%`
                                : isPrice
                                    ? `$${value.toFixed(2)}`
                                    : formatValue(value);

                            const growthRate = calculateGrowth(
                                context.dataset.data as number[], 
                                context.dataIndex
                            );

                            return `${label}: ${formattedValue}${growthRate}`;
                        }
                    }
                },
                legend: {
                    position: 'top' as const,
                    align: 'center' as const,
                    onClick: onLegendClick,
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
                        display: false
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
                        display: showLeftGridLines,
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        lineWidth: 1
                    },
                    ticks: {
                        color: currentTheme.text,
                        padding: 12,
                        callback: function(this: Scale<CoreScaleOptions>, tickValue: number | string) {
                            return formatValue(Number(tickValue));
                        },
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
                        display: showRightGridLines,
                        drawOnChartArea: true,
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        lineWidth: 1
                    },
                    ticks: {
                        color: currentTheme.text,
                        padding: 12,
                        callback: function(this: Scale<CoreScaleOptions>, tickValue: number | string) {
                            return `${Number(tickValue).toFixed(1)}%`;
                        },
                        font: {
                            size: 12,
                            weight: 500
                        },
                        maxTicksLimit: 8
                    },
                    display: percentageDatasets.length > 0,
                    min: minValue,
                    max: maxValue,
                    beginAtZero: false
                },
                y2: {
                    type: 'linear' as const,
                    position: 'right' as const,
                    grid: {
                        display: false // No grid lines for price axis
                    },
                    ticks: {
                        display: false // Hide price axis ticks
                    },
                    min: minPrice,
                    max: maxPrice,
                    beginAtZero: false
                }
            }
        }
    };
}
