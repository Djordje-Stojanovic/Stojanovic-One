import type { BaseFinancialStatement } from '$lib/types/financialStatements';

interface TTMResult {
    date: string;
    value: number;
}

export function calculateTTMData<T extends BaseFinancialStatement>(
    statements: T[],
    valueExtractor: (stmt: T) => number | undefined
): TTMResult[] {
    const quarterlyData = statements
        .filter(stmt => stmt.period !== 'FY' && stmt.period !== 'TTM')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return quarterlyData
        .map((stmt, index, arr) => {
            if (index < 3) return null;
            
            // Get last 4 quarters
            const last4Quarters = arr.slice(index - 3, index + 1);
            
            // Sum values for last 4 quarters
            const ttmValue = last4Quarters
                .reduce((sum, q) => sum + (valueExtractor(q) || 0), 0);
            
            return {
                date: stmt.date,
                value: ttmValue
            };
        })
        .filter((d): d is TTMResult => d !== null)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
