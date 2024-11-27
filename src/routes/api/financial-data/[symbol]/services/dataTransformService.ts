import { getExchangeRate, convertStatementToUSD } from '$lib/utils/currencyConverter';
import type { FinancialStatement, TransformerFunction, RawRevenueSegment, RawRevenueGeoSegment } from './types';
import { transformIncomeStatement, transformBalanceSheet, transformCashFlow } from '../types/transformers';
import { transformRevenueSegments } from '../types/transformers/revenueSegments';
import { transformRevenueGeoSegments } from '../types/transformers/revenueGeoSegments';
import type { FMPIncomeStatement, FMPBalanceSheet, FMPCashFlowStatement } from '../types/fmpTypes';
import type { IncomeStatement, BalanceSheet, CashFlowStatement } from '$lib/types/financialStatements';

export async function getExchangeRateIfNeeded(statement: FinancialStatement | undefined): Promise<number> {
    if (!statement || statement.reportedCurrency === 'USD') {
        return 1;
    }
    const currency = statement.reportedCurrency;
    if (!currency) return 1;
    return await getExchangeRate(currency);
}

export function transformFinancialData<T extends FinancialStatement, R>(
    data: T[],
    symbol: string,
    exchangeRate: number,
    transformer: TransformerFunction<T, R>
): R[] {
    if (!Array.isArray(data) || data.length === 0) {
        return [];
    }

    return data.map(stmt => {
        const converted = convertStatementToUSD(stmt, exchangeRate);
        return transformer(stmt, symbol, converted as T);
    });
}

export function transformAllStatements(
    incomeStmts: FMPIncomeStatement[],
    balanceSheets: FMPBalanceSheet[],
    cashFlowStmts: FMPCashFlowStatement[],
    symbol: string,
    exchangeRate: number
): {
    incomeStatements: IncomeStatement[];
    balanceSheets: BalanceSheet[];
    cashFlowStatements: CashFlowStatement[];
} {
    return {
        incomeStatements: transformFinancialData(incomeStmts, symbol, exchangeRate, transformIncomeStatement),
        balanceSheets: transformFinancialData(balanceSheets, symbol, exchangeRate, transformBalanceSheet),
        cashFlowStatements: transformFinancialData(cashFlowStmts, symbol, exchangeRate, transformCashFlow)
    };
}

export function transformSegments(
    annualData: RawRevenueSegment[], 
    quarterlyData: RawRevenueSegment[], 
    symbol: string,
    exchangeRate: number
) {
    const transformedAnnualData = transformRevenueSegments(annualData, symbol, true, exchangeRate);
    const transformedQuarterlyData = transformRevenueSegments(quarterlyData, symbol, false, exchangeRate);
    return [...transformedAnnualData, ...transformedQuarterlyData];
}

export function transformGeoSegments(
    annualData: RawRevenueGeoSegment[], 
    quarterlyData: RawRevenueGeoSegment[], 
    symbol: string,
    exchangeRate: number
) {
    const transformedAnnualData = transformRevenueGeoSegments(annualData, symbol, true, exchangeRate);
    const transformedQuarterlyData = transformRevenueGeoSegments(quarterlyData, symbol, false, exchangeRate);
    return [...transformedAnnualData, ...transformedQuarterlyData];
}
