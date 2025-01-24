import type { FinancialData, IncomeStatement } from '$lib/types/financialStatements';
import { calculateTTMData } from '../utils/ttmCalculations';

interface StockPrice {
    date: string;
    adj_close: number;
}

function calculateEnterpriseValue(
    price: number,
    sharesOutstanding: number,
    totalDebt: number,
    cashAndEquivalents: number
): number {
    const marketCap = price * sharesOutstanding;
    return marketCap + totalDebt - cashAndEquivalents;
}

export function calculateEVEBITDA(prices: StockPrice[], financialData: FinancialData) {
    if (!prices?.length || 
        !financialData?.income_statements.length || 
        !financialData?.balance_sheets.length || 
        !financialData.income_statements[0]?.weighted_average_shs_out) {
        throw new Error('No data available');
    }

    // Get TTM EBITDA data
    let ttmEbitdaData = financialData.income_statements
        .filter(stmt => stmt.period === 'TTM')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map(stmt => ({
            date: stmt.date,
            ebitda: stmt.ebitda
        }));

    // If no TTM data found, calculate it manually
    if (!ttmEbitdaData.length) {
        ttmEbitdaData = calculateTTMData<IncomeStatement>(
            financialData.income_statements,
            (stmt) => stmt.ebitda
        ).map(data => ({
            date: data.date,
            ebitda: data.value
        }));
    }

    if (!ttmEbitdaData.length) {
        throw new Error('Could not calculate TTM data');
    }

    // Calculate EV/EBITDA for each price point
    const evEbitdaData = prices.map(price => {
        const priceDate = new Date(price.date);
        
        // Find the most recent TTM EBITDA data point before or equal to this price date
        const validEbitda = ttmEbitdaData.find(stmt => 
            new Date(stmt.date) <= priceDate
        );

        // Find the most recent balance sheet data for debt and cash
        const validBalanceSheet = financialData.balance_sheets
            .find(stmt => new Date(stmt.date) <= priceDate);

        // Only calculate EV/EBITDA if we have valid data
        if (validEbitda?.ebitda && 
            validEbitda.ebitda > 0 && 
            validBalanceSheet?.total_debt !== undefined && 
            validBalanceSheet?.cash_and_cash_equivalents !== undefined) {
            
            const ev = calculateEnterpriseValue(
                price.adj_close,
                financialData.income_statements[0].weighted_average_shs_out,
                validBalanceSheet.total_debt,
                validBalanceSheet.cash_and_cash_equivalents
            );

            const evEbitdaRatio = ev / validEbitda.ebitda;
            
            // Filter out unreasonable EV/EBITDA ratios
            if (evEbitdaRatio > 0 && evEbitdaRatio < 100) {
                return {
                    date: price.date,
                    value: evEbitdaRatio
                };
            }
        }
        return null;
    })
    .filter(d => d !== null)
    .sort((a, b) => new Date(a!.date).getTime() - new Date(b!.date).getTime());

    if (!evEbitdaData.length) {
        throw new Error('No valid EV/EBITDA data available');
    }

    return {
        values: evEbitdaData.map(d => d!.value),
        dates: evEbitdaData.map(d => d!.date)
    };
}
