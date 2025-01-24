import type { FinancialData, IncomeStatement } from '$lib/types/financialStatements';
import { calculateTTMData } from '../utils/ttmCalculations';

interface StockPrice {
    date: string;
    adj_close: number;
}

export function calculatePERatio(prices: StockPrice[], financialData: FinancialData) {
    if (!prices?.length || !financialData?.income_statements.length) {
        throw new Error('No data available');
    }

    // Get TTM EPS data
    let ttmEpsData = financialData.income_statements
        .filter(stmt => stmt.period === 'TTM')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map(stmt => ({
            date: stmt.date,
            eps_diluted: stmt.eps_diluted
        }));

    // If no TTM data found, calculate it manually
    if (!ttmEpsData.length) {
        ttmEpsData = calculateTTMData<IncomeStatement>(
            financialData.income_statements,
            (stmt) => stmt.eps_diluted
        ).map(data => ({
            date: data.date,
            eps_diluted: data.value
        }));
    }

    if (!ttmEpsData.length) {
        throw new Error('Could not calculate TTM data');
    }

    // Calculate P/E ratio for each price point
    const peData = prices.map(price => {
        const priceDate = new Date(price.date);
        
        // Find the most recent TTM EPS data point before or equal to this price date
        const validEps = ttmEpsData.find(stmt => 
            new Date(stmt.date) <= priceDate
        );

        // Only calculate P/E if we have valid EPS (non-zero and not negative)
        if (validEps?.eps_diluted && validEps.eps_diluted > 0) {
            const peRatio = price.adj_close / validEps.eps_diluted;
            // Filter out unreasonable P/E ratios (e.g., > 1000)
            if (peRatio > 0 && peRatio < 1000) {
                return {
                    date: price.date,
                    value: peRatio
                };
            }
        }
        return null;
    })
    .filter(d => d !== null)
    .sort((a, b) => new Date(a!.date).getTime() - new Date(b!.date).getTime());

    if (!peData.length) {
        throw new Error('No valid P/E data available');
    }

    return {
        values: peData.map(d => d!.value),
        dates: peData.map(d => d!.date)
    };
}
