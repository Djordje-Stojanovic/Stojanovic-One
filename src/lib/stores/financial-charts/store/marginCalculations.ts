import type { FinancialData } from '$lib/types/financialStatements';
import type { ChartMetric, MarginType, ChartStoreState } from '../types/ChartTypes';
import { 
    calculateNetIncomeMargin,
    calculateGrossProfitMargin,
    calculateOperatingMargin,
    calculateEBITDAMargin,
    calculateFCFMargin,
    calculateOperatingCashFlowMargin
} from '../metrics/margins/Margins';

export function calculateMargins(financialData: FinancialData, state: ChartStoreState): ChartMetric[] {
    const margins: ChartMetric[] = [];

    if (!financialData.income_statements?.length) return margins;

    if (state.margins.netIncome) {
        const margin = calculateNetIncomeMargin(financialData.income_statements);
        if (margin) margins.push({...margin, hidden: false});
    }

    if (state.margins.grossProfit) {
        const margin = calculateGrossProfitMargin(financialData.income_statements);
        if (margin) margins.push({...margin, hidden: false});
    }

    if (state.margins.operating) {
        const margin = calculateOperatingMargin(financialData.income_statements);
        if (margin) margins.push({...margin, hidden: false});
    }

    if (state.margins.ebitda) {
        const margin = calculateEBITDAMargin(financialData.income_statements);
        if (margin) margins.push({...margin, hidden: false});
    }

    if (state.margins.fcf) {
        const revenue = financialData.income_statements.map(stmt => stmt.revenue);
        const margin = calculateFCFMargin(financialData.cash_flow_statements, revenue);
        if (margin) margins.push({...margin, hidden: false});
    }

    if (state.margins.operatingCashFlow) {
        const revenue = financialData.income_statements.map(stmt => stmt.revenue);
        const margin = calculateOperatingCashFlowMargin(financialData.cash_flow_statements, revenue);
        if (margin) margins.push({...margin, hidden: false});
    }

    return margins;
}

export function handleMarginToggle(state: ChartStoreState, marginType: MarginType): Partial<ChartStoreState> {
    if (!state.lastFinancialData) return {};

    const newMargins = {
        ...state.margins,
        [marginType]: !state.margins[marginType]
    };

    // Preserve price metric
    const priceMetric = state.selectedMetrics.find(m => m.name === 'Stock Price');

    const baseMetrics = state.selectedMetrics.filter(m => 
        !m.name.includes('Margin') && 
        !['ROIC', 'ROCE', 'ROE', 'ROA', 'Stock Price', 'P/E Ratio'].includes(m.name)
    );

    const marginMetrics = calculateMargins(state.lastFinancialData, {
        ...state,
        margins: newMargins
    });

    return {
        margins: newMargins,
        selectedMetrics: [...baseMetrics, ...marginMetrics, ...(priceMetric ? [priceMetric] : [])]
    };
}
