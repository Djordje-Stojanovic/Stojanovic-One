import { colors } from '../utils/chartConfig';
import type { ChartProps } from '../types';
import { getMarginColor, getReturnMetricColor } from './chartUtils';

export function createDatasets(metrics: ChartProps['metrics'], allDates: string[]) {
    return metrics.map((metric, index) => {
        const dateValueMap = new Map(metric.data.map(d => [d.date, d.value]));
        const isMargin = metric.name.includes('Margin'); // Fixed: Remove toLowerCase()
        const isReturnMetric = ['ROIC', 'ROCE', 'ROE', 'ROA'].includes(metric.name);
        
        if (isMargin || isReturnMetric) {
            const color = isMargin ? getMarginColor(metric.name) : getReturnMetricColor(metric.name);
            // Ensure the line is visible on dark background
            return {
                type: 'line' as const,
                label: metric.name,
                data: allDates.map(date => dateValueMap.get(date) ?? null),
                borderColor: color,
                backgroundColor: 'transparent',
                borderWidth: 2.5,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: color,
                pointBorderColor: color,
                yAxisID: 'y1',
                order: 0,
                tension: 0.2,
                hidden: metric.hidden
            };
        }

        return {
            type: 'bar' as const,
            label: metric.name,
            data: allDates.map(date => dateValueMap.get(date) ?? null),
            backgroundColor: colors[index % colors.length],
            borderColor: colors[index % colors.length],
            borderWidth: 1,
            borderRadius: 4,
            barPercentage: 0.85,
            categoryPercentage: 0.8,
            yAxisID: 'y',
            order: index + 1,
            hidden: metric.hidden
        };
    });
}