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

            // Use raw price values for stock price, no conversion to percentage
            const data = allDates.map(date => dateValueMap.get(date) ?? null);

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
                yAxisID: isPrice ? 'y2' : 'y1', // Use separate axis for price
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
