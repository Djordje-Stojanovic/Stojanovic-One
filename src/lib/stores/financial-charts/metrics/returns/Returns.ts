import type { IncomeStatement, BalanceSheet } from '$lib/types/financialStatements';
import type { ChartMetric } from '../../types/ChartTypes';
import { calculateROIC, calculateROCE, calculateROE, calculateROA } from '$lib/components/financials/chart/chartUtils';

export function calculateROICMetric(incomeStatements: IncomeStatement[], balanceSheets: BalanceSheet[]): ChartMetric | null {
    if (!incomeStatements.length || !balanceSheets.length) return null;

    const data = incomeStatements.map(income => {
        const balance = balanceSheets.find(b => b.date === income.date);
        if (!balance) return null;

        const roic = calculateROIC(
            income.operating_income,
            income.income_tax_expense,
            balance.total_assets,
            balance.total_current_liabilities
        );

        return {
            date: income.date,
            value: roic
        };
    }).filter((item): item is { date: string; value: number } => item !== null);

    return {
        name: 'ROIC',
        data: data
    };
}

export function calculateROCEMetric(incomeStatements: IncomeStatement[], balanceSheets: BalanceSheet[]): ChartMetric | null {
    if (!incomeStatements.length || !balanceSheets.length) return null;

    const data = incomeStatements.map(income => {
        const balance = balanceSheets.find(b => b.date === income.date);
        if (!balance) return null;

        const roce = calculateROCE(
            income.operating_income,
            balance.total_assets,
            balance.total_current_liabilities
        );

        return {
            date: income.date,
            value: roce
        };
    }).filter((item): item is { date: string; value: number } => item !== null);

    return {
        name: 'ROCE',
        data: data
    };
}

export function calculateROEMetric(incomeStatements: IncomeStatement[], balanceSheets: BalanceSheet[]): ChartMetric | null {
    if (!incomeStatements.length || !balanceSheets.length) return null;

    const data = incomeStatements.map(income => {
        const balance = balanceSheets.find(b => b.date === income.date);
        if (!balance) return null;

        const roe = calculateROE(
            income.net_income,
            balance.total_stockholders_equity
        );

        return {
            date: income.date,
            value: roe
        };
    }).filter((item): item is { date: string; value: number } => item !== null);

    return {
        name: 'ROE',
        data: data
    };
}

export function calculateROAMetric(incomeStatements: IncomeStatement[], balanceSheets: BalanceSheet[]): ChartMetric | null {
    if (!incomeStatements.length || !balanceSheets.length) return null;

    const data = incomeStatements.map(income => {
        const balance = balanceSheets.find(b => b.date === income.date);
        if (!balance) return null;

        const roa = calculateROA(
            income.net_income,
            balance.total_assets
        );

        return {
            date: income.date,
            value: roa
        };
    }).filter((item): item is { date: string; value: number } => item !== null);

    return {
        name: 'ROA',
        data: data
    };
}
