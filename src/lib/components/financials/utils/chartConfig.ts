import type { ChartOptions } from 'chart.js';

export const theme = {
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

// Regular chart colors (removed last 3)
export const colors = [
    '#3B82F6', // Blue - Primary
    '#10B981', // Emerald - Growth
    '#F59E0B', // Amber - Warning
    '#EF4444', // Red - Danger
    '#8B5CF6', // Purple - Royal
    '#EC4899', // Pink - Vibrant
    '#06B6D4'  // Cyan - Info
];

// Special colors for margin lines - sophisticated and modern
export const marginColors = [
    '#E879F9', // Soft Neon Purple - modern but not harsh
    '#2DD4BF', // Refined Teal - professional and distinct
    '#FB923C'  // Soft Orange - warm and visible
];

export function createChartOptions(currentTheme: typeof theme.dark | typeof theme.light): ChartOptions<'bar'> {
    return {
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
                    title: function(items) {
                        if (!items.length) return '';
                        const date = new Date(items[0].label);
                        return date.toLocaleDateString('en-US', { 
                            year: 'numeric',
                            month: 'long'
                        });
                    },
                    label: function(context) {
                        return context.formattedValue;
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
                    count: 8,
                    callback: function(value) {
                        return value;
                    }
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
            duration: 200
        },
        layout: {
            padding: {
                top: 20,
                right: 15,
                bottom: 5,
                left: 5
            }
        }
    } as const;
}
