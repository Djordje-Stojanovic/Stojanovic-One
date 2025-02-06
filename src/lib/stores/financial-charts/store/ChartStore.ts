import { writable } from 'svelte/store';
import type { ChartStoreState, ChartStoreActions } from '../types/ChartTypes';
import type { FinancialData } from '$lib/types/financialStatements';
import { 
    loadShowChart, 
    saveShowChart, 
    loadSelectedMetrics, 
    saveSelectedMetrics, 
    loadSelectedYears, 
    saveSelectedYears 
} from './statePersistence';
import { calculateMargins, handleMarginToggle } from './marginCalculations';
import { calculateReturns, handleReturnToggle } from './returnCalculations';
import { handleMetricVisibility, handleMetricClick } from './metricVisibility';
import { handleValuationToggle } from './valuationHandlers';
import { getFieldName } from '../mappings/FieldNameMapping';
import { extractMetricData, extractSegmentData, combineDataSets } from '../utils/DataProcessing';

function createChartStore(): ChartStoreActions {
    const storedMetricNames = loadSelectedMetrics();
    
    const initialState: ChartStoreState = {
        showChart: loadShowChart(),
        selectedMetrics: [],
        selectedMetricNames: storedMetricNames,
        selectedYears: loadSelectedYears(),
        margins: {
            netIncome: false,
            grossProfit: false,
            operating: false,
            ebitda: false,
            fcf: false,
            operatingCashFlow: false
        },
        returnMetrics: {
            roic: false,
            roce: false,
            roe: false,
            roa: false
        },
        valuationMetrics: {
            pe: false,
            fcfYield: false,
            ps: false,
            evEbitda: false,
            pgp: false,
            pb: false,
            ptb: false
        },
        lastFinancialData: null,
        metricVisibility: {}
    };

    const { subscribe, update } = writable(initialState);

    return {
        subscribe,

        setSelectedYears: (years: number) => update(state => {
            saveSelectedYears(years);
            return { ...state, selectedYears: years };
        }),

        updateMetrics: (financialData: FinancialData) => update(state => {
            if (!financialData) return state;

            // Preserve price metric if it exists
            const priceMetric = state.selectedMetrics.find(m => m.name === 'Stock Price');

            const updatedMetrics = state.selectedMetricNames
                .filter(name => name !== 'Stock Price')
                .map(name => {
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
            const returnMetrics = calculateReturns(financialData, state);
            
            const allMetrics = [
                ...updatedMetrics,
                ...marginMetrics,
                ...returnMetrics,
                ...(priceMetric ? [priceMetric] : [])
            ];

            const hasAnyData = allMetrics.some(m => m.data.length > 0);
            const newState = {
                ...state,
                lastFinancialData: financialData,
                selectedMetrics: allMetrics,
                showChart: hasAnyData
            };

            saveShowChart(newState.showChart);
            saveSelectedMetrics(newState.selectedMetricNames);

            return newState;
        }),

        handleMetricClick: (name: string, values: number[], dates: string[]) => 
            update(state => {
                const changes = handleMetricClick(state, name, values, dates);
                saveShowChart(changes.showChart ?? false);
                saveSelectedMetrics(changes.selectedMetricNames ?? []);
                return { ...state, ...changes };
            }),

        toggleMetricVisibility: (metricName: string) => 
            update(state => {
                const changes = handleMetricVisibility(state, metricName);
                return { ...state, ...changes };
            }),

        toggleMargin: (marginType) => 
            update(state => {
                const changes = handleMarginToggle(state, marginType);
                return { ...state, ...changes };
            }),

        toggleReturnMetric: (returnType) => 
            update(state => {
                const changes = handleReturnToggle(state, returnType);
                return { ...state, ...changes };
            }),

        toggleValuationMetric: (valuationType) => 
            update(state => {
                const changes = handleValuationToggle(state, valuationType);
                return { ...state, ...changes };
            }),

        clearChart: () => update(state => {
            saveShowChart(false);
            saveSelectedMetrics([]);
            return {
                ...state,
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
                returnMetrics: {
                    roic: false,
                    roce: false,
                    roe: false,
                    roa: false
                },
                valuationMetrics: {
                    pe: false,
                    fcfYield: false,
                    ps: false,
                    evEbitda: false,
                    pgp: false,
                    pb: false,
                    ptb: false
                },
                metricVisibility: {}
            };
        })
    };
}

export const chartStore = createChartStore();
