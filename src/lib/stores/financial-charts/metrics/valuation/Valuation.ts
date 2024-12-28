import type { IncomeStatement } from '$lib/types/financialStatements';
import type { ChartMetric, ChartDataPoint } from '../../types/ChartTypes';
import type { StockPrice } from '$lib/types/stockPrices';

/**
 * Base function to calculate valuation metrics with validation
 */
function calculateValuationMetric(
    statements: IncomeStatement[],
    prices: StockPrice[],
    metricField: keyof IncomeStatement,
    name: string
): ChartMetric | null {
    if (!statements?.length || !prices?.length) return null;

    const valuationData: ChartDataPoint[] = statements
        .filter(stmt => {
            const value = stmt[metricField];
            // Find matching price for the statement date
            const price = prices.find(p => p.date.split('T')[0] === stmt.date);
            return typeof value === 'number' && 
                   !isNaN(value as number) && 
                   value !== 0 && 
                   price?.close !== null;
        })
        .map(stmt => {
            // Find matching price for the statement date
            const price = prices.find(p => p.date.split('T')[0] === stmt.date);
            if (!price?.close) return null;

            return {
                date: stmt.date,
                value: price.close / (stmt[metricField] as number)
            };
        })
        .filter((dataPoint): dataPoint is ChartDataPoint => dataPoint !== null)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return valuationData.length > 0 ? {
        name,
        data: valuationData
    } : null;
}

/**
 * Calculates P/E ratio from income statements and stock prices
 */
export function calculatePERatio(statements: IncomeStatement[], prices: StockPrice[]): ChartMetric | null {
    return calculateValuationMetric(statements, prices, 'eps_diluted', 'P/E Ratio');
}
