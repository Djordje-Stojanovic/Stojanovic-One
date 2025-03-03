import type { ChartStoreState, ValuationMetricType } from '../types/ChartTypes';
import { saveSelectedMetrics } from './statePersistence';

const VALUATION_METRIC_NAMES: Record<ValuationMetricType, string> = {
    pe: 'P/E Ratio',
    fcfYield: 'FCF Yield',
    ps: 'P/S Ratio',
    evEbitda: 'EV/EBITDA',
    pgp: 'P/GP Ratio',
    pb: 'P/B Ratio',
    ptb: 'P/Tangible B',
    poi: 'P/Operating Income'
};

export function handleValuationToggle(
    state: ChartStoreState,
    valuationType: ValuationMetricType
): Partial<ChartStoreState> {
    if (!state.lastFinancialData) return {};

    const newValuationMetrics = {
        ...state.valuationMetrics,
        [valuationType]: !state.valuationMetrics[valuationType]
    };

    const metricName = VALUATION_METRIC_NAMES[valuationType];
    if (!metricName) return {};

    // If turning on, add to selectedMetricNames
    // If turning off, remove from selectedMetricNames
    let newMetricNames = [...state.selectedMetricNames];
    if (newValuationMetrics[valuationType]) {
        if (!newMetricNames.includes(metricName)) {
            newMetricNames.push(metricName);
        }
    } else {
        newMetricNames = newMetricNames.filter(name => name !== metricName);
    }

    saveSelectedMetrics(newMetricNames);

    // Update selectedMetrics based on the new metric names
    const updatedMetrics = state.selectedMetrics.filter(m => 
        !Object.values(VALUATION_METRIC_NAMES).includes(m.name) ||
        newMetricNames.includes(m.name)
    );

    return {
        valuationMetrics: newValuationMetrics,
        selectedMetricNames: newMetricNames,
        selectedMetrics: updatedMetrics
    };
}
