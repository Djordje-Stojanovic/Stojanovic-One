import type { FinancialData, IncomeStatement, BalanceSheet, CashFlowStatement } from '$lib/types/financialStatements';

type FinancialStatement = IncomeStatement | BalanceSheet | CashFlowStatement;

export function filterFinancialStatementsByPeriod(data: FinancialData, period: 'annual' | 'quarterly', years: number): FinancialData {
    const filterMostRecent = <T extends FinancialStatement>(statements: T[]): T[] => {
        const periodFiltered = statements.filter(stmt => 
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
        cash_flow_statements: filterMostRecent(data.cash_flow_statements)
    };
}
