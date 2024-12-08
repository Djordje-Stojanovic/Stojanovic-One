import type { FinancialData } from '$lib/types/financialStatements';

export interface ChartMetric {
    name: string;
    data: ChartDataPoint[];
    hidden?: boolean;
}

export interface ChartDataPoint {
    date: string;
    value: number;
}

export type MarginType = 'netIncome' | 'grossProfit' | 'operating' | 'ebitda' | 'fcf' | 'operatingCashFlow';
export type ReturnMetricType = 'roic' | 'roce' | 'roe' | 'roa';

export interface MarginState {
    [key: string]: boolean;
    netIncome: boolean;
    grossProfit: boolean;
    operating: boolean;
    ebitda: boolean;
    fcf: boolean;
    operatingCashFlow: boolean;
}

export interface ReturnMetricState {
    [key: string]: boolean;
    roic: boolean;
    roce: boolean;
    roe: boolean;
    roa: boolean;
}

export interface ChartStoreState {
    showChart: boolean;
    selectedMetrics: ChartMetric[];
    selectedMetricNames: string[];
    margins: MarginState;
    returnMetrics: ReturnMetricState;
    lastFinancialData: FinancialData | null;
    metricVisibility: Record<string, boolean>;
    showPrice?: boolean;
}

export interface ChartStoreActions {
    subscribe: (run: (value: ChartStoreState) => void) => () => void;
    updateMetrics: (financialData: FinancialData) => void;
    handleMetricClick: (name: string, values: number[], dates: string[]) => void;
    toggleMargin: (marginType: MarginType) => void;
    toggleReturnMetric: (returnType: ReturnMetricType) => void;
    togglePrice?: () => void;
    clearChart: () => void;
    toggleMetricVisibility: (metricName: string) => void;
}
