import type { FinancialData, IncomeStatement } from '$lib/types/financialStatements';
import { calculateTTMData } from '../utils/ttmCalculations';

interface StockPrice {
    date: string;
    adj_close: number;
}

export function calculatePOIRatio(prices: StockPrice[], financialData: FinancialData) {
    if (!prices?.length || !financialData?.income_statements.length || !financialData.income_statements[0]?.weighted_average_shs_out) {
        throw new Error('No data available');
    }

    // Get TTM Operating Income data
    let ttmOperatingIncomeData = financialData.income_statements
        .filter(stmt => stmt.period === 'TTM')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map(stmt => ({
            date: stmt.date,
            operating_income: stmt.operating_income
        }));

    // If no TTM data found, calculate it manually
    if (!ttmOperatingIncomeData.length) {
        ttmOperatingIncomeData = calculateTTMData<IncomeStatement>(
            financialData.income_statements,
            (stmt) => stmt.operating_income
        ).map(data => ({
            date: data.date,
            operating_income: data.value
        }));
    }

    if (!ttmOperatingIncomeData.length) {
        throw new Error('Could not calculate TTM data');
    }

    // Calculate P/Operating Income ratio for each price point
    const poiData = prices.map(price => {
        const priceDate = new Date(price.date);
        
        // Find the most recent TTM Operating Income data point before or equal to this price date
        const validOperatingIncome = ttmOperatingIncomeData.find(stmt => 
            new Date(stmt.date) <= priceDate
        );

        // Only calculate P/Operating Income if we have valid Operating Income (non-zero and positive)
        if (validOperatingIncome?.operating_income && validOperatingIncome.operating_income > 0) {
            // Calculate operating income per share using the most recent shares outstanding
            // This is a simplification but provides consistent results
            const operatingIncomePerShare = validOperatingIncome.operating_income / 
                financialData.income_statements[0].weighted_average_shs_out;
            
            // Calculate P/Operating Income ratio
            const poiRatio = price.adj_close / operatingIncomePerShare;
            
            // Filter out unreasonable ratios
            if (poiRatio > 0 && poiRatio < 100) {
                return {
                    date: price.date,
                    value: poiRatio
                };
            }
        }
        return null;
    })
    .filter(d => d !== null)
    .sort((a, b) => new Date(a!.date).getTime() - new Date(b!.date).getTime());

    if (!poiData.length) {
        throw new Error('No valid P/Operating Income data available');
    }

    return {
        values: poiData.map(d => d!.value),
        dates: poiData.map(d => d!.date)
    };
}
