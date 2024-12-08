import { colors } from '../utils/chartConfig';
import type { ChartProps } from '../types';
import { getMarginColor, getReturnMetricColor } from './chartUtils';

export function createDatasets(metrics: ChartProps['metrics'], allDates: string[]) {
    console.log('Creating datasets with metrics:', metrics.map(m => m.name));
    
    return metrics.map((metric, index) => {
        const dateValueMap = new Map(metric.data.map(d => [d.date, d.value]));
        const isMargin = metric.name.includes('Margin');
        const isReturnMetric = ['ROIC', 'ROCE', 'ROE', 'ROA'].includes(metric.name);
        const isPrice = metric.name === 'Stock Price';
        
        if (isMargin || isReturnMetric || isPrice) {
            const color = isMargin 
                ? getMarginColor(metric.name) 
                : isReturnMetric 
                    ? getReturnMetricColor(metric.name)
                    : '#10B981'; // Emerald color for price

            // Convert price values to percentage change from first value
            let data = allDates.map(date => dateValueMap.get(date) ?? null);
            if (isPrice && data.length > 0) {
                const firstValue = data.find(v => v !== null) || 1;
                data = data.map(v => v !== null ? ((v - firstValue) / firstValue) * 100 : null);
            }

            return {
                type: 'line' as const,
                label: metric.name,
                data,
                borderColor: color,
                backgroundColor: 'transparent',
                borderWidth: isPrice ? 1.5 : 2.5,
                pointRadius: isPrice ? 0 : 4,
                pointHoverRadius: isPrice ? 4 : 6,
                pointBackgroundColor: color,
                pointBorderColor: color,
                yAxisID: 'y1', // Use right axis for all line charts
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
