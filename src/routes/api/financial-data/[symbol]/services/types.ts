import type { IncomeStatement, BalanceSheet, CashFlowStatement, RevenueSegment } from '$lib/types/financialStatements';

export type FinancialStatement = {
    reportedCurrency?: string;
    period?: string;
    [key: string]: unknown;
};

export interface RawRevenueSegment {
    [date: string]: {
        [segment: string]: number;
    };
}

export type TransformerFunction<T extends FinancialStatement, R> = (
    stmt: T,
    symbol: string,
    converted: T
) => R;

export type FinancialData = {
    income_statements: IncomeStatement[];
    balance_sheets: BalanceSheet[];
    cash_flow_statements: CashFlowStatement[];
    revenue_segments: RevenueSegment[];
};
