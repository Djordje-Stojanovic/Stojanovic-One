import { colors } from '../utils/chartConfig';
import type { ChartProps } from '../types';
import { getMarginColor } from './chartUtils';

export function createDatasets(metrics: ChartProps['metrics'], allDates: string[]) {
    return metrics.map((metric, index) => {
        const dateValueMap = new Map(metric.data.map(d => [d.date, d.value]));
        const isMargin = metric.name.includes('Margin');
        
        if (isMargin) {
            const color = getMarginColor(metric.name);
            return {
                type: 'line' as const,
                label: metric.name,
                data: allDates.map(date => dateValueMap.get(date) ?? null),
                borderColor: color,
                backgroundColor: 'transparent',
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
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
            backgroundColor: `${colors[index]}CC`,
            borderColor: colors[index],
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
