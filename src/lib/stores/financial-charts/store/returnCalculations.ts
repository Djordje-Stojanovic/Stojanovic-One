import type { FinancialData } from '$lib/types/financialStatements';
import type { ChartMetric, ReturnMetricType, ChartStoreState } from '../types/ChartTypes';
import {
    calculateROICMetric,
    calculateROCEMetric,
    calculateROEMetric,
    calculateROAMetric
} from '../metrics/returns/Returns';

export function calculateReturns(financialData: FinancialData, state: ChartStoreState): ChartMetric[] {
    const returns: ChartMetric[] = [];

    if (!financialData.income_statements?.length || !financialData.balance_sheets?.length) return returns;

    if (state.returnMetrics.roic) {
        const metric = calculateROICMetric(financialData.income_statements, financialData.balance_sheets);
        if (metric) returns.push({...metric, hidden: false});
    }

    if (state.returnMetrics.roce) {
        const metric = calculateROCEMetric(financialData.income_statements, financialData.balance_sheets);
        if (metric) returns.push({...metric, hidden: false});
    }

    if (state.returnMetrics.roe) {
        const metric = calculateROEMetric(financialData.income_statements, financialData.balance_sheets);
        if (metric) returns.push({...metric, hidden: false});
    }

    if (state.returnMetrics.roa) {
        const metric = calculateROAMetric(financialData.income_statements, financialData.balance_sheets);
        if (metric) returns.push({...metric, hidden: false});
    }

    return returns;
}

export function handleReturnToggle(state: ChartStoreState, returnType: ReturnMetricType): Partial<ChartStoreState> {
    if (!state.lastFinancialData) return {};

    const newReturnMetrics = {
        ...state.returnMetrics,
        [returnType]: !state.returnMetrics[returnType]
    };

    // Preserve price metric
    const priceMetric = state.selectedMetrics.find(m => m.name === 'Stock Price');

    const baseMetrics = state.selectedMetrics.filter(m => 
        !m.name.includes('Margin') && !['ROIC', 'ROCE', 'ROE', 'ROA', 'Stock Price'].includes(m.name)
    );

    const returnMetrics = calculateReturns(state.lastFinancialData, {
        ...state,
        returnMetrics: newReturnMetrics
    });

    return {
        returnMetrics: newReturnMetrics,
        selectedMetrics: [...baseMetrics, ...returnMetrics, ...(priceMetric ? [priceMetric] : [])]
    };
}
