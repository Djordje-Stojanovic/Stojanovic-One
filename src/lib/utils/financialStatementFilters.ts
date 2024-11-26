import type { FinancialData, IncomeStatement, BalanceSheet, CashFlowStatement } from '$lib/types/financialStatements';

type FinancialStatement = IncomeStatement | BalanceSheet | CashFlowStatement;

function calculateTTM<T extends FinancialStatement>(statements: T[]): T[] {
    // Get quarterly statements sorted by date (newest first)
    const quarterlyStatements = statements
        .filter(stmt => stmt.period !== 'FY' && stmt.period !== 'TTM')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (quarterlyStatements.length < 4) return [];

    const ttmStatements: T[] = [];

    // Calculate TTM for each quarter point
    for (let i = 0; i < quarterlyStatements.length - 3; i++) {
        const currentQuarter = quarterlyStatements[i];
        const previousQuarters = quarterlyStatements.slice(i, i + 4);
        
        // Create TTM entry based on current quarter
        const ttmEntry = { ...currentQuarter } as T;
        ttmEntry.period = 'TTM';

        // Sum numeric fields from the last 4 quarters
        Object.keys(ttmEntry).forEach(key => {
            const value = ttmEntry[key];
            if (
                typeof value === 'number' && 
                !key.includes('ratio') && 
                !key.includes('eps') && 
                key !== 'id' &&
                key !== 'weighted_average_shs_out' &&
                key !== 'weighted_average_shs_out_dil'
            ) {
                const sum = previousQuarters.reduce((acc, q) => acc + (Number(q[key]) || 0), 0);
                ttmEntry[key] = Number(sum.toFixed(2));
            }
        });

        // Calculate ratios based on TTM totals
        if ('revenue' in ttmEntry && typeof ttmEntry.revenue === 'number' && ttmEntry.revenue > 0) {
            if ('gross_profit' in ttmEntry && typeof ttmEntry.gross_profit === 'number') {
                ttmEntry.gross_profit_ratio = Number((ttmEntry.gross_profit / ttmEntry.revenue).toFixed(3));
            }
            if ('operating_income' in ttmEntry && typeof ttmEntry.operating_income === 'number') {
                ttmEntry.operating_income_ratio = Number((ttmEntry.operating_income / ttmEntry.revenue).toFixed(3));
            }
            if ('net_income' in ttmEntry && typeof ttmEntry.net_income === 'number') {
                ttmEntry.net_income_ratio = Number((ttmEntry.net_income / ttmEntry.revenue).toFixed(3));
            }
            if ('ebitda' in ttmEntry && typeof ttmEntry.ebitda === 'number') {
                ttmEntry.ebitda_ratio = Number((ttmEntry.ebitda / ttmEntry.revenue).toFixed(3));
            }
        }

        // Calculate per share metrics using current quarter's share count
        if ('net_income' in ttmEntry && typeof ttmEntry.net_income === 'number') {
            const currentShares = currentQuarter.weighted_average_shs_out;
            const currentSharesDiluted = currentQuarter.weighted_average_shs_out_dil;

            if (typeof currentShares === 'number' && currentShares > 0) {
                ttmEntry.eps = Number((ttmEntry.net_income / currentShares).toFixed(3));
            }
            if (typeof currentSharesDiluted === 'number' && currentSharesDiluted > 0) {
                ttmEntry.eps_diluted = Number((ttmEntry.net_income / currentSharesDiluted).toFixed(3));
            }
        }

        ttmStatements.push(ttmEntry);
    }

    // Sort TTM statements by date (oldest to newest)
    return ttmStatements.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
}

export function filterFinancialStatementsByPeriod(
    data: FinancialData, 
    period: 'annual' | 'quarterly' | 'ttm', 
    years: number
): FinancialData {
    const filterMostRecent = <T extends FinancialStatement>(statements: T[]): T[] => {
        let periodFiltered: T[];
        
        if (period === 'ttm') {
            periodFiltered = calculateTTM(statements);
        } else {
            periodFiltered = statements.filter(stmt => 
                period === 'annual' ? stmt.period === 'FY' : (stmt.period !== 'FY' && stmt.period !== 'TTM')
            );
        }

        if (years === 0) return periodFiltered;

        const sorted = [...periodFiltered].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        const limit = period === 'annual' ? years : years * 4;
        const filtered = sorted.slice(0, limit);
        
        return filtered.sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );
    };

    // Filter revenue segments separately since they don't need TTM calculations
    const filterRevenueSegments = (segments: FinancialData['revenue_segments']) => {
        if (!segments) return [];
        
        const periodFiltered = segments.filter(stmt => 
            period === 'annual' ? stmt.period === 'FY' : stmt.period !== 'FY'
        );

        if (years === 0) return periodFiltered;

        const sorted = [...periodFiltered].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        const limit = period === 'annual' ? years : years * 4;
        const filtered = sorted.slice(0, limit);
        
        return filtered.sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );
    };

    return {
        income_statements: filterMostRecent(data.income_statements),
        balance_sheets: filterMostRecent(data.balance_sheets),
        cash_flow_statements: filterMostRecent(data.cash_flow_statements),
        revenue_segments: filterRevenueSegments(data.revenue_segments)
    };
}
