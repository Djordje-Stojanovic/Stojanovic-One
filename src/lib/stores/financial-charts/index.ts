// Re-export types
export type {
    ChartMetric,
    ChartDataPoint,
    ChartStoreState,
    ChartStoreActions
} from './types/ChartTypes';

// Re-export field name mapping utilities
export {
    getFieldName,
    financialFieldMap
} from './mappings/FieldNameMapping';

// Re-export data processing utilities
export {
    extractMetricData,
    extractSegmentData,
    combineDataSets
} from './utils/DataProcessing';

// Re-export metric calculations
export { createChartMetric } from './metrics/MetricCalculations';

// Re-export margin calculations
export {
    calculateNetIncomeMargin,
    calculateGrossProfitMargin,
    calculateOperatingMargin,
    calculateEBITDAMargin,
    calculateFCFMargin,
    calculateOperatingCashFlowMargin
} from './metrics/margins/Margins';

// Export the store instance
export { chartStore } from './store/ChartStore';
