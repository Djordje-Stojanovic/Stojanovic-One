import type { IncomeStatement, BalanceSheet, CashFlowStatement } from '$lib/types/financialStatements';
import type { NumberFormat } from '$lib/utils/numberFormat';

// Common props interface for financial statement sections
export interface FinancialSectionProps<T extends IncomeStatement | BalanceSheet | CashFlowStatement> {
    statements: T[];
    numberFormat: NumberFormat;
    selectedMetricNames: string[];
}

// Common props interface for financial statement tables
export interface FinancialTableProps<T extends IncomeStatement | BalanceSheet | CashFlowStatement> {
    statements: T[];
    numberFormat: NumberFormat;
    selectedMetricNames: string[];
}

// Common props interface for metric rows
export interface MetricRowProps {
    name: string;
    values: number[];
    dates: string[];
    numberFormat: NumberFormat;
    isTotal?: boolean;
    indented?: boolean;
    isSelected?: boolean;
}

// Chart metric type
export interface ChartMetric {
    name: string;
    data: { date: string; value: number }[];
    hidden?: boolean;
}

// Chart props interface
export interface ChartProps {
    metrics: ChartMetric[];
    darkMode?: boolean;
}
