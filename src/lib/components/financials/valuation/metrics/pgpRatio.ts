import type { FinancialData, IncomeStatement } from '$lib/types/financialStatements';
import { calculateTTMData } from '../utils/ttmCalculations';

interface StockPrice {
    date: string;
    adj_close: number;
}

export function calculatePGPRatio(prices: StockPrice[], financialData: FinancialData) {
    if (!prices?.length || !financialData?.income_statements.length || !financialData.income_statements[0]?.weighted_average_shs_out) {
        throw new Error('No data available');
    }

    // Get TTM Gross Profit data
    let ttmGrossData = financialData.income_statements
        .filter(stmt => stmt.period === 'TTM')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map(stmt => ({
            date: stmt.date,
            grossProfit: stmt.gross_profit
        }));

    // If no TTM data found, calculate it manually
    if (!ttmGrossData.length) {
        ttmGrossData = calculateTTMData<IncomeStatement>(
            financialData.income_statements,
            (stmt) => stmt.gross_profit
        ).map(data => ({
            date: data.date,
            grossProfit: data.value
        }));
    }

    if (!ttmGrossData.length) {
        throw new Error('Could not calculate TTM data');
    }

    // Calculate P/GP ratio for each price point
    const pgpData = prices.map(price => {
        const priceDate = new Date(price.date);
        
        // Find the most recent TTM Gross Profit data point before or equal to this price date
        const validGross = ttmGrossData.find(stmt => 
            new Date(stmt.date) <= priceDate
        );

        // Only calculate P/GP if we have valid gross profit (non-zero)
        if (validGross?.grossProfit && validGross.grossProfit > 0) {
            // Calculate Gross Profit per share
            const grossProfitPerShare = validGross.grossProfit / financialData.income_statements[0].weighted_average_shs_out;
            const pgpRatio = price.adj_close / grossProfitPerShare;
            
            // Filter out unreasonable P/GP ratios
            if (pgpRatio > 0 && pgpRatio < 100) {
                return {
                    date: price.date,
                    value: pgpRatio
                };
            }
        }
        return null;
    })
    .filter(d => d !== null)
    .sort((a, b) => new Date(a!.date).getTime() - new Date(b!.date).getTime());

    if (!pgpData.length) {
        throw new Error('No valid P/GP data available');
    }

    return {
        values: pgpData.map(d => d!.value),
        dates: pgpData.map(d => d!.date)
    };
}
