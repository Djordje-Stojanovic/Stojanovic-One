import { formatDate, formatValue, calculateGrowth } from '../utils/chartUtils';
import { createDatasets } from './DatasetManager';
import type { TooltipItem, ChartType, ChartEvent, LegendItem, Chart } from 'chart.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getChartConfig(metrics: any[], darkMode: boolean | undefined, allDates: string[], currentTheme: any, onLegendClick: (e: ChartEvent, legendItem: LegendItem, legend: Chart['legend']) => void) {
    const isDarkMode = darkMode ?? true; // Default to true if undefined
    const datasets = createDatasets(metrics, allDates);

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
                            const formattedValue = isPercentage
                                ? `${value.toFixed(2)}%`
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
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                        color: currentTheme.text,
                        padding: 12,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        callback: (value: any) => `${value.toFixed(1)}%`,
                        font: {
                            size: 12,
                            weight: 500
                        },
                        maxTicksLimit: 8
                    },
                    display: datasets.some(d => d.yAxisID === 'y1'),
                    min: 0,
                    max: 100 // Set max to 100% for percentage metrics
                }
            }
        }
    };
}
