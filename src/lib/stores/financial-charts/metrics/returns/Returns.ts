import type { IncomeStatement, BalanceSheet } from '$lib/types/financialStatements';
import type { ChartMetric } from '../../types/ChartTypes';
import { calculateROIC, calculateROCE, calculateROE, calculateROA } from '$lib/components/financials/chart/chartUtils';

function annualizeQuarterlyIncome(income: number, period: string): number {
    return period !== 'FY' && period !== 'TTM' ? income * 4 : income;
}

export function calculateROICMetric(incomeStatements: IncomeStatement[], balanceSheets: BalanceSheet[]): ChartMetric | null {
    if (!incomeStatements.length || !balanceSheets.length) return null;

    const data = incomeStatements.map(income => {
        const balance = balanceSheets.find(b => b.date === income.date);
        if (!balance) return null;

        // Annualize operating income for quarterly data
        const annualizedOperatingIncome = annualizeQuarterlyIncome(income.operating_income, income.period);
        
        const roic = calculateROIC(
            annualizedOperatingIncome,
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

        // Annualize operating income for quarterly data
        const annualizedOperatingIncome = annualizeQuarterlyIncome(income.operating_income, income.period);

        const roce = calculateROCE(
            annualizedOperatingIncome,
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

        // Annualize net income for quarterly data
        const annualizedNetIncome = annualizeQuarterlyIncome(income.net_income, income.period);

        const roe = calculateROE(
            annualizedNetIncome,
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

        // Annualize net income for quarterly data
        const annualizedNetIncome = annualizeQuarterlyIncome(income.net_income, income.period);

        const roa = calculateROA(
            annualizedNetIncome,
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
