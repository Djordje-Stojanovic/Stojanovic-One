import { colors } from '../utils/chartConfig';
import type { ChartProps } from '../types';
import { getMarginColor, getReturnMetricColor } from './chartUtils';

export function createDatasets(metrics: ChartProps['metrics'], allDates: string[]) {
    return metrics.map((metric, index) => {
        const dateValueMap = new Map(metric.data.map(d => [d.date, d.value]));
        const isMargin = metric.name.includes('Margin');
        const isReturnMetric = ['ROIC', 'ROCE', 'ROE', 'ROA'].includes(metric.name);
        const isPrice = metric.name === 'Stock Price';
        const isValuation = ['P/E Ratio', 'FCF Yield', 'P/S Ratio', 'EV/EBITDA', 'P/GP Ratio', 'P/B Ratio', 'P/Tangible B'].includes(metric.name);
        
        if (isMargin || isReturnMetric || isPrice || isValuation) {
            let color;
            if (isMargin) {
                color = getMarginColor(metric.name);
            } else if (isReturnMetric) {
                color = getReturnMetricColor(metric.name);
            } else if (isPrice) {
                color = '#10B981'; // Emerald color for price
            } else {
                // Valuation metrics colors
                switch (metric.name) {
                    case 'P/E Ratio':
                        color = '#9333EA'; // Purple
                        break;
                    case 'FCF Yield':
                        color = '#06B6D4'; // Cyan
                        break;
                    case 'P/S Ratio':
                        color = '#F59E0B'; // Amber
                        break;
                    case 'EV/EBITDA':
                        color = '#3B82F6'; // Blue
                        break;
                    case 'P/GP Ratio':
                        color = '#10B981'; // Emerald
                        break;
                    case 'P/B Ratio':
                        color = '#DC2626'; // Red-600
                        break;
                    case 'P/Tangible B':
                        color = '#DB2777'; // Pink-600
                        break;
                    default:
                        color = colors[index % colors.length];
                }
            }

            // Use raw values for price and valuation metrics
            const data = allDates.map(date => dateValueMap.get(date) ?? null);

            return {
                type: 'line' as const,
                label: metric.name,
                data,
                borderColor: isPrice ? `rgba(16, 185, 129, 0.3)` : color,
                backgroundColor: 'transparent',
                borderWidth: isPrice ? 1 : 2.5,
                pointRadius: 0, // Hide points by default for cleaner lines
                pointHoverRadius: 6, // Show points only on hover
                pointBackgroundColor: color,
                pointBorderColor: color,
                yAxisID: isPrice || isValuation ? 'y2' : 'y1',
                order: isPrice ? 3 : isValuation ? 2 : 0,
                tension: 0.2,
                hidden: metric.hidden,
                z: isPrice ? -1 : isValuation ? -0.5 : 0
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
