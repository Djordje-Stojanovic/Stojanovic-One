import type { FinancialData } from '$lib/types/financialStatements';

interface StockPrice {
    date: string;
    adj_close: number;
}

export function calculatePBRatio(prices: StockPrice[], financialData: FinancialData) {
    if (!prices?.length || !financialData?.balance_sheets.length || !financialData?.income_statements.length || !financialData.income_statements[0]?.weighted_average_shs_out) {
        throw new Error('No data available');
    }

    // Get balance sheet data - no TTM needed as these are point-in-time values
    const balanceData = financialData.balance_sheets
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map(stmt => ({
            date: stmt.date,
            bookValue: stmt.total_assets - stmt.total_liabilities,
            sharesOutstanding: Number(stmt.weighted_average_shs_out || financialData.income_statements[0].weighted_average_shs_out)
        }));

    if (!balanceData.length) {
        throw new Error('No balance sheet data available');
    }

    // Calculate P/B Ratio for each price point
    const pbRatioData = prices.map(price => {
        const priceDate = new Date(price.date);
        
        // Find the most recent balance sheet data point before or equal to this price date
        const validBalance = balanceData.find(stmt => 
            new Date(stmt.date) <= priceDate
        );

        // Only calculate P/B if we have valid book value (positive)
        if (validBalance?.bookValue && validBalance.bookValue > 0) {
            // Calculate book value per share using the corresponding period's shares outstanding
            const bookValuePerShare = validBalance.bookValue / validBalance.sharesOutstanding;
            const pbRatio = price.adj_close / bookValuePerShare;
            
            // Filter out unreasonable P/B ratios (e.g., negative or extremely high)
            if (pbRatio > 0) {
                return {
                    date: price.date,
                    value: pbRatio
                };
            }
        }
        return null;
    })
    .filter(d => d !== null)
    .sort((a, b) => new Date(a!.date).getTime() - new Date(b!.date).getTime());

    if (!pbRatioData.length) {
        throw new Error('No valid P/B Ratio data available');
    }

    return {
        values: pbRatioData.map(d => d!.value),
        dates: pbRatioData.map(d => d!.date)
    };
}
