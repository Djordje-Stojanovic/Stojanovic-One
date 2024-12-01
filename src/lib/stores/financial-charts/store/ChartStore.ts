import { writable } from 'svelte/store';
import type { ChartStoreState, ChartStoreActions, MarginType, ChartMetric } from '../types/ChartTypes';
import type { FinancialData } from '$lib/types/financialStatements';
import { loadShowChart, saveShowChart, loadSelectedMetrics, saveSelectedMetrics } from '$lib/components/financials/state/chartState';
import { getFieldName } from '../mappings/FieldNameMapping';
import { extractMetricData, extractSegmentData, combineDataSets } from '../utils/DataProcessing';
import { 
    calculateNetIncomeMargin,
    calculateGrossProfitMargin,
    calculateOperatingMargin,
    calculateEBITDAMargin,
    calculateFCFMargin,
    calculateOperatingCashFlowMargin
} from '../metrics/margins/Margins';

function createChartStore(): ChartStoreActions {
    const storedMetricNames = loadSelectedMetrics();
    
    const initialState: ChartStoreState = {
        showChart: loadShowChart(),
        selectedMetrics: [],
        selectedMetricNames: storedMetricNames,
        margins: {
            netIncome: false,
            grossProfit: false,
            operating: false,
            ebitda: false,
            fcf: false,
            operatingCashFlow: false
        },
        lastFinancialData: null,
        metricVisibility: {}
    };

    const { subscribe, set, update } = writable(initialState);

    function calculateMargins(financialData: FinancialData, state: ChartStoreState): ChartMetric[] {
        const margins: ChartMetric[] = [];

        if (!financialData.income_statements?.length) return margins;

        if (state.margins.netIncome) {
            const margin = calculateNetIncomeMargin(financialData.income_statements);
            if (margin) margins.push({...margin, hidden: false}); // Always visible when enabled
        }

        if (state.margins.grossProfit) {
            const margin = calculateGrossProfitMargin(financialData.income_statements);
            if (margin) margins.push({...margin, hidden: false}); // Always visible when enabled
        }

        if (state.margins.operating) {
            const margin = calculateOperatingMargin(financialData.income_statements);
            if (margin) margins.push({...margin, hidden: false}); // Always visible when enabled
        }

        if (state.margins.ebitda) {
            const margin = calculateEBITDAMargin(financialData.income_statements);
            if (margin) margins.push({...margin, hidden: false}); // Always visible when enabled
        }

        if (state.margins.fcf) {
            const revenue = financialData.income_statements.map(stmt => stmt.revenue);
            const margin = calculateFCFMargin(financialData.cash_flow_statements, revenue);
            if (margin) margins.push({...margin, hidden: false}); // Always visible when enabled
        }

        if (state.margins.operatingCashFlow) {
            const revenue = financialData.income_statements.map(stmt => stmt.revenue);
            const margin = calculateOperatingCashFlowMargin(financialData.cash_flow_statements, revenue);
            if (margin) margins.push({...margin, hidden: false}); // Always visible when enabled
        }

        return margins;
    }

    return {
        subscribe,

        updateMetrics: (financialData: FinancialData) => update(state => {
            if (!financialData) return state;

            state.lastFinancialData = financialData;

            const updatedMetrics = state.selectedMetricNames.map(name => {
                const fieldName = getFieldName(name);

                const incomeData = extractMetricData(financialData.income_statements || [], fieldName);
                const balanceData = extractMetricData(financialData.balance_sheets || [], fieldName);
                const cashFlowData = extractMetricData(financialData.cash_flow_statements || [], fieldName);
                const revenueSegmentsData = extractSegmentData(financialData.revenue_segments, name);
                const geoSegmentsData = extractSegmentData(financialData.revenue_geo_segments, name);

                const metricData = combineDataSets(
                    incomeData, 
                    balanceData, 
                    cashFlowData, 
                    revenueSegmentsData, 
                    geoSegmentsData
                );

                return {
                    name,
                    data: metricData,
                    hidden: !state.metricVisibility[name]
                };
            });

            const marginMetrics = calculateMargins(financialData, state);
            const allMetrics = [...updatedMetrics, ...marginMetrics];

            const hasAnyData = allMetrics.some(m => m.data.length > 0);
            const newState = {
                ...state,
                selectedMetrics: allMetrics,
                showChart: hasAnyData
            };

            saveShowChart(newState.showChart);
            saveSelectedMetrics(newState.selectedMetricNames);

            return newState;
        }),

        handleMetricClick: (name: string, values: number[], dates: string[]) => update(state => {
            const existingIndex = state.selectedMetricNames.indexOf(name);

            if (existingIndex !== -1) {
                const newMetrics = state.selectedMetrics.filter(m => m.name !== name);
                const newMetricNames = state.selectedMetricNames.filter(n => n !== name);
                const newVisibility = { ...state.metricVisibility };
                delete newVisibility[name];
                
                saveShowChart(newMetrics.length > 0);
                saveSelectedMetrics(newMetricNames);

                return {
                    ...state,
                    selectedMetrics: newMetrics,
                    selectedMetricNames: newMetricNames,
                    showChart: newMetrics.length > 0,
                    metricVisibility: newVisibility
                };
            } else {
                const newMetric = {
                    name,
                    data: dates.map((date, i) => ({
                        date,
                        value: values[i]
                    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
                    hidden: false
                };

                const newMetrics = [...state.selectedMetrics, newMetric];
                const newMetricNames = [...state.selectedMetricNames, name];

                saveShowChart(true);
                saveSelectedMetrics(newMetricNames);

                return {
                    ...state,
                    selectedMetrics: newMetrics,
                    selectedMetricNames: newMetricNames,
                    showChart: true,
                    metricVisibility: {
                        ...state.metricVisibility,
                        [name]: true
                    }
                };
            }
        }),

        toggleMetricVisibility: (metricName: string) => update(state => {
            // Only handle visibility for non-margin metrics
            if (!metricName.includes('Margin')) {
                const newVisibility = {
                    ...state.metricVisibility,
                    [metricName]: !state.metricVisibility[metricName]
                };

                const updatedMetrics = state.selectedMetrics.map(metric => {
                    if (metric.name === metricName) {
                        return {
                            ...metric,
                            hidden: !newVisibility[metricName]
                        };
                    }
                    return metric;
                });

                return {
                    ...state,
                    metricVisibility: newVisibility,
                    selectedMetrics: updatedMetrics
                };
            }
            return state;
        }),

        toggleMargin: (marginType: MarginType) => update(state => {
            if (!state.lastFinancialData) return state;

            const newMargins = {
                ...state.margins,
                [marginType]: !state.margins[marginType]
            };

            const baseMetrics = state.selectedMetrics.filter(m => 
                !m.name.includes('Margin')
            );

            const marginMetrics = calculateMargins(state.lastFinancialData, {
                ...state,
                margins: newMargins
            });

            return {
                ...state,
                margins: newMargins,
                selectedMetrics: [...baseMetrics, ...marginMetrics]
            };
        }),

        clearChart: () => {
            saveShowChart(false);
            saveSelectedMetrics([]);
            set({
                showChart: false,
                selectedMetrics: [],
                selectedMetricNames: [],
                margins: {
                    netIncome: false,
                    grossProfit: false,
                    operating: false,
                    ebitda: false,
                    fcf: false,
                    operatingCashFlow: false
                },
                lastFinancialData: null,
                metricVisibility: {}
            });
        }
    };
}

export const chartStore = createChartStore();
