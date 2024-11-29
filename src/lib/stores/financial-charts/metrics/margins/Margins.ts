import type { IncomeStatement, CashFlowStatement } from '$lib/types/financialStatements';
import type { ChartMetric, ChartDataPoint } from '../../types/ChartTypes';

/**
 * Base function to calculate margin with validation
 */
function calculateMargin(
    statements: (IncomeStatement | CashFlowStatement)[], 
    numeratorField: keyof (IncomeStatement | CashFlowStatement),
    denominatorField: keyof (IncomeStatement | CashFlowStatement),
    name: string
): ChartMetric | null {
    if (!statements?.length) return null;

    const marginData: ChartDataPoint[] = statements
        .filter(stmt => {
            const numerator = stmt[numeratorField];
            const denominator = stmt[denominatorField];
            return typeof numerator === 'number' && 
                   typeof denominator === 'number' && 
                   !isNaN(numerator) && 
                   !isNaN(denominator) && 
                   denominator !== 0;
        })
        .map(stmt => ({
            date: stmt.date,
            value: ((stmt[numeratorField] as number) / (stmt[denominatorField] as number)) * 100
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return marginData.length > 0 ? {
        name,
        data: marginData
    } : null;
}

/**
 * Calculates net income margin from income statements
 */
export function calculateNetIncomeMargin(statements: IncomeStatement[]): ChartMetric | null {
    return calculateMargin(statements, 'net_income', 'revenue', 'Net Income Margin');
}

/**
 * Calculates gross profit margin from income statements
 */
export function calculateGrossProfitMargin(statements: IncomeStatement[]): ChartMetric | null {
    return calculateMargin(statements, 'gross_profit', 'revenue', 'Gross Profit Margin');
}

/**
 * Calculates operating income margin from income statements
 */
export function calculateOperatingMargin(statements: IncomeStatement[]): ChartMetric | null {
    return calculateMargin(statements, 'operating_income', 'revenue', 'Operating Margin');
}

/**
 * Calculates EBITDA margin from income statements
 */
export function calculateEBITDAMargin(statements: IncomeStatement[]): ChartMetric | null {
    return calculateMargin(statements, 'ebitda', 'revenue', 'EBITDA Margin');
}

/**
 * Calculates free cash flow margin
 */
export function calculateFCFMargin(statements: CashFlowStatement[], revenue: number[]): ChartMetric | null {
    if (!statements?.length || !revenue?.length || statements.length !== revenue.length) return null;

    const marginData: ChartDataPoint[] = statements
        .map((stmt, index) => ({
            stmt,
            revenue: revenue[index]
        }))
        .filter(({ stmt, revenue }) => {
            const fcf = stmt.free_cash_flow;
            return typeof fcf === 'number' && 
                   typeof revenue === 'number' && 
                   !isNaN(fcf) && 
                   !isNaN(revenue) && 
                   revenue !== 0;
        })
        .map(({ stmt, revenue }) => ({
            date: stmt.date,
            value: (stmt.free_cash_flow / revenue) * 100
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return marginData.length > 0 ? {
        name: 'FCF Margin',
        data: marginData
    } : null;
}

/**
 * Calculates operating cash flow margin
 */
export function calculateOperatingCashFlowMargin(statements: CashFlowStatement[], revenue: number[]): ChartMetric | null {
    if (!statements?.length || !revenue?.length || statements.length !== revenue.length) return null;

    const marginData: ChartDataPoint[] = statements
        .map((stmt, index) => ({
            stmt,
            revenue: revenue[index]
        }))
        .filter(({ stmt, revenue }) => {
            const ocf = stmt.operating_cash_flow;
            return typeof ocf === 'number' && 
                   typeof revenue === 'number' && 
                   !isNaN(ocf) && 
                   !isNaN(revenue) && 
                   revenue !== 0;
        })
        .map(({ stmt, revenue }) => ({
            date: stmt.date,
            value: (stmt.operating_cash_flow / revenue) * 100
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return marginData.length > 0 ? {
        name: 'Operating Cash Flow Margin',
        data: marginData
    } : null;
}
