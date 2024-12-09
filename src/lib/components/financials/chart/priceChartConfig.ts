import type { TooltipItem, ChartType, Scale, CoreScaleOptions, ChartConfiguration } from 'chart.js';
import type { StockPrice } from '$lib/types/stockPrices';
import { formatDate } from '../utils/chartUtils';
import { theme } from '../utils/chartConfig';
import 'chartjs-adapter-date-fns';

type ThemeType = typeof theme.dark | typeof theme.light;

export function getPriceChartConfig(priceData: StockPrice[], darkMode: boolean | undefined, currentTheme: ThemeType): ChartConfiguration {
    const isDarkMode = darkMode ?? true;

    // Calculate price axis range
    const allPrices = priceData.map(d => Number(d.adj_close)).filter((v): v is number => v !== null);
    const priceMin = Math.min(...allPrices);
    const priceMax = Math.max(...allPrices);
    const priceRange = priceMax - priceMin;
    const pricePadding = priceRange * 0.15;
    const minPrice = Math.max(0, priceMin - pricePadding);
    const maxPrice = priceMax + pricePadding;

    // Convert dates to timestamps for time scale
    const timestamps = priceData.map(d => new Date(d.date).getTime());
    const minDate = Math.min(...timestamps);
    const maxDate = Math.max(...timestamps);

    return {
        type: 'line',
        data: {
            datasets: [{
                label: 'Stock Price',
                data: priceData.map(d => ({
                    x: new Date(d.date).getTime(),
                    y: Number(d.adj_close)
                })),
                borderColor: '#10B981', // Green color for price line
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
            normalized: true,
            animation: {
                duration: 300
            },
            interaction: {
                mode: 'index',
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
                            const date = new Date(items[0].parsed.x);
                            return formatDate(date.toISOString().split('T')[0]);
                        },
                        label(context: TooltipItem<ChartType>) {
                            const value = context.parsed.y;
                            if (typeof value !== 'number') return '';
                            return `Price: $${value.toFixed(2)}`;
                        }
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'MMM d, yyyy'
                        }
                    },
                    min: minDate,
                    max: maxDate,
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
                    type: 'linear',
                    position: 'right',
                    grid: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        lineWidth: 1
                    },
                    ticks: {
                        color: currentTheme.text,
                        padding: 12,
                        callback: function(this: Scale<CoreScaleOptions>, tickValue: number | string) {
                            return `$${Number(tickValue).toFixed(2)}`;
                        },
                        font: {
                            size: 12,
                            weight: 500
                        }
                    },
                    min: minPrice,
                    max: maxPrice
                }
            }
        }
    };
}
