import type { FinancialData, CashFlowStatement } from '$lib/types/financialStatements';
import { calculateTTMData } from '../utils/ttmCalculations';

interface StockPrice {
    date: string;
    adj_close: number;
}

export function calculateFCFYield(prices: StockPrice[], financialData: FinancialData) {
    if (!prices?.length || !financialData?.cash_flow_statements.length || !financialData?.income_statements.length || !financialData.income_statements[0]?.weighted_average_shs_out) {
        throw new Error('No data available');
    }

    // Get TTM FCF data
    let ttmFcfData = financialData.cash_flow_statements
        .filter(stmt => stmt.period === 'TTM')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map(stmt => ({
            date: stmt.date,
            fcf: stmt.free_cash_flow
        }));

    // If no TTM data found, calculate it manually
    if (!ttmFcfData.length) {
        ttmFcfData = calculateTTMData<CashFlowStatement>(
            financialData.cash_flow_statements,
            (stmt) => stmt.free_cash_flow
        ).map(data => ({
            date: data.date,
            fcf: data.value
        }));
    }

    if (!ttmFcfData.length) {
        throw new Error('Could not calculate TTM data');
    }

    // Calculate FCF Yield for each price point
    const fcfYieldData = prices.map(price => {
        const priceDate = new Date(price.date);
        
        // Find the most recent TTM FCF data point before or equal to this price date
        const validFcf = ttmFcfData.find(stmt => 
            new Date(stmt.date) <= priceDate
        );

        // Only calculate FCF Yield if we have valid FCF (non-zero)
        if (validFcf?.fcf && validFcf.fcf !== 0) {
            // Calculate FCF per share using weighted average shares outstanding
            const fcfPerShare = validFcf.fcf / financialData.income_statements[0].weighted_average_shs_out;
            const fcfYield = (fcfPerShare / price.adj_close) * 100; // Convert to percentage
            
            // Filter out unreasonable FCF Yields
            if (fcfYield > 0 && fcfYield < 100) {
                return {
                    date: price.date,
                    value: fcfYield
                };
            }
        }
        return null;
    })
    .filter(d => d !== null)
    .sort((a, b) => new Date(a!.date).getTime() - new Date(b!.date).getTime());

    if (!fcfYieldData.length) {
        throw new Error('No valid FCF Yield data available');
    }

    return {
        values: fcfYieldData.map(d => d!.value),
        dates: fcfYieldData.map(d => d!.date)
    };
}
