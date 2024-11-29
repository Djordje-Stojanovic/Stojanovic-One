import type { ChartMetric, ChartDataPoint } from '../types/ChartTypes';

/**
 * Creates a chart metric from raw data
 * @param name Display name of the metric
 * @param dates Array of dates
 * @param values Array of corresponding values
 * @returns ChartMetric object
 */
export function createChartMetric(name: string, dates: string[], values: number[]): ChartMetric {
    const data: ChartDataPoint[] = dates
        .map((date, index) => ({
            date,
            value: values[index]
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
        name,
        data
    };
}
