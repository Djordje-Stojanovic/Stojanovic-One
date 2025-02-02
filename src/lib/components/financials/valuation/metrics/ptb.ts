import type { FinancialData } from '$lib/types/financialStatements';

interface StockPrice {
    date: string;
    adj_close: number;
}

export function calculatePTBRatio(prices: StockPrice[], financialData: FinancialData) {
    if (!prices?.length || !financialData?.balance_sheets.length || !financialData?.income_statements.length || !financialData.income_statements[0]?.weighted_average_shs_out) {
        throw new Error('No data available');
    }

    // Get balance sheet data - no TTM needed as these are point-in-time values
    const balanceData = financialData.balance_sheets
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map(stmt => ({
            date: stmt.date,
            tangibleBookValue: stmt.total_assets - stmt.intangible_assets - stmt.goodwill - stmt.total_liabilities,
            sharesOutstanding: Number(stmt.weighted_average_shs_out || financialData.income_statements[0].weighted_average_shs_out)
        }));

    if (!balanceData.length) {
        throw new Error('No balance sheet data available');
    }

    // Calculate P/TB Ratio for each price point
    const ptbRatioData = prices.map(price => {
        const priceDate = new Date(price.date);
        
        // Find the most recent balance sheet data point before or equal to this price date
        const validBalance = balanceData.find(stmt => 
            new Date(stmt.date) <= priceDate
        );

        // Only calculate P/TB if we have valid tangible book value (positive)
        if (validBalance?.tangibleBookValue && validBalance.tangibleBookValue > 0) {
            // Calculate tangible book value per share using the corresponding period's shares outstanding
            const tangibleBookValuePerShare = validBalance.tangibleBookValue / validBalance.sharesOutstanding;
            const ptbRatio = price.adj_close / tangibleBookValuePerShare;
            
            // Filter out unreasonable P/TB ratios (e.g., negative or extremely high)
            if (ptbRatio > 0) {
                return {
                    date: price.date,
                    value: ptbRatio
                };
            }
        }
        return null;
    })
    .filter(d => d !== null)
    .sort((a, b) => new Date(a!.date).getTime() - new Date(b!.date).getTime());

    if (!ptbRatioData.length) {
        throw new Error('No valid P/TB Ratio data available');
    }

    return {
        values: ptbRatioData.map(d => d!.value),
        dates: ptbRatioData.map(d => d!.date)
    };
}
