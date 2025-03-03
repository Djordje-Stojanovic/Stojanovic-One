import type { FinancialData, IncomeStatement } from '$lib/types/financialStatements';
import { calculateTTMData } from '../utils/ttmCalculations';

interface StockPrice {
    date: string;
    adj_close: number;
}

export function calculatePOIRatio(prices: StockPrice[], financialData: FinancialData) {
    if (!prices?.length || !financialData?.income_statements.length) {
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
            // Calculate market cap (price * shares outstanding)
            // For P/Operating Income, we divide market cap by operating income
            // Since we don't have shares outstanding directly, we'll use price / operating income per share
            // We can approximate this by using the same approach as P/E ratio but with operating income
            const poiRatio = price.adj_close / (validOperatingIncome.operating_income / 1000000); // Assuming operating_income is in millions
            
            // Filter out unreasonable ratios (e.g., > 1000)
            if (poiRatio > 0 && poiRatio < 1000) {
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
