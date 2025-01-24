import type { FinancialData, IncomeStatement } from '$lib/types/financialStatements';
import { calculateTTMData } from '../utils/ttmCalculations';

interface StockPrice {
    date: string;
    adj_close: number;
}

export function calculatePSRatio(prices: StockPrice[], financialData: FinancialData) {
    if (!prices?.length || !financialData?.income_statements.length || !financialData.income_statements[0]?.weighted_average_shs_out) {
        throw new Error('No data available');
    }

    // Get TTM Revenue data
    let ttmRevenueData = financialData.income_statements
        .filter(stmt => stmt.period === 'TTM')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map(stmt => ({
            date: stmt.date,
            revenue: stmt.revenue
        }));

    // If no TTM data found, calculate it manually
    if (!ttmRevenueData.length) {
        ttmRevenueData = calculateTTMData<IncomeStatement>(
            financialData.income_statements,
            (stmt) => stmt.revenue
        ).map(data => ({
            date: data.date,
            revenue: data.value
        }));
    }

    if (!ttmRevenueData.length) {
        throw new Error('Could not calculate TTM data');
    }

    // Calculate P/S ratio for each price point
    const psData = prices.map(price => {
        const priceDate = new Date(price.date);
        
        // Find the most recent TTM Revenue data point before or equal to this price date
        const validRevenue = ttmRevenueData.find(stmt => 
            new Date(stmt.date) <= priceDate
        );

        // Only calculate P/S if we have valid revenue (non-zero)
        if (validRevenue?.revenue && validRevenue.revenue !== 0) {
            // Calculate Revenue per share
            const revenuePerShare = validRevenue.revenue / financialData.income_statements[0].weighted_average_shs_out;
            const psRatio = price.adj_close / revenuePerShare;
            
            // Filter out unreasonable P/S ratios
            if (psRatio > 0 && psRatio < 100) {
                return {
                    date: price.date,
                    value: psRatio
                };
            }
        }
        return null;
    })
    .filter(d => d !== null)
    .sort((a, b) => new Date(a!.date).getTime() - new Date(b!.date).getTime());

    if (!psData.length) {
        throw new Error('No valid P/S data available');
    }

    return {
        values: psData.map(d => d!.value),
        dates: psData.map(d => d!.date)
    };
}
